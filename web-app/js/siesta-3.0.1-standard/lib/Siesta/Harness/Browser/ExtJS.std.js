/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
// FIXME attribute override does not work for some reason
Siesta.Harness.Browser.ExtJS.my.coverageUnit    = 'extjs_class'

Siesta.Harness.Browser.ExtJS.getLoaderInstrumentationHook = function () {
    return this.my.getLoaderInstrumentationHook.apply(this.my, arguments)
}