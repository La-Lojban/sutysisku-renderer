"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var morph_1 = require("./morph");
var constants_1 = require("../common/constants");
var functions_1 = require("../common/functions");
// Morph one tree into another tree
// no parent
//   -> same: diff and walk children
//   -> not same: replace and return
// old node doesn't exist
//   -> insert new node
// new node doesn't exist
//   -> delete old node
// nodes are not the same
//   -> diff nodes and apply patch to old node
// nodes are the same
//   -> walk all child nodes and append to old node
function patchDOM(oldTree, newTree, options) {
    if (options === void 0) { options = { childrenOnly: false }; }
    oldTree = (0, functions_1.getElement)(oldTree);
    if (!oldTree)
        return;
    newTree.id = oldTree.id;
    if (options && options.childrenOnly) {
        updateChildren(newTree, oldTree);
        return oldTree;
    }
    return walk(newTree, oldTree);
}
exports.default = patchDOM;
// Walk and morph a dom tree
function walk(newNode, oldNode) {
    if (!oldNode) {
        return newNode;
    }
    else if (!newNode) {
        return null;
    }
    else if (newNode.isSameNode && newNode.isSameNode(oldNode)) {
        return oldNode;
    }
    else if (newNode.tagName !== oldNode.tagName) {
        return newNode;
    }
    else {
        (0, morph_1.default)(newNode, oldNode);
        updateChildren(newNode, oldNode);
        return oldNode;
    }
}
// Update the children of elements
// (obj, obj) -> null
function updateChildren(newNode, oldNode) {
    var oldChild, newChild, morphed, oldMatch;
    // The offset is only ever increased, and used for [i - offset] in the loop
    var offset = 0;
    for (var i = 0;; i++) {
        oldChild = oldNode.childNodes[i];
        newChild = newNode.childNodes[i - offset];
        if (!oldChild && !newChild) {
            break;
            // There is no new child, remove old
        }
        else if (!newChild) {
            oldNode.removeChild(oldChild);
            i--;
            // There is no old child, add new
        }
        else if (!oldChild) {
            oldNode.appendChild(newChild);
            offset++;
            // Both nodes are the same, morph
        }
        else if (same(newChild, oldChild)) {
            morphed = walk(newChild, oldChild);
            if (morphed && morphed !== oldChild) {
                oldNode.replaceChild(morphed, oldChild);
                offset++;
            }
            // Both nodes do not share an ID or a placeholder, try reorder
        }
        else {
            oldMatch = null;
            // Try and find a similar node somewhere in the tree
            for (var _i = 0, _a = Array.from(oldNode.childNodes); _i < _a.length; _i++) {
                var j = _a[_i];
                if (same(j, newChild)) {
                    oldMatch = j;
                    break;
                }
            }
            // If there was a node with the same ID or placeholder in the old list
            if (oldMatch) {
                morphed = walk(newChild, oldMatch);
                if (morphed !== oldMatch)
                    offset++;
                if (morphed)
                    oldNode.insertBefore(morphed, oldChild);
                // It's safe to morph two nodes in-place if neither has an ID
            }
            else if (!newChild.id && !oldChild.id) {
                morphed = walk(newChild, oldChild);
                if (morphed !== oldChild) {
                    if (morphed)
                        oldNode.replaceChild(morphed, oldChild);
                    offset++;
                }
                // Insert the node at the index if we couldn't morph or find a matching node
            }
            else {
                oldNode.insertBefore(newChild, oldChild);
                offset++;
            }
        }
    }
}
function same(a, b) {
    if (a.id)
        return a.id === b.id;
    if (a.isSameNode)
        return a.isSameNode(b);
    if (a.tagName !== b.tagName)
        return false;
    if (a.nodeType === constants_1.TEXT_NODE)
        return a.nodeValue === b.nodeValue;
    return false;
}
