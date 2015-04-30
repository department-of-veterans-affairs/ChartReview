/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.CanFillAssertionsStore', {

    processNewResult : function (assertionStore, test, result, parentResult) {
        var data            = {
            id                  : result.id,
            
            result              : result,
            
            loaded              : true,
            leaf                : !(result instanceof Siesta.Result.SubTest),
            expanded            : (result instanceof Siesta.Result.SubTest) && result.test.specType != 'it'
        };
        
        var alreadyInTheStore   = assertionStore.getNodeById(result.id)
        
        if (alreadyInTheStore) {
            alreadyInTheStore.triggerUIUpdate()
        } else {
            Ext.suspendLayouts()
            
            alreadyInTheStore   = (assertionStore.getNodeById(parentResult.id) || assertionStore.getRootNode()).appendChild(data);
            
            Ext.resumeLayouts()
        }
        
        if (result.isPassed && !result.isPassed() || result.isWarning) alreadyInTheStore.ensureVisible()
        
        alreadyInTheStore.updateFolderStatus()
    },
    

    // is bubbling and thus triggered for all tests (including sub-tests) 
    processEveryTestEnd : function (assertionStore, test) {
        var testResultNode  = assertionStore.getNodeById(test.getResults().id)
        
        // can be missing for "root" tests
        testResultNode && testResultNode.updateFolderStatus()
    }
})
