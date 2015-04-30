StartTest(function(t) {
    
    var range       = new My.Model.Range({
        StartDate       : new Date(2013, 1, 1),
        EndDate         : new Date(2013, 1, 10)
    })
    
    t.is(range.getStartDate(), new Date(2013, 1, 1), "Calling `getStartDate` w/o format returns raw date")
    t.is(range.getStartDate('Y'), '2013', "Calling `getStartDate` w/ format returns formatted string")

    //t.is(range.getEndDate('Y-m'), '2013-02', 'getEndDate works fine')
})    
