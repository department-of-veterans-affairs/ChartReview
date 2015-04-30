StartTest(function (t) {

    t.expectGlobal('MyModel');

    Ext.define('MyModel', {
        extend : 'Ext.data.Model',
        fields : [
            'id',
            'name',
            'age'
        ]
    });

    Ext.ux.ajax.SimManager.init({
        delay : 100
    }).register(
        {
            '/app/data/url' : {
                stype : 'json',  // use JsonSimlet (stype is like xtype for components)
                data  : [
                    { id : 1, name : 'Mike', age : 25 },
                    { id : 2, name : 'Anna', age : 35 },
                    { id : 3, name : 'Doug', age : 45 }
                ]
            }
        }
    );

    var store = new Ext.data.Store({
        model : 'MyModel',

        proxy : {
            type : 'ajax',
            url  : '/app/data/url' // doesn't exist
        }
    });

    t.willFireNTimes(store, 'load', 1);

    t.it('should be possible to load mock data', function (t) {
        t.loadStoresAndThen(store, function () {
            t.expect(store.first().get('id')).toBe(1);
            t.expect(store.first().get('name')).toBe('Mike');
            t.expect(store.getAt(1).get('id')).toBe(2);
            t.expect(store.getAt(1).get('name')).toBe('Anna');
            t.expect(store.getAt(2).get('id')).toBe(3);
            t.expect(store.getAt(2).get('name')).toBe('Doug');
        });
    });
});