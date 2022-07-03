import { PatchDOMOptions, SpecialWidgets, VDOMElement, VDOMElementOrNull } from '../common/types';
import { amendAttributes, compareNodeNames, moveChildren, createElementNS } from './util';
import specialElHandlers from './specialElHandlers';
import { COMMENT_NODE, DOCUMENT_FRAGMENT_NODE, ELEMENT_NODE, TEXT_NODE } from '../common/constants';

const noop = () => {
  return;
};

function defaultGetNodeKey(node: VDOMElement): string | void {
  return node?.getAttribute?.('id') ?? node?.id;
}

export default function patchDOM(fromNode: VDOMElement, toNode_: VDOMElement, options: PatchDOMOptions = {}) {
  const toNode: VDOMElement =
    toNode_.nodeType === DOCUMENT_FRAGMENT_NODE && toNode_.firstElementChild !== null
      ? (toNode_.firstElementChild as VDOMElement)
      : toNode_;

  const getNodeKey = options.getNodeKey ?? defaultGetNodeKey;
  const onBeforeNodeAdded = options.onBeforeNodeAdded ?? noop;
  const onNodeAdded = options.onNodeAdded ?? noop;
  const onBeforeElUpdated = options.onBeforeElUpdated ?? noop;
  const onElUpdated = options.onElUpdated ?? noop;
  const onBeforeNodeDiscarded = options.onBeforeNodeDiscarded ?? noop;
  const onNodeDiscarded = options.onNodeDiscarded ?? noop;
  const onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated ?? noop;
  const childrenOnly = options.childrenOnly === true;

  // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
  const fromNodesLookup = Object.create(null);
  const keyedRemovalList: string[] = [];

  function addKeyedRemoval(key: string) {
    keyedRemovalList.push(key);
  }

  function walkDiscardedChildNodes(node: VDOMElement, skipKeyedNodes = false) {
    if (node.nodeType === ELEMENT_NODE) {
      let curChild: VDOMElementOrNull = node.firstChild as VDOMElementOrNull;
      while (curChild) {
        const key = getNodeKey(curChild);

        if (skipKeyedNodes && typeof key !== 'undefined') {
          // If we are skipping keyed nodes then we add the key
          // to a list so that it can be handled at the very end.
          addKeyedRemoval(key);
        } else {
          // Only report the node as discarded if it is not keyed. We do this because
          // at the end we loop through all keyed elements that were unmatched
          // and then discard them in one final pass.
          onNodeDiscarded(curChild);
          if (curChild.firstChild) {
            walkDiscardedChildNodes(curChild, skipKeyedNodes);
          }
        }

        curChild = curChild?.nextSibling as VDOMElementOrNull;
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
  function removeNode(node: VDOMElement, parentNode: VDOMElement, skipKeyedNodes = false): void {
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

  function indexTree(node: VDOMElement) {
    if (node.nodeType === ELEMENT_NODE ?? node.nodeType === DOCUMENT_FRAGMENT_NODE) {
      let curChild = node.firstChild as VDOMElementOrNull;
      while (curChild) {
        const key = getNodeKey(curChild);
        if (key) {
          fromNodesLookup[key] = curChild;
        }

        // Walk recursively
        indexTree(curChild);

        curChild = curChild?.nextSibling as VDOMElementOrNull;
      }
    }
  }

  indexTree(fromNode);

  function handleNodeAdded(el: VDOMElement) {
    onNodeAdded(el);

    let curChild = el.firstChild as VDOMElementOrNull;
    while (curChild) {
      const nextSibling = curChild.nextSibling as VDOMElementOrNull;

      const key = getNodeKey(curChild);
      if (key) {
        const elementFrom = fromNodesLookup[key];
        // if we find a duplicate #id node in cache, replace `el` with cache value
        // and patch it to the child node.
        if (elementFrom && compareNodeNames(curChild, elementFrom)) {
          curChild?.parentNode?.replaceChild(elementFrom, curChild);
          patchElement(elementFrom, curChild);
        } else {
          handleNodeAdded(curChild);
        }
      } else {
        // recursively call for curChild and it's children to see if we find something in
        // fromNodesLookup
        handleNodeAdded(curChild);
      }

      curChild = nextSibling;
    }
  }

  function cleanupFromEl(fromEl: VDOMElement, curFromNodeChild: VDOMElementOrNull, curFromNodeKey: string) {
    // We have processed all of the "to nodes". If curFromNodeChild is
    // non-null then we still have some from nodes left over that need
    // to be removed
    while (curFromNodeChild) {
      const fromNextSibling = curFromNodeChild.nextSibling as VDOMElementOrNull;
      if (curFromNodeKey === getNodeKey(curFromNodeChild)) {
        // Since the node is keyed it might be matched up later so we defer
        // the actual removal to later
        addKeyedRemoval(curFromNodeKey);
      } else {
        // NOTE: we skip nested keyed nodes from being removed since there is
        //       still a chance they will be matched up later
        removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
      }
      curFromNodeChild = fromNextSibling;
    }
  }

  function patchElement(fromEl: VDOMElement, toEl: VDOMElement, childrenOnly = false) {
    const toElKey = getNodeKey(toEl);

    if (toElKey) {
      // If an element with an ID is being morphed then it will be in the final
      // DOM so clear it out of the saved elements collection
      delete fromNodesLookup[toElKey];
    }

    if (!childrenOnly) {
      // optional
      if (onBeforeElUpdated(fromEl, toEl) === false) return;

      // update attributes on original DOM element first
      amendAttributes(fromEl, toEl);
      // optional
      onElUpdated(fromEl);

      if (onBeforeElChildrenUpdated(fromEl, toEl) === false) return;
    }

    if (fromEl.nodeName !== 'TEXTAREA') {
      patchChildren(fromEl, toEl);
    } else {
      specialElHandlers.TEXTAREA(fromEl, toEl);
    }
  }

  function patchChildren(fromEl: VDOMElement, toEl: VDOMElement) {
    let curToNodeChild = toEl.firstChild as VDOMElementOrNull;
    let curFromNodeChild = fromEl.firstChild as VDOMElementOrNull;
    let curToNodeKey;
    let curFromNodeKey;

    let fromNextSibling: VDOMElementOrNull = null;
    let toNextSibling;
    let matchingFromEl;

    // walk the children
    outer: while (curToNodeChild) {
      toNextSibling = curToNodeChild.nextSibling as VDOMElementOrNull;
      curToNodeKey = getNodeKey(curToNodeChild);

      // walk the fromNode children all the way through
      while (curFromNodeChild) {
        fromNextSibling = curFromNodeChild.nextSibling as VDOMElementOrNull;

        if (curToNodeChild.isSameNode?.(curFromNodeChild)) {
          curToNodeChild = toNextSibling;
          curFromNodeChild = fromNextSibling;
          continue outer;
        }

        curFromNodeKey = getNodeKey(curFromNodeChild);

        const curFromNodeType = curFromNodeChild.nodeType;

        // this means if the curFromNodeChild doesnt have a match with the curToNodeChild
        let isCompatible;

        if (curFromNodeType === curToNodeChild.nodeType) {
          if (curFromNodeType === ELEMENT_NODE) {
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
                  } else {
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
                    } else {
                      // NOTE: we skip nested keyed nodes from being removed since there is
                      //       still a chance they will be matched up later
                      removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                    }

                    curFromNodeChild = matchingFromEl;
                  }
                } else {
                  // The nodes are not compatible since the "to" node has a key and there
                  // is no matching keyed node in the source tree
                  isCompatible = false;
                }
              }
            } else if (curFromNodeKey) {
              // The original has a key
              isCompatible = false;
            }

            isCompatible =
              isCompatible !== false && curFromNodeChild && compareNodeNames(curFromNodeChild, curToNodeChild);
            if (isCompatible && curFromNodeChild) {
              // We found compatible DOM elements so transform
              // the current "from" node to match the current
              // target DOM node.
              // MORPH
              patchElement(curFromNodeChild, curToNodeChild);
            }
          } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
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
        } else if (curFromNodeChild) {
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
      if (
        curToNodeKey &&
        (matchingFromEl = fromNodesLookup[curToNodeKey]) &&
        compareNodeNames(matchingFromEl, curToNodeChild)
      ) {
        fromEl.appendChild(matchingFromEl);
        patchElement(matchingFromEl, curToNodeChild);
      } else {
        const onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
        if (onBeforeNodeAddedResult instanceof HTMLElement) {
          if (onBeforeNodeAddedResult) curToNodeChild = onBeforeNodeAddedResult as HTMLElement;

          if (curToNodeChild?.actualize) curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || document);

          if (curToNodeChild) {
            fromEl.appendChild(curToNodeChild as Node);
            handleNodeAdded(curToNodeChild);
          }
        }
      }

      curToNodeChild = toNextSibling;
      curFromNodeChild = fromNextSibling;
    }

    if (curFromNodeKey) cleanupFromEl(fromEl, curFromNodeChild, curFromNodeKey);

    const specialElHandler = specialElHandlers[fromEl.nodeName as SpecialWidgets];
    if (specialElHandler) specialElHandler(fromEl, toEl);
  } // END: patchChildren(...)

  let beingPatchedNode = fromNode;
  const beingPatchedNodeType = beingPatchedNode.nodeType;
  const toNodeType = toNode.nodeType;

  if (!childrenOnly) {
    // Handle the case where we are given two DOM nodes that are not
    // compatible (e.g. <div> --> <span> or <div> --> TEXT)
    if (beingPatchedNodeType === ELEMENT_NODE) {
      if (toNodeType === ELEMENT_NODE) {
        if (!compareNodeNames(fromNode, toNode)) {
          onNodeDiscarded(fromNode);
          beingPatchedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
        }
      } else {
        // Going from an element node to a text node
        beingPatchedNode = toNode;
      }
    } else if ([TEXT_NODE, COMMENT_NODE].includes(beingPatchedNodeType)) {
      // Text or comment node
      if (toNodeType === beingPatchedNodeType) {
        if (beingPatchedNode.nodeValue !== toNode.nodeValue) beingPatchedNode.nodeValue = toNode.nodeValue;

        return beingPatchedNode;
      } else {
        // Text node to something else
        beingPatchedNode = toNode;
      }
    }
  }

  if (beingPatchedNode === toNode) {
    // The "to node" was not compatible with the "from node" so we had to
    // toss out the "from node" and use the "to node"
    onNodeDiscarded(fromNode);
  } else {
    if (toNode.isSameNode?.(beingPatchedNode)) return;
    patchElement(beingPatchedNode, toNode, childrenOnly);

    // We now need to loop over any keyed nodes that might need to be
    // removed. We only do the removal if we know that the keyed node
    // never found a match. When a keyed node is matched up we remove
    // it out of fromNodesLookup and we use fromNodesLookup to determine
    // if a keyed node has been matched up or not
    keyedRemovalList.forEach((val) => {
      const elToRemove = fromNodesLookup[val];
      if (elToRemove) removeNode(elToRemove, elToRemove.parentNode, false);
    });
  }

  if (!childrenOnly && beingPatchedNode !== fromNode && fromNode.parentNode) {
    if (beingPatchedNode.actualize) beingPatchedNode = beingPatchedNode.actualize(fromNode.ownerDocument || document);

    // If we had to swap out the from node with a new node because the old
    // node was not compatible with the target node then we need to
    // replace the old DOM node in the original DOM tree. This is only
    // possible if the original DOM node was part of a DOM tree which
    // we know is the case if it has a parent node.
    fromNode.parentNode.replaceChild(beingPatchedNode, fromNode);
  }

  return beingPatchedNode;
}
