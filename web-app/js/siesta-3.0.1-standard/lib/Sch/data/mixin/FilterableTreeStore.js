/*

Siesta 3.0.1
Copyright(c) 2009-2015 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
Ext.define("Sch.data.mixin.FilterableTreeStore", {

    isFilteredFlag                      : false,
    isHiddenFlag                        : false,

    // ref to the last filter applied
    lastTreeFilter                      : null,
    lastTreeHiding                      : null,

    /**
     * @cfg {Boolean} allowExpandCollapseWhileFiltered When enabled (by default), tree store allows user to expand/collapse nodes while it is
     * filtered with the {@link #filterTreeBy} method. Please set it explicitly to `false` to restore the previous behavior,
     * where collapse/expand operations were disabled.
     */
    allowExpandCollapseWhileFiltered    : true,

    /**
     * @cfg {Boolean} reApplyFilterOnDataChange When enabled (by default), tree store will update the filtering (both {@link #filterTreeBy}
     * and {@link #hideNodesBy}) after new data is added to the tree or removed from it. Please set it explicitly to `false` to restore the previous behavior,
     * where this feature did not exist.
     */
    reApplyFilterOnDataChange           : true,

    suspendIncrementalFilterRefresh     : 0,

    filterGeneration                    : 0,
    currentFilterGeneration             : null,

    dataChangeListeners                 : null,
    monitoringDataChange                : false,

    onClassMixedIn : function (cls) {
        cls.override(Sch.data.mixin.FilterableTreeStore.prototype.inheritables() || {});
    },

    // Events (private)
    //    'filter-set',
    //    'filter-clear',
    //    'nodestore-datachange-start',
    //    'nodestore-datachange-end'

    /**
     * Should be called in the constructor of the consuming class, to activate the filtering functionality.
     */
    initTreeFiltering : function () {
        this.treeFilter = new Ext.util.Filter({
            filterFn    : this.isNodeFilteredIn,
            scope       : this
        });

        this.dataChangeListeners    = {
            nodeappend  : this.onNeedToUpdateFilter,
            nodeinsert  : this.onNeedToUpdateFilter,

            scope       : this
        };
    },

    startDataChangeMonitoring : function () {
        if (this.monitoringDataChange) return;

        this.monitoringDataChange   = true;

        this.on(this.dataChangeListeners);
    },


    stopDataChangeMonitoring : function () {
        if (!this.monitoringDataChange) return;

        this.monitoringDataChange   = false;

        this.un(this.dataChangeListeners);
    },


    onNeedToUpdateFilter : function () {
        if (this.reApplyFilterOnDataChange && !this.suspendIncrementalFilterRefresh) this.reApplyFilter();
    },


    /**
     * Clears the current filter (if any).
     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     */
    clearTreeFilter : function () {
        if (!this.isTreeFiltered()) return;

        this.currentFilterGeneration = null;
        this.isFilteredFlag     = false;
        this.lastTreeFilter     = null;

        if (!this.isTreeFiltered(true)) this.stopDataChangeMonitoring();

        this.refreshNodeStoreContent();

        this.fireEvent('filter-clear', this);
    },


    reApplyFilter : function () {
        // bypass the nodeStore content refresh if store has both hiding and filtering
        if (this.isHiddenFlag) this.hideNodesBy.apply(this, this.lastTreeHiding.concat(this.isFilteredFlag));

        if (this.isFilteredFlag) this.filterTreeBy(this.lastTreeFilter);
    },


    refreshNodeStoreContent : function () {
        var me      = this,
            filters = me.getFilters();

        if (filters.indexOf(me.treeFilter) < 0) {
            me.addFilter(me.treeFilter);
        } else {
            this.getFilters().fireEvent('endupdate', this.getFilters());
        }
    },


    getIndexInTotalDataset : function (record) {
        var root            = this.getRootNode(),
            index           = -1;

        var rootVisible     = this.rootVisible;

        if (!rootVisible && record == root) return -1;

        var isFiltered      = this.isTreeFiltered();
        var currentFilterGeneration = this.currentFilterGeneration;

        var collectNodes    = function (node) {
            if (isFiltered && node.__filterGen != currentFilterGeneration || node.hidden)
            // stop scanning if record we are looking for is hidden
                if (node == record) return false;

            if (rootVisible || node != root) index++;

            // stop scanning if we found the record
            if (node == record) return false;

            if (!node.data.leaf && node.isExpanded()) {
                var childNodes  = node.childNodes,
                    length      = childNodes.length;

                for (var k = 0; k < length; k++)
                    if (collectNodes(childNodes[ k ]) === false) return false;
            }
        };

        collectNodes(root);

        return index;
    },

    /**
     * Returns true if this store is currently filtered
     *
     * @return {Boolean}
     */
    isTreeFiltered : function (orHasHiddenNodes) {
        return this.isFilteredFlag || orHasHiddenNodes && this.isHiddenFlag;
    },

    markFilteredNodes : function (top, params) {
        var me                  = this;
        var filterGen           = this.currentFilterGeneration;
        var visibleNodes        = {};

        var root                = this.getRootNode(),
            rootVisible         = this.rootVisible;

        var includeParentNodesInResults = function (node) {
            var parent  = node.parentNode;

            while (parent && !visibleNodes[ parent.internalId ]) {
                visibleNodes[ parent.internalId ] = true;

                parent = parent.parentNode;
            }
        };

        var filter                  = params.filter;
        var scope                   = params.scope || this;
        var shallowScan             = params.shallow;
        var checkParents            = params.checkParents || shallowScan;
        var fullMatchingParents     = params.fullMatchingParents;
        var onlyParents             = params.onlyParents || fullMatchingParents;

        if (onlyParents && checkParents) throw new Error("Can't combine `onlyParents` and `checkParents` options");

        if (rootVisible) visibleNodes[ root.internalId ] = true;

        var collectNodes    = function (node) {
            if (node.hidden) return;

            var nodeMatches, childNodes, length, k;

            // `collectNodes` should not be called for leafs at all
            if (node.data.leaf) {
                if (filter.call(scope, node, visibleNodes)) {
                    visibleNodes[ node.internalId ] = true;

                    includeParentNodesInResults(node);
                }
            } else {
                if (onlyParents) {
                    nodeMatches     = filter.call(scope, node);

                    childNodes      = node.childNodes;
                    length          = childNodes.length;

                    if (nodeMatches) {
                        visibleNodes[ node.internalId ] = true;

                        includeParentNodesInResults(node);

                        // if "fullMatchingParents" option enabled we gather all matched parent's sub-tree
                        if (fullMatchingParents) {
                            node.cascadeBy(function (currentNode) {
                                visibleNodes[ currentNode.internalId ] = true;
                            });

                            return;
                        }
                    }

                    // at this point nodeMatches and fullMatchingParents can't be both true
                    for (k = 0; k < length; k++)
                        if (nodeMatches && childNodes[ k ].data.leaf)
                            visibleNodes[ childNodes[ k ].internalId ] = true;
                        else if (!childNodes[ k ].data.leaf)
                            collectNodes(childNodes[ k ]);

                } else {
                    // mark matching nodes to be kept in results
                    if (checkParents) {
                        nodeMatches = filter.call(scope, node, visibleNodes);

                        if (nodeMatches) {
                            visibleNodes[ node.internalId ] = true;

                            includeParentNodesInResults(node);
                        }
                    }

                    // recurse if
                    // - we don't check parents
                    // - shallow scan is not enabled
                    // - shallow scan is enabled and parent node matches the filter or it does not, but its and invisible root, so we don't care
                    if (!checkParents || !shallowScan || shallowScan && (nodeMatches || node == root && !rootVisible)) {
                        childNodes      = node.childNodes;
                        length          = childNodes.length;

                        for (k = 0; k < length; k++) collectNodes(childNodes[ k ]);
                    }
                }
            }
        };

        collectNodes(top);

        // additional filtering of the result set
        // removes parent nodes which do not match filter themselves and have no matching children


        root.cascadeBy(function (node) {
            if (visibleNodes[ node.internalId ]) {
                node.__filterGen = filterGen;

                if (me.allowExpandCollapseWhileFiltered && !node.data.leaf) node.expand();
            }
        });

    },


    /**
     * This method filters the tree store. It accepts an object with the following properties:
     *
     * - `filter` - a function to check if a node should be included in the result. It will be called for each **leaf** node in the tree and will receive the current node as the first argument.
     * It should return `true` if the node should remain visible, `false` otherwise. The result will also contain all parents nodes of all matching leafs. Results will not include
     * parent nodes, which do not have at least one matching child.
     * To call this method for parent nodes too, pass an additional parameter - `checkParents` (see below).
     * - `scope` - a scope to call the filter with (optional)
     * - `checkParents` - when set to `true` will also call the `filter` function for each parent node. If the function returns `false` for some parent node,
     * it could still be included in the filtered result if some of its children match the `filter` (see also "shallow" option below). If the function returns `true` for a parent node, it will be
     * included in the filtering results even if it does not have any matching child nodes.
     * - `shallow` - implies `checkParents`. When set to `true`, it will stop checking child nodes if the `filter` function return `false` for a parent node. The whole sub-tree, starting
     * from a non-matching parent, will be excluded from the result in such case.
     * - `onlyParents` - alternative to `checkParents`. When set to `true` it will only call the provided `filter` function for parent tasks. If
     * the filter returns `true`, the parent and all its direct child leaf nodes will be included in the results. If the `filter` returns `false`, a parent node still can
     * be included in the results (w/o direct children leafs), if some of its child nodes matches the filter.
     * - `fullMatchingParents` - implies `onlyParents`. In this mode, if a parent node matches the filter, then not only its direct children
     * will be included in the results, but the whole sub-tree, starting from the matching node.
     *
     * Repeated calls to this method will clear previous filters.
     *
     * This function can be also called with 2 arguments, which should be the `filter` function and `scope` in such case.
     *
     * For example:

     treeStore.filterTreeBy({
        filter          : function (node) { return node.get('name').match(/some regexp/) },
        checkParents    : true
    })

     // or, if you don't need to set any options:
     treeStore.filterTreeBy(function (node) { return node.get('name').match(/some regexp/) })

     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     *
     * @param {Object} params
     */
    filterTreeBy : function (params, scope) {
        this.currentFilterGeneration = this.filterGeneration++;

        var filter;

        if (arguments.length == 1 && Ext.isObject(arguments[ 0 ])) {
            scope       = params.scope;
            filter      = params.filter;
        } else {
            filter      = params;
            params      = { filter : filter, scope : scope };
        }

        this.fireEvent('nodestore-datachange-start', this);

        params                      = params || {};

        this.markFilteredNodes(this.getRootNode(), params);

        this.startDataChangeMonitoring();

        this.isFilteredFlag     = true;
        this.lastTreeFilter     = params;

        this.refreshNodeStoreContent();
        
        this.fireEvent('nodestore-datachange-end', this);

        this.fireEvent('filter-set', this);
    },


    isNodeFilteredIn : function (node) {
        var isFiltered              = this.isTreeFiltered();
        var currentFilterGeneration = this.currentFilterGeneration;

        return this.loading || !Boolean(isFiltered && node.__filterGen != currentFilterGeneration || node.hidden);
    },


    hasNativeFilters : function () {
        var me      = this,
            filters = me.getFilters(),
            count   = filters.getCount();

        return (count && count > 1) || filters.indexOf(me.treeFilter) < 0;
    },


    /**
     * Hide nodes from the visual presentation of tree store (they still remain in the store).
     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     *
     * @param {Function} filter - A filtering function. Will be called for each node in the tree store and receive
     * the current node as the 1st argument. Should return `true` to **hide** the node
     * and `false`, to **keep it visible**.
     * @param {Object} scope (optional).
     */
    hideNodesBy : function (filter, scope, skipNodeStoreRefresh) {
        var me      = this;

        if (me.isFiltered() && me.hasNativeFilters()) throw new Error("Can't hide nodes of the filtered tree store");

        scope       = scope || me;

        me.getRootNode().cascadeBy(function (node) {
            node.hidden = Boolean(filter.call(scope, node, me));
        });

        me.startDataChangeMonitoring();

        me.isHiddenFlag     = true;
        me.lastTreeHiding   = [ filter, scope ];

        if (!skipNodeStoreRefresh) me.refreshNodeStoreContent();
    },


    /**
     * Shows all nodes that was previously hidden with {@link #hideNodesBy}
     *
     * See also {@link Sch.data.mixin.FilterableTreeStore} for additional information.
     */
    showAllNodes : function (skipNodeStoreRefresh) {
        this.getRootNode().cascadeBy(function (node) {
            node.hidden     = false;
        });

        this.isHiddenFlag       = false;
        this.lastTreeHiding     = null;

        if (!this.isTreeFiltered(true)) this.stopDataChangeMonitoring();

        if (!skipNodeStoreRefresh) this.refreshNodeStoreContent();
    },


    inheritables : function () {
        return {
            // @OVERRIDE
            onNodeExpand: function (parent, records, suppressEvent) {
                if (this.isTreeFiltered(true) && parent == this.getRoot()) {
                    this.callParent(arguments);
                    // the expand of the root node - most probably its the data loading
                    this.reApplyFilter();
                } else
                    return this.callParent(arguments);
            },

            // @OVERRIDE
            onNodeCollapse: function (parent, records, suppressEvent, callback, scope) {
                var me                      = this;
                var data                    = me.data;
                var prevContains            = data.contains;

                var isFiltered              = me.isTreeFiltered();
                var currentFilterGeneration = me.currentFilterGeneration;

                // the default implementation of `onNodeCollapse` only checks if the 1st record from collapsed nodes
                // exists in the node store. Meanwhile, that 1st node can be hidden, so we need to check all of them
                // thats what we do in the `for` loop below
                // then, if we found a node, we want to do actual removing of nodes and we override the original code from NodeStore
                // by always returning `false` from our `data.contains` override
                data.contains           = function () {
                    var node, sibling, lastNodeIndexPlus;

                    var collapseIndex   = me.indexOf(parent) + 1;
                    var found           = false;

                    for (var i = 0; i < records.length; i++)
                        if (
                            !(records[ i ].hidden || isFiltered && records[ i ].__filterGen != currentFilterGeneration) &&
                            prevContains.call(this, records[ i ])
                        ) {
                            // this is our override for internal part of `onNodeCollapse` method

                            // Calculate the index *one beyond* the last node we are going to remove
                            // Need to loop up the tree to find the nearest view sibling, since it could
                            // exist at some level above the current node.
                            node = parent;
                            while (node.parentNode) {
                                sibling = node;
                                do {
                                    sibling = sibling.nextSibling;
                                } while (sibling && (sibling.hidden || isFiltered && sibling.__filterGen != currentFilterGeneration));

                                if (sibling) {
                                    found = true;
                                    lastNodeIndexPlus = me.indexOf(sibling);
                                    break;
                                } else {
                                    node = node.parentNode;
                                }
                            }
                            if (!found) {
                                lastNodeIndexPlus = me.getCount();
                            }

                            // Remove the whole collapsed node set.
                            me.removeAt(collapseIndex, lastNodeIndexPlus - collapseIndex);

                            break;
                        }

                    // always return `false`, so original NodeStore code won't execute
                    return false;
                };

                this.callParent(arguments);

                data.contains           = prevContains;
            },

            // @OVERRIDE
            handleNodeExpand : function (parent, records, toAdd) {
                var me                      = this;
                var visibleRecords          = [];
                var isFiltered              = me.isTreeFiltered();
                var currentFilterGeneration = me.currentFilterGeneration;

                for (var i = 0; i < records.length; i++) {
                    var record          = records[ i ];

                    if (
                        !(isFiltered && record.__filterGen != currentFilterGeneration || record.hidden)
                    ) {
                        visibleRecords[ visibleRecords.length ] = record;
                    }
                }

                return this.callParent([ parent, visibleRecords, toAdd ]);
            },

            // @OVERRIDE
            onNodeInsert: function(parent, node, index) {
                var me = this,
                    refNode,
                    sibling,
                    storeReader,
                    nodeProxy,
                    nodeReader,
                    reader,
                    data = node.raw || node.data,
                    dataRoot,
                    isVisible,
                    childType;

                if (me.filterFn) {
                    isVisible = me.filterFn(node);
                    node.set('visible', isVisible);

                    // If a node which passes the filter is added to a parent node
                    if (isVisible) {
                        parent.set('visible', me.filterFn(parent));
                    }
                }

                // Register node by its IDs
                me.registerNode(node, true);

                me.beginUpdate();

                // Only react to a node append if it is to a node which is expanded.
                if (me.isVisible(node)) {
                    if (index === 0 || !node.previousSibling) {
                        refNode = parent;
                    } else {
                        // Find the previous visible sibling (filtering may have knocked out intervening nodes)
                        for (sibling = node.previousSibling; sibling && !sibling.get('visible'); sibling = sibling.previousSibling);
                        if (!sibling) {
                            refNode = parent;
                        } else {
                            while (sibling.isExpanded() && sibling.lastChild) {
                                sibling = sibling.lastChild;
                            }
                            refNode = sibling;
                        }
                    }

                    // The reaction to collection add joins the node to this Store
                    me.insert(me.indexOf(refNode) + 1, node);
                    if (!node.isLeaf() && node.isExpanded()) {
                        if (node.isLoaded()) {
                            // Take a shortcut
                            me.onNodeExpand(node, node.childNodes);
                        } else if (!me.fillCount) {
                            // If the node has been marked as expanded, it means the children
                            // should be provided as part of the raw data. If we're filling the nodes,
                            // the children may not have been loaded yet, so only do this if we're
                            // not in the middle of populating the nodes.
                            node.set('expanded', false);
                            node.expand();
                        }
                    }
                }

                // Set sync flag if the record needs syncing.
                else {
                    me.needsSync = me.needsSync || node.phantom || node.dirty;
                }

                if (!node.isLeaf() && !node.isLoaded() && !me.lazyFill) {
                    // With heterogeneous nodes, different levels may require differently configured readers to extract children.
                    // For example a "Disk" node type may configure it's proxy reader with root: 'folders', while a "Folder" node type
                    // might configure its proxy reader with root: 'files'. Or the root property could be a configured-in accessor.
                    storeReader = me.getProxy().getReader();
                    nodeProxy = node.getProxy();
                    nodeReader = nodeProxy ? nodeProxy.getReader() : null;

                    // If the node's reader was configured with a special root (property name which defines the children array) use that.
                    reader = nodeReader && nodeReader.initialConfig.rootProperty ? nodeReader : storeReader;

                    dataRoot = reader.getRoot(data);
                    if (dataRoot) {
                        childType = node.childType;
                        me.fillNode(node, reader.extractData(dataRoot, childType ? {
                            model: childType
                        } : undefined));
                    }
                }
                me.endUpdate();
            },

            isFiltered : function () {
                return this.callParent(arguments) || this.isTreeFiltered();
            }
        };
    }

});
