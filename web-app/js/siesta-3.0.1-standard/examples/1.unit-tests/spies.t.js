StartTest(function (t) {

    t.diag("Should be able to create a spy");

    var spy = t.createSpy('007')

    spy()
    spy(0, 1)
    spy(0, 1, '1')

    t.expect(spy).toHaveBeenCalled()
    t.expect(spy).toHaveBeenCalledWith(0, t.any(Number), t.any(String))

    t.is(spy.calls.any(), true)
    t.is(spy.calls.count(), 3)

    spy.calls.reset()

    t.is(spy.calls.any(), false)
    t.is(spy.calls.count(), 0)
});