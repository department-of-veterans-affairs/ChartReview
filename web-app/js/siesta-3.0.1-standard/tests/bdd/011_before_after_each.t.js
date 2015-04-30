StartTest(function (topTest) {
    var log     = []
    
    topTest.testGeneric({ doNotTranslate : true }, function (t) {
        log.push('SpecRoot')
        
        t.beforeEach(function () {
            log.push('SpecRoot-beforeEach1')
        })
        
        t.beforeEach(function (done) {
            setTimeout(function () {
                log.push('SpecRoot-beforeEach2')
                done()
            }, 100)
        }, true)
        
        t.afterEach(function () {
            log.push('SpecRoot-afterEach')
        })
        
        t.afterEach(function () {
            log.push('SpecRoot-afterEach2')
        })
        
        t.it("Root->Spec1", function (t) {
            log.push('Root->Spec1')
            
            t.beforeEach(function () {
                log.push('Spec1-beforeEach')
            })
            
            t.afterEach(function () {
                log.push('Spec1-afterEach')
            })
            
            t.it('Root->Spec1->Spec11', function (t) {
                log.push('Root->Spec1->Spec11')
            })
        })
        
        t.describe("Root->Spec2", function (t) {
            log.push('Root->Spec2')
            
            t.afterEach(function (done) {
                setTimeout(function () {
                    log.push('Spec2-afterEach')
                    done()
                }, 100)
            }, true)
            
            t.it('Root->Spec2->Spec21', function (t) {
                log.push('Root->Spec2->Spec21')
            })
        })
    }, function () {
        
        topTest.isDeeply(log, 
            [
                'SpecRoot',
                    'SpecRoot-beforeEach1',
                    'SpecRoot-beforeEach2',
                    'Root->Spec1',
                        'SpecRoot-beforeEach1',
                        'SpecRoot-beforeEach2',
                        'Spec1-beforeEach',
                        'Root->Spec1->Spec11',
                        'Spec1-afterEach',
                        'SpecRoot-afterEach2',
                        'SpecRoot-afterEach',
                    'SpecRoot-afterEach2',
                    'SpecRoot-afterEach',
        
                    // Note, that "describe" sections does not trigger "beforeEach/afterEach"
                    'Root->Spec2',
                        'SpecRoot-beforeEach1',
                        'SpecRoot-beforeEach2',
                        'Root->Spec2->Spec21',
                        'Spec2-afterEach',
                        'SpecRoot-afterEach2',
                        'SpecRoot-afterEach',
            ], 
            'Correctly called all before/after actions'
        )
    })
    // eof testGeneric
})    
