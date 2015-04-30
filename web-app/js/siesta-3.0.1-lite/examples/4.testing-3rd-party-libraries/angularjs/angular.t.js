describe("Hello world with Angular", function (t) {

    // Slight adaption for NgMock
    initMock(
        function () {
            t.beforeEach.apply(t, arguments);
        },
        function () {
            t.afterEach.apply(t, arguments);
        }
    )

    var Person;
    t.beforeEach(module('myApp'));
    t.beforeEach(inject(function (_Person_) {
        Person = _Person_;
    }));

    t.it('assigns a name', function (t) {
        t.expect(new Person('Ben').name).toBe('Ben');
    });
});