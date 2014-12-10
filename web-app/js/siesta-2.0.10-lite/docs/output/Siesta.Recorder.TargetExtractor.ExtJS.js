Ext.data.JsonP.Siesta_Recorder_TargetExtractor_ExtJS({"tagname":"class","name":"Siesta.Recorder.TargetExtractor.ExtJS","autodetected":{},"files":[{"filename":"ExtJS.js","href":"ExtJS.html#Siesta-Recorder-TargetExtractor-ExtJS"}],"members":[],"alternateClassNames":[],"aliases":{},"id":"class-Siesta.Recorder.TargetExtractor.ExtJS","short_doc":"To resolve a component, this is done in the following prio list\n\n\nCustom (non-auto-gen Id, client provided)\nCustom fi...","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/ExtJS.html#Siesta-Recorder-TargetExtractor-ExtJS' target='_blank'>ExtJS.js</a></div></pre><div class='doc-contents'><p>To resolve a component, this is done in the following prio list</p>\n\n<ol>\n<li>Custom (non-auto-gen Id, client provided)</li>\n<li>Custom field property (see componentIdentifier). User provides button with \"foo : 'savebutton'\", possibly add CSS selector</li>\n<li>Custom xtype, user provides subclassed button for example, possibly combined with CSS selector (composite query)</li>\n<li>For components, add some intelligence, user generated CSS properties win over Ext CSS properties\n3a. Buttons could look for iconCls, text etc\n3b. Menuitems same thing\n3c. Grids and lists provide nth-child to know which position in the list\n3d. Find extra non Ext classes (they start with \"x-\"), which of course have been put there by client</li>\n<li>CSS selector (class names, nodeName DIV etc)</li>\n<li>Coordinates</li>\n</ol>\n\n\n<p>The type of target, possible options:</p>\n\n<ul>\n<li>'cq'      component query</li>\n<li>'csq'     composite query</li>\n</ul>\n\n</div><div class='members'></div></div>","meta":{}});