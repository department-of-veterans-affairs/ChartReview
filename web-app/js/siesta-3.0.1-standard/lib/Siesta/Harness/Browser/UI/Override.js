/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
// Exceptions happening in grid cell rendering should not be silenced
Ext.XTemplate.override({
    strict   : true
});


// Override to allow report to fetch the data from file system
// http://www.sencha.com/forum/showthread.php?10621-Why-Ajax-can-not-get-local-file-while-prototypejs-can&s=3ce6b6ad58be217b173c3b31b8f0ad5d
Ext.data.Connection.override({

    parseStatus : function (status) {
        var result = this.callOverridden(arguments);
        if (status === 0) {
            result.success = true;
        }
        return result;
    }
});