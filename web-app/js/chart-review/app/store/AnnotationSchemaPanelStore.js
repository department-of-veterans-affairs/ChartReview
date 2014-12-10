/*
 * This is loaded when task is selected.
 * XML is obtained thru REST request to Annot.Admin.
 * Thusly obtained XML is refactored into a simpler parent/child relationship where the type of class/attribute/option
 * is an attribute of the leaf.
 */
Ext.define('CR.app.store.AnnotationSchemaPanelStore', {
    fields: [
        'name',
        'color',
        'srcNode',
        'text'
    ],
//    sorters: [{
//        property: 'name',
//        direction: 'ASC'
//    }],
    root: {
        text: 'Schema',
        expanded: true,
        children: []
    }
});

