describe('isElementVisible', function (t) {
    
    t.it('Should correctly detect an SVG element as the top element', function(t) {
        if (Ext.supports.Svg) {
            document.body.innerHTML = '<svg><circle id="circle" cx="50" cy="50" r="40" stroke="red" fill="blue" stroke-width="4"></circle></svg>';
            var circle = document.getElementById('circle');

            t.ok(t.isElementVisible(circle), 'Should handle SVG')

            circle.style.display = 'none';
            t.notOk(t.isElementVisible(document.getElementById('circle')), 'Should handle hidden SVG')
        }
    })
    
    
    t.it('Should not filter our non-visible elements for `isElementVisible`', function(t) {
        var panel1      = new Ext.panel.Panel({
            title       : 'Title1',
            
            width       : 300,
            height      : 150,
            hidden      : true,
            
            renderTo    : Ext.getBody()
        })
        
        var panel2      = new Ext.panel.Panel({
            title       : 'Title2',
            
            width       : 300,
            height      : 150,
            
            renderTo    : Ext.getBody()
        })
        
        t.elementIsNotVisible('>>panel', "Should indicate that 1st panel is not visible")
        
    })
    
});

