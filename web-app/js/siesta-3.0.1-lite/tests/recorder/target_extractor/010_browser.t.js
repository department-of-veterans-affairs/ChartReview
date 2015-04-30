StartTest(function (t) {

    t.it('Extracting css query should work', function (t) {
        document.body.innerHTML = 
            '<div id="foo"><p class="bar">Some text</p></div>' + 
            '<div><div><p class="baz">Some text</p></div></div>'+ 
            '<div class="blarg"><div class="quix"><p class="baz">Some text</p></div></div>'
        
        var extractor       = new Siesta.Recorder.TargetExtractor()
        
        t.is(extractor.findDomQueryFor(document.getElementsByClassName('bar')[ 0 ]).query, '#foo .bar', 'The #id selector is always included, even when redundant')
        t.is(extractor.findDomQueryFor(document.getElementsByClassName('baz')[ 0 ]).query, '.baz', 'Correct css query found')
        t.is(extractor.findDomQueryFor(document.getElementsByClassName('baz')[ 1 ]).query, '.quix .baz', '"blarg" class is not required and not included, because "quix + baz is specific enough')
    });
    
    t.it('Extracting css query should work', function (t) {
        document.body.innerHTML =
            '<div class="blarg"><div class="quix"><p class="baz">Some text</p></div></div><div class="quix"><p class="baz">Some text</p></div>'
        
        var extractor       = new Siesta.Recorder.TargetExtractor()
        
        t.is(extractor.findDomQueryFor(document.getElementsByClassName('baz')[ 0 ]).query, '.blarg .quix .baz', 'This time "blarg" class is required')
    });
    
    t.it('For most-specific level tag name should be used if specific css classes are available', function (t) {
        document.body.innerHTML =
            '<div class="blarg"><div class="quix"><p>Some text</p></div></div><p>Other text</p>'
        
        var extractor       = new Siesta.Recorder.TargetExtractor()
        
        t.is(extractor.findDomQueryFor(document.getElementsByTagName('p')[ 0 ]).query, '.quix p', 'Correct dom query found, "blarg" class is not required')
    });    
    
})