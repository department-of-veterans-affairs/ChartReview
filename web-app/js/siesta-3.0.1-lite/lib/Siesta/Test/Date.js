/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.Date

A mixin with the additinal assertions for dates. Being consumed by {@link Siesta.Test}

*/
Role('Siesta.Test.Date', {
    
    methods : {
        
        isDateEq: function (got, expectedDate, description) {
            this.isDateEqual.apply(this, arguments);
        },

        
        /**
         * This assertion passes when the 2 provided dates are equal and fails otherwise.
         * 
         * It has a synonym: `isDateEq`
         * 
         * @param {Date} got The 1st date to compare
         * @param {Date} expectedDate The 2nd date to compare
         * @param {String} [description] The description of the assertion
         */
        isDateEqual: function (got, expectedDate, description) {
            var R = Siesta.Resource('Siesta.Test.Date');

            if (got - expectedDate === 0) {
                this.pass(description, {
                    descTpl         : '{got} ' + R.get('isEqualTo') + ' {expectedDate}',
                    got             : got,
                    expectedDate    : expectedDate
                });
            } else {
                this.fail(description, {
                    assertionName   : 'isDateEqual',
                    
                    got             : got ? got.toString() : '',
                    gotDesc         : R.get('Got'),
                    
                    need            : expectedDate.toString()
                });
            }
        }
    }
});
