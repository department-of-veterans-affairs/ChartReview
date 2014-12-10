/*
 * This is loaded on initial app startup.
 * Also loaded when task is synched.
 */
Ext.define('CR.app.store.AnnotationTaskListStore', {
    extend: 'Ext.data.Store',
    autoLoad: false,
    autoSync: false,
    model: 'CR.app.model.AnnotationTaskListModel', // NEW for annotation nature: new store/grid needs a full model defined now...
    data:{'items': []
    },
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    }
});

