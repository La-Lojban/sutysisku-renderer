"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var specialElHandlers_1 = require("./specialElHandlers");
var constants_1 = require("../common/constants");
var noop = function () {
    return;
};
function defaultGetNodeKey(node) {
    var _a, _b;
    return (_b = (_a = node === null || node === void 0 ? void 0 : node.getAttribute) === null || _a === void 0 ? void 0 : _a.call(node, 'id')) !== null && _b !== void 0 ? _b : node === null || node === void 0 ? void 0 : node.id;
}
function patchDOM(fromNode, toNode_, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (options === void 0) { options = {}; }
    var toNode = toNode_.nodeType === constants_1.DOCUMENT_FRAGMENT_NODE && toNode_.firstElementChild !== null
        ? toNode_.firstElementChild
        : toNode_;
    var getNodeKey = (_a = options.getNodeKey) !== null && _a !== void 0 ? _a : defaultGetNodeKey;
    var onBeforeNodeAdded = (_b = options.onBeforeNodeAdded) !== null && _b !== void 0 ? _b : noop;
    var onNodeAdded = (_c = options.onNodeAdded) !== null && _c !== void 0 ? _c : noop;
    var onBeforeElUpdated = (_d = options.onBeforeElUpdated) !== null && _d !== void 0 ? _d : noop;
    var onElUpdated = (_e = options.onElUpdated) !== null && _e !== void 0 ? _e : noop;
    var onBeforeNodeDiscarded = (_f = options.onBeforeNodeDiscarded) !== null && _f !== void 0 ? _f : noop;
    var onNodeDiscarded = (_g = options.onNodeDiscarded) !== null && _g !== void 0 ? _g : noop;
    var onBeforeElChildrenUpdated = (_h = options.onBeforeElChildrenUpdated) !== null && _h !== void 0 ? _h : noop;
    var childrenOnly = options.childrenOnly === true;
    // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
    var fromNodesLookup = Object.create(null);
    var keyedRemovalList = [];
    function addKeyedRemoval(key) {
        keyedRemovalList.push(key);
    }
    function walkDiscardedChildNodes(node, skipKeyedNodes) {
        if (skipKeyedNodes === void 0) { skipKeyedNodes = false; }
        if (node.nodeType === constants_1.ELEMENT_NODE) {
            var curChild = node.firstChild;
            while (curChild) {
                var key = getNodeKey(curChild);
                if (skipKeyedNodes && typeof key !== 'undefined') {
                    // If we are skipping keyed nodes then we add the key
                    // to a list so that it can be handled at the very end.
                    addKeyedRemoval(key);
                }
                else {
                    // Only report the node as discarded if it is not keyed. We do this because
                    // at the end we loop through all keyed elements that were unmatched
                    // and then discard them in one final pass.
                    onNodeDiscarded(curChild);
                    if (curChild.firstChild) {
                        walkDiscardedChildNodes(curChild, skipKeyedNodes);
                    }
                }
                curChild = curChild === null || curChild === void 0 ? void 0 : curChild.nextSibling;
            }
        }
    }
    /**
     * Removes a DOM node out of the original DOM
     *getNodeKey
     * @param  {Node} node The node to remove
     * @param  {Node} parentNode The nodes parent
     * @param  {Boolean} skipKeyedNodes If true then elements with keys will be skipped and not discarded.
     * @return {void}
     */
    function removeNode(node, parentNode, skipKeyedNodes) {
        if (skipKeyedNodes === void 0) { skipKeyedNodes = false; }
        if (onBeforeNodeDiscarded(node) === false) {
            return;
        }
        if (parentNode) {
            parentNode.removeChild(node);
        }
        onNodeDiscarded(node);
        walkDiscardedChildNodes(node, skipKeyedNodes);
    }
    // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
    // function indexTree(root) {
    //     var treeWalker = document.createTreeWalker(
    //         root,
    //         NodeFilter.SHOW_ELEMENT);
    //
    //     var el;
    //     while((el = treeWalker.nextNode())) {
    //         var key = getNodeKey(el);
    //         if (key) {
    //             fromNodesLookup[key] = el;
    //         }
    //     }
    // }
    // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
    //
    // function indexTree(node) {
    //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
    //     var el;
    //     while((el = nodeIterator.nextNode())) {
    //         var key = getNodeKey(el);
    //         if (key) {
    //             fromNodesLookup[key] = el;
    //         }
    //     }
    // }
    function indexTree(node) {
        var _a;
        if ((_a = node.nodeType === constants_1.ELEMENT_NODE) !== null && _a !== void 0 ? _a : node.nodeType === constants_1.DOCUMENT_FRAGMENT_NODE) {
            var curChild = node.firstChild;
            while (curChild) {
                var key = getNodeKey(curChild);
                if (key) {
                    fromNodesLookup[key] = curChild;
                }
                // Walk recursively
                indexTree(curChild);
                curChild = curChild === null || curChild === void 0 ? void 0 : curChild.nextSibling;
            }
        }
    }
    indexTree(fromNode);
    function handleNodeAdded(el) {
        var _a;
        onNodeAdded(el);
        var curChild = el.firstChild;
        while (curChild) {
            var nextSibling = curChild.nextSibling;
            var key = getNodeKey(curChild);
            if (key) {
                var elementFrom = fromNodesLookup[key];
                // if we find a duplicate #id node in cache, replace `el` with cache value
                // and patch it to the child node.
                if (elementFrom && (0, util_1.compareNodeNames)(curChild, elementFrom)) {
                    (_a = curChild === null || curChild === void 0 ? void 0 : curChild.parentNode) === null || _a === void 0 ? void 0 : _a.replaceChild(elementFrom, curChild);
                    patchElement(elementFrom, curChild);
                }
                else {
                    handleNodeAdded(curChild);
                }
            }
            else {
                // recursively call for curChild and it's children to see if we find something in
                // fromNodesLookup
                handleNodeAdded(curChild);
            }
            curChild = nextSibling;
        }
    }
    function cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey) {
        // We have processed all of the "to nodes". If curFromNodeChild is
        // non-null then we still have some from nodes left over that need
        // to be removed
        while (curFromNodeChild) {
            var fromNextSibling = curFromNodeChild.nextSibling;
            if (curFromNodeKey === getNodeKey(curFromNodeChild)) {
                // Since the node is keyed it might be matched up later so we defer
                // the actual removal to later
                addKeyedRemoval(curFromNodeKey);
            }
            else {
                // NOTE: we skip nested keyed nodes from being removed since there is
                //       still a chance they will be matched up later
                removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
            }
            curFromNodeChild = fromNextSibling;
        }
    }
    function patchElement(fromEl, toEl, childrenOnly) {
        if (childrenOnly === void 0) { childrenOnly = false; }
        var toElKey = getNodeKey(toEl);
        if (toElKey) {
            // If an element with an ID is being morphed then it will be in the final
            // DOM so clear it out of the saved elements collection
            delete fromNodesLookup[toElKey];
        }
        if (!childrenOnly) {
            // optional
            if (onBeforeElUpdated(fromEl, toEl) === false)
                return;
            // update attributes on original DOM element first
            (0, util_1.amendAttributes)(fromEl, toEl);
            // optional
            onElUpdated(fromEl);
            if (onBeforeElChildrenUpdated(fromEl, toEl) === false)
                return;
        }
        if (fromEl.nodeName !== 'TEXTAREA') {
            patchChildren(fromEl, toEl);
        }
        else {
            specialElHandlers_1.default.TEXTAREA(fromEl, toEl);
        }
    }
    function patchChildren(fromEl, toEl) {
        var _a;
        var curToNodeChild = toEl.firstChild;
        var curFromNodeChild = fromEl.firstChild;
        var curToNodeKey;
        var curFromNodeKey;
        var fromNextSibling = null;
        var toNextSibling;
        var matchingFromEl;
        // walk the children
        outer: while (curToNodeChild) {
            toNextSibling = curToNodeChild.nextSibling;
            curToNodeKey = getNodeKey(curToNodeChild);
            // walk the fromNode children all the way through
            while (curFromNodeChild) {
                fromNextSibling = curFromNodeChild.nextSibling;
                if ((_a = curToNodeChild.isSameNode) === null || _a === void 0 ? void 0 : _a.call(curToNodeChild, curFromNodeChild)) {
                    curToNodeChild = toNextSibling;
                    curFromNodeChild = fromNextSibling;
                    continue outer;
                }
                curFromNodeKey = getNodeKey(curFromNodeChild);
                var curFromNodeType = curFromNodeChild.nodeType;
                // this means if the curFromNodeChild doesnt have a match with the curToNodeChild
                var isCompatible = void 0;
                if (curFromNodeType === curToNodeChild.nodeType) {
                    if (curFromNodeType === constants_1.ELEMENT_NODE) {
                        // Both nodes being compared are Element nodes
                        if (curToNodeKey) {
                            // The target node has a key so we want to match it up with the correct element
                            // in the original DOM tree
                            if (curToNodeKey !== curFromNodeKey) {
                                // The current element in the original DOM tree does not have a matching key so
                                // let's check our lookup to see if there is a matching element in the original
                                // DOM tree
                                if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
                                    if (fromNextSibling === matchingFromEl) {
                                        // Special case for single element removals. To avoid removing the original
                                        // DOM node out of the tree (since that can break CSS transitions, etc.),
                                        // we will instead discard the current node and wait until the next
                                        // iteration to properly match up the keyed target element with its matching
                                        // element in the original tree
                                        isCompatible = false;
                                    }
                                    else {
                                        // We found a matching keyed element somewhere in the original DOM tree.
                                        // Let's move the original DOM node into the current position and morph
                                        // it.
                                        // NOTE: We use insertBefore instead of replaceChild because we want to go through
                                        // the `removeNode()` function for the node that is being discarded so that
                                        // all lifecycle hooks are correctly invoked
                                        fromEl.insertBefore(matchingFromEl, curFromNodeChild);
                                        // fromNextSibling = curFromNodeChild.nextSibling;
                                        if (curFromNodeKey) {
                                            // Since the node is keyed it might be matched up later so we defer
                                            // the actual removal to later
                                            addKeyedRemoval(curFromNodeKey);
                                        }
                                        else {
                                            // NOTE: we skip nested keyed nodes from being removed since there is
                                            //       still a chance they will be matched up later
                                            removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                                        }
                                        curFromNodeChild = matchingFromEl;
                                    }
                                }
                                else {
                                    // The nodes are not compatible since the "to" node has a key and there
                                    // is no matching keyed node in the source tree
                                    isCompatible = false;
                                }
                            }
                        }
                        else if (curFromNodeKey) {
                            // The original has a key
                            isCompatible = false;
                        }
                        isCompatible =
                            isCompatible !== false && curFromNodeChild && (0, util_1.compareNodeNames)(curFromNodeChild, curToNodeChild);
                        if (isCompatible && curFromNodeChild) {
                            // We found compatible DOM elements so transform
                            // the current "from" node to match the current
                            // target DOM node.
                            // MORPH
                            patchElement(curFromNodeChild, curToNodeChild);
                        }
                    }
                    else if (curFromNodeType === constants_1.TEXT_NODE || curFromNodeType == constants_1.COMMENT_NODE) {
                        // Both nodes being compared are Text or Comment nodes
                        isCompatible = true;
                        // Simply update nodeValue on the original node to
                        // change the text value
                        if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue)
                            curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                    }
                }
                if (isCompatible) {
                    // Advance both the "to" child and the "from" child since we found a match
                    // Nothing else to do as we already recursively called patchChildren above
                    curToNodeChild = toNextSibling;
                    curFromNodeChild = fromNextSibling;
                    continue outer;
                }
                // No compatible match so remove the old node from the DOM and continue trying to find a
                // match in the original DOM. However, we only do this if the from node is not keyed
                // since it is possible that a keyed node might match up with a node somewhere else in the
                // target tree and we don't want to discard it just yet since it still might find a
                // home in the final DOM tree. After everything is done we will remove any keyed nodes
                // that didn't find a home
                if (curFromNodeKey) {
                    // Since the node is keyed it might be matched up later so we defer
                    // the actual removal to later
                    addKeyedRemoval(curFromNodeKey);
                }
                else if (curFromNodeChild) {
                    // NOTE: we skip nested keyed nodes from being removed since there is
                    //       still a chance they will be matched up later
                    removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                }
                curFromNodeChild = fromNextSibling;
            } // END: while(curFromNodeChild) {}
            // If we got this far then we did not find a candidate match for
            // our "to node" and we exhausted all of the children "from"
            // nodes. Therefore, we will just append the current "to" node
            // to the end
            if (curToNodeKey &&
                (matchingFromEl = fromNodesLookup[curToNodeKey]) &&
                (0, util_1.compareNodeNames)(matchingFromEl, curToNodeChild)) {
                fromEl.appendChild(matchingFromEl);
                patchElement(matchingFromEl, curToNodeChild);
            }
            else {
                var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
                if (onBeforeNodeAddedResult instanceof HTMLElement) {
                    if (onBeforeNodeAddedResult)
                        curToNodeChild = onBeforeNodeAddedResult;
                    if (curToNodeChild === null || curToNodeChild === void 0 ? void 0 : curToNodeChild.actualize)
                        curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || document);
                    if (curToNodeChild) {
                        fromEl.appendChild(curToNodeChild);
                        handleNodeAdded(curToNodeChild);
                    }
                }
            }
            curToNodeChild = toNextSibling;
            curFromNodeChild = fromNextSibling;
        }
        if (curFromNodeKey)
            cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);
        var specialElHandler = specialElHandlers_1.default[fromEl.nodeName];
        if (specialElHandler)
            specialElHandler(fromEl, toEl);
    } // END: patchChildren(...)
    var beingPatchedNode = fromNode;
    var beingPatchedNodeType = beingPatchedNode.nodeType;
    var toNodeType = toNode.nodeType;
    if (!childrenOnly) {
        // Handle the case where we are given two DOM nodes that are not
        // compatible (e.g. <div> --> <span> or <div> --> TEXT)
        if (beingPatchedNodeType === constants_1.ELEMENT_NODE) {
            if (toNodeType === constants_1.ELEMENT_NODE) {
                if (!(0, util_1.compareNodeNames)(fromNode, toNode)) {
                    onNodeDiscarded(fromNode);
                    beingPatchedNode = (0, util_1.moveChildren)(fromNode, (0, util_1.createElementNS)(toNode.nodeName, toNode.namespaceURI));
                }
            }
            else {
                // Going from an element node to a text node
                beingPatchedNode = toNode;
            }
        }
        else if ([constants_1.TEXT_NODE, constants_1.COMMENT_NODE].includes(beingPatchedNodeType)) {
            // Text or comment node
            if (toNodeType === beingPatchedNodeType) {
                if (beingPatchedNode.nodeValue !== toNode.nodeValue)
                    beingPatchedNode.nodeValue = toNode.nodeValue;
                return beingPatchedNode;
            }
            else {
                // Text node to something else
                beingPatchedNode = toNode;
            }
        }
    }
    if (beingPatchedNode === toNode) {
        // The "to node" was not compatible with the "from node" so we had to
        // toss out the "from node" and use the "to node"
        onNodeDiscarded(fromNode);
    }
    else {
        if ((_j = toNode.isSameNode) === null || _j === void 0 ? void 0 : _j.call(toNode, beingPatchedNode))
            return;
        patchElement(beingPatchedNode, toNode, childrenOnly);
        // We now need to loop over any keyed nodes that might need to be
        // removed. We only do the removal if we know that the keyed node
        // never found a match. When a keyed node is matched up we remove
        // it out of fromNodesLookup and we use fromNodesLookup to determine
        // if a keyed node has been matched up or not
        keyedRemovalList.forEach(function (val) {
            var elToRemove = fromNodesLookup[val];
            if (elToRemove)
                removeNode(elToRemove, elToRemove.parentNode, false);
        });
    }
    if (!childrenOnly && beingPatchedNode !== fromNode && fromNode.parentNode) {
        if (beingPatchedNode.actualize)
            beingPatchedNode = beingPatchedNode.actualize(fromNode.ownerDocument || document);
        // If we had to swap out the from node with a new node because the old
        // node was not compatible with the target node then we need to
        // replace the old DOM node in the original DOM tree. This is only
        // possible if the original DOM node was part of a DOM tree which
        // we know is the case if it has a parent node.
        fromNode.parentNode.replaceChild(beingPatchedNode, fromNode);
    }
    return beingPatchedNode;
}
exports.default = patchDOM;
