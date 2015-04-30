StartTest(function(t) {
    
    t.testExtJS(function (t) {
        
        t.describe('Spy executing strategies', function (t) {
            var obj
            
            t.beforeEach(function () {
                obj     = {
                    someProp            : null,
                    setSomeProp         : function (value) { this.someProp = value; return this }
                }
            })
            
            
            t.it("Spy should track the calls to it", function (t) {
                t.spyOn(obj, 'setSomeProp')
                
                obj.setSomeProp()
                obj.setSomeProp(0, 1, 1)
                obj.setSomeProp(0, 1)
                
                t.expect(obj.setSomeProp).toHaveBeenCalled()
                t.expect(obj.setSomeProp).toHaveBeenCalledWith(0, 1, t.any(Number))
                
                t.is(obj.someProp, null, "`someProp` hasn't change")
                
                t.isInstanceOf(obj.setSomeProp.and, Siesta.Test.BDD.Spy)
                
                t.is(obj.setSomeProp.calls.any(), true)
                t.is(obj.setSomeProp.calls.count(), 3)
                t.isDeeply(obj.setSomeProp.calls.argsFor(2), [ 0, 1 ])
                t.isDeeply(obj.setSomeProp.calls.allArgs(), [ [], [ 0, 1, 1], [ 0, 1 ] ])
                t.isDeeply(obj.setSomeProp.calls.mostRecent(), { object : obj, args : [ 0, 1 ], returnValue : undefined })
                t.isDeeply(obj.setSomeProp.calls.first(), { object : obj, args : [], returnValue : undefined })
                
                obj.setSomeProp.calls.reset()
                
                t.is(obj.setSomeProp.calls.any(), false)
                t.is(obj.setSomeProp.calls.count(), 0)
            });
    
            
            t.it("Spy should be able to call through and stub", function (t) {
                t.spyOn(obj, 'setSomeProp').callThrough()
                
                obj.setSomeProp(1)
                
                t.expect(obj.setSomeProp).toHaveBeenCalled()
                
                t.is(obj.someProp, 1, "`someProp` has changed")
                
                obj.setSomeProp.and.stub()
                
                obj.setSomeProp(11)
                
                t.is(obj.someProp, 1, "`someProp` hasn't changed")
            });
            
            
            t.it("Spy should be able to call fake", function (t) {
                t.spyOn(obj, 'setSomeProp').callFake(function () { this.someProp = 11; return 'fake' })
                
                t.is(obj.setSomeProp(1), 'fake', 'Return value from fake function')
                
                t.expect(obj.setSomeProp).toHaveBeenCalledWith(1)
                
                t.is(obj.someProp, 11, "`someProp` has been changed by the fake function")
            });
            
            
            t.it("Spy should be able to throw", function (t) {
                t.spyOn(obj, 'setSomeProp').throwError('wrong')
                
                t.expect(function () {
                    obj.setSomeProp(1)
                }).toThrow()
            });
            
            
            t.it("Spy should be able to return value", function (t) {
                t.spyOn(obj, 'setSomeProp').returnValue(11)
                
                t.is(obj.setSomeProp(1), 11, "`someProp` has been changed by the fake function")
                t.is(obj.someProp, null, "`someProp` hasn't change")
            });
        })
        
        
        t.describe('Standalone spies', function (t) {
            
            t.it("Should be able to create a spy", function (t) {
                var spy     = t.createSpy('007')
                
                spy()
                spy(0, 1)
                spy(0, 1, '1')
                
                t.expect(spy).toHaveBeenCalled()
                t.expect(spy).toHaveBeenCalledWith(0, t.any(Number), t.any(String))
                
                t.isInstanceOf(spy.and, Siesta.Test.BDD.Spy)
                
                t.is(spy.calls.any(), true)
                t.is(spy.calls.count(), 3)
                
                spy.calls.reset()
                
                t.is(spy.calls.any(), false)
                t.is(spy.calls.count(), 0)
            })
            
            t.it("Should be able to create a spy object", function (t) {
                var spyObj  = t.createSpyObj('007', [ 'shoot', 'seduce'])
                
                t.isDeeply(spyObj, { shoot : t.any(Function), seduce : t.any(Function) })
                
                spyObj.shoot('gun')
                spyObj.seduce('Girl1')
                spyObj.seduce('Girl2')
                
                t.expect(spyObj.shoot).toHaveBeenCalledWith('gun')
                t.expect(spyObj.seduce).toHaveBeenCalledWith('Girl1')
                t.expect(spyObj.seduce).toHaveBeenCalledWith('Girl2')
            })            
        })
        
        
        t.describe('Spies removal after the spec', function (t) {
            var obj     = {
                someProp            : null,
                setSomeProp         : function (value) { this.someProp = value; return this }
            }
            
            t.it("Setting up the spy", function (t) {
                var spy     = t.spyOn(obj, 'setSomeProp')
                
                obj.setSomeProp()
                obj.setSomeProp(0, 1, '1')
                obj.setSomeProp(0, '1')
                
                t.is(obj.someProp, null, "`someProp` hasn't change")
                
                t.expect(spy).toHaveBeenCalled()
                t.expect(spy).toHaveBeenCalledWith(0, t.any(Number), t.any(String))
            })
            
            t.it("Spy should be removed in this spec", function (t) {
                obj.setSomeProp(0)
                
                t.is(obj.someProp, 0, "`someProp` has change - spy has been removed")
                
                t.notOk(obj.setSomeProp.__SIESTA_SPY__, "Spy has been removed from object")
            })            
        })
    })
});