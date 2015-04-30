/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define('Siesta.Harness.Browser.UI.TreeFilterField', {
    extend : 'Ext.form.field.Text',
    alias  : 'widget.treefilter',

    filterGroups : false,
    cls          : 'filterfield',

    store : null,

    filterField : 'text',

    hasAndCheck     : null,
    andChecker      : null,
    andCheckerScope : null,

    triggerLeafCls  : 'icon-file-2',
    triggerGroupCls : 'icon-folder',
    tipText         : null,

    constructor : function (config) {
        var me = this;

        Ext.apply(config, {
            triggers : {
                clear : {
                    cls     : 'icon-close',
                    handler : function () {
                        me.store.clearTreeFilter()
                        me.reset()
                    }
                },

                leafOrGroup : {
                    cls     : me.triggerLeafCls,
                    handler : function () {
                        me.setFilterGroups(!me.getFilterGroups())
                    }
                }
            },

            listeners : {
                change     : {
                    fn         : this.onFilterChange,
                    buffer     : 400,
                    scope      : this
                },

                specialkey : this.onFilterSpecialKey,
                scope      : this
            }
        })

        this.callParent(arguments);
    },


    afterRender : function () {
        this.callParent(arguments)

        this.tipText && this.inputEl.set({ title : this.tipText })

        if (this.filterGroups) {
            this.triggerEl.item(1).addCls(this.triggerGroupCls)
            this.triggerEl.item(1).removeCls(this.triggerLeafCls)
        }
    },


    onFilterSpecialKey : function (field, e, t) {
        if (e.keyCode === e.ESC) {
            this.store.clearTreeFilter()
            field.reset();
        }
    },


    setFilterGroups : function (value) {
        if (value != this.filterGroups) {
            this.filterGroups = value

            if (this.rendered) {
                var el = this.triggerEl.item(1)

                if (value) {
                    el.addCls(this.triggerGroupCls)
                    el.removeCls(this.triggerLeafCls)
                } else {
                    el.removeCls(this.triggerGroupCls)
                    el.addCls(this.triggerLeafCls)
                }
            }

            this.refreshFilter()

            this.fireEvent('filter-group-change', this)
        }
    },


    getFilterGroups : function () {
        return this.filterGroups
    },


    refreshFilter : function () {
        this.onFilterChange(this, this.getValue())
    },
    
    
    // split term by | first, then by whitespace
    splitTermByPipe : function (term) {
        var parts           = term.split(/\s*\|\s*/);
        var regexps         = []

        for (var i = 0; i < parts.length; i++) {
            // ignore empty
            if (parts[ i ]) {
                regexps.push(
                    Ext.Array.map(parts[ i ].split(/\s+/), function (token) {
                        return new RegExp(Ext.String.escapeRegex(token), 'i')
                    })
                )
            }
        }
        
        return regexps
    },
    
    
    matchAnyOfRegExps : function (string, regexps) {
        for (var p = 0; p < regexps.length; p++) {
            var groupMatch  = true
            var len         = regexps[ p ].length

            // blazing fast "for" loop! :)
            for (var i = 0; i < len; i++)
                if (!regexps[ p ][ i ].test(string)) {
                    groupMatch = false
                    break
                }

            if (groupMatch) return true
        }
        
        return false
    },


    onFilterChange : function (field, filterValue) {
        if (filterValue || this.hasAndCheck && this.hasAndCheck()) {
            var fieldName       = this.filterField

            var parts, groupFilter
            var filterGroups    = this.filterGroups
            
            if (!filterGroups) {
                parts           = filterValue.split(/\s*\>\s*/)
                groupFilter     = parts.length > 1 ? parts[ 0 ] : ''
                filterValue     = parts.length > 1 ? parts[ 1 ] : parts[ 0 ]
            }

            parts               = filterValue.split(/\s*\|\s*/);
            
            var testFilterRegexps   = this.splitTermByPipe(filterValue)
            var groupFilterRegexps  = groupFilter ? this.splitTermByPipe(groupFilter) : null
            
            var andChecker          = this.andChecker
            var andCheckerScope     = this.andCheckerScope || this
            
            var me                  = this

            this.store.filterTreeBy({
                filter               : function (node) {
                    if (andChecker && !andChecker.call(andCheckerScope, node)) return false

                    if (!filterGroups && groupFilter) {
                        var currentNode     = node
                        var isInGroup       = false

                        while (currentNode && currentNode.parentNode) {
                            var parent      = currentNode.parentNode

                            if (me.matchAnyOfRegExps(parent.get(fieldName), groupFilterRegexps)) {
                                isInGroup   = true
                                break
                            }

                            currentNode     = parent
                        }

                        if (!isInGroup) return false
                    }

                    var title   = node.get(fieldName)
                    
                    if (me.matchAnyOfRegExps(title, testFilterRegexps)) return true

                    // if there's no name filtering testFilterRegexps - return true (show all elements)
                    return !testFilterRegexps.length
                },
                fullMatchingParents : filterGroups
            })
        } else {
            this.store.clearTreeFilter()
        }
    }
})
