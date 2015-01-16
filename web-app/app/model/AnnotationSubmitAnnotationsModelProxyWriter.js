Ext.define('CR.app.model.AnnotationSubmitAnnotationsModelProxyWriter', {
    alias: 'writer.annotationsubmitannotationsmodelproxywriter',
    extend: 'Ext.data.writer.Json',
    writeAllFields: true,
    documentRoot: 'annotations',
    record: 'annotation',
    /*
     * This function overrides the default implementation of json writer. Any hasMany relationships will be submitted
     * as nested objects.
     */
    getRecordData: function(record) {
        //Setup variables
        var me = this, i, association, childStore, data = record.data;

        //Iterate over all the hasMany associations
        for (i = 0; i < record.associations.length; i++) {
            association = record.associations.get(i);
            data[association.name] = null;
            childStore = record[association.storeName];

            if(childStore)
            {
                //Iterate over all the children in the current association
                childStore.each(function(childRecord) {

                    if (!data[association.name]){
                        data[association.name] = [];
                    }

                    //Recursively get the record data for children (depth first)
                    var childData = this.getRecordData.call(this, childRecord);

                    if ((childData != null)){
                        data[association.name].push(childData);
                    }
                }, me);
            }
        }

        return data;
    },
    writeRecords: function(request, data) {
        var toXml = function(v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
                for (var i=0, n=v.length; i<n; i++)
                    xml += ind + toXml(v[i], name, ind+"\t") + "\n";
            }
            else if (typeof(v) == "object") {
                var hasChild = false;
                if(name.length > 0)
                {
                    xml += ind + "<" + name;
                }
                else
                {
                    xml += ind;
                }
                for (var m in v) {
                    if (m.charAt(0) == "@" && typeof(v[m]) != 'undefined')
                        xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                    else
                        hasChild = true;
                }
                if(name.length > 0)
                {
                    xml += hasChild ? ">" : "/>";
                }
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += v[m];
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, ind+"\t");
                    }
                    if(name.length > 0)
                    {
                        xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
                    }
                    else
                    {
                        xml += (xml.charAt(xml.length-1)=="\n"?ind:"");
                    }
                }
            }
            else if( v != null && typeof(v) != 'undefined') {
                if(name.length > 0)
                {
                    xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
                }
                else
                {
                    xml += ind + v.toString();
                }
            }
            return xml;
        }, xml="";
        xml += toXml(data, "", "");
        // ALTERNATIVE ALGORITHM - works - more readable?  It currently puts a "0" tag around the output...
//                var toXml = function(json) {
//                    if (typeof json !== "object") return null;
//                    var cloneNS = function(ns) {
//                        var nns = {};
//                        for (var n in ns) {
//                            if (ns.hasOwnProperty(n)) {
//                                nns[n] = ns[n];
//                            }
//                        }
//                        return nns;
//                    };
//                    var processLeaf = function(lname, child, ns) {
//                        var body = "";
//                        if (child instanceof Array) {
//                            for (var i = 0; i < child.length; i++) {
//                                body += processLeaf(lname, child[i], cloneNS(ns));
//                            }
//                            return body;
//                        } else if (typeof child === "object") {
//                            var el = "<" + lname;
//                            var attributes = "";
//                            var text = "";
//                            if (child["@xmlns"]) {
//                                var xmlns = child["@xmlns"];
//                                for (var prefix in xmlns) {
//                                    if (xmlns.hasOwnProperty(prefix)) {
//                                        if (prefix === "$") {
//                                            if (ns[prefix] !== xmlns[prefix]) {
//                                                attributes += " " + "xmlns=\"" + xmlns[prefix] + "\"";
//                                                ns[prefix] = xmlns[prefix];
//                                            }
//                                        } else if (!ns[prefix] || (ns[prefix] !== xmlns[prefix])) {
//                                            attributes += " xmlns:" + prefix + "=\"" + xmlns[prefix] + "\"";
//                                            ns[prefix] = xmlns[prefix];
//                                        }
//                                    }
//                                }
//                            }
//                            for (var key in child) {
//                                if (child.hasOwnProperty(key) && key !== "@xmlns") {
//                                    var obj = child[key];
//                                    if (key === "$") {
//                                        text += obj;
//                                    } else if (key.indexOf("@") === 0) {
//                                        attributes += " " + key.substring(1) + "=\"" + obj + "\"";
//                                    } else {
//                                        body += processLeaf(key, obj, cloneNS(ns));
//                                    }
//                                }
//                            }
//                            body = text + body;
//                            return (body !== "") ? el + attributes + ">" + body + "</" + lname + ">" : el + attributes + "/>"
//                        }
//                    };
//                    for (var lname in json) {
//                        if (json.hasOwnProperty(lname) && lname.indexOf("@") == -1) {
//                            return processLeaf(lname, json[lname], {});
//                        }
//                    }
//                    return null;
//                }, xml="";
        var tab = false
        var xmlData = tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
        request.setXmlData(xmlData);
        return request;
    }
});
