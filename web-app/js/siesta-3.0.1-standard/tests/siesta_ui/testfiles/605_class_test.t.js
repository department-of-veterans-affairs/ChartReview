describe("myName", function (t) {

    var theAwesome = new My.awesome.Class();

    t.is(theAwesome.getFoo(), 'bar');
    
    var theAwesome2 = new My.awesome.Class2();
    
    t.is(theAwesome2.getFoo(), 'bar');
    theAwesome2.setFoo('foo')

})
