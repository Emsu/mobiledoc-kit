import { nodeIsDescendantOfElement } from './element-utils';
import Type from '../../content-kit-compiler/types/type';

// TODO: remove, pass in Editor's current block set
var RootTags = [
  Type.TEXT.tag,
  Type.HEADING.tag,
  Type.SUBHEADING.tag,
  Type.QUOTE.tag,
  Type.LIST.tag,
  Type.ORDERED_LIST.tag
];

var SelectionDirection = {
  LEFT_TO_RIGHT : 1,
  RIGHT_TO_LEFT : 2,
  SAME_NODE     : 3
};

function getDirectionOfSelection(selection) {
  var node = selection.anchorNode;
  var position = node && node.compareDocumentPosition(selection.focusNode);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return SelectionDirection.LEFT_TO_RIGHT;
  } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return SelectionDirection.RIGHT_TO_LEFT;
  }
  return SelectionDirection.SAME_NODE;
}

function getSelectionElement(selection) {
  selection = selection || window.getSelection();
  var node = getDirectionOfSelection(selection) === SelectionDirection.LEFT_TO_RIGHT ? selection.anchorNode : selection.focusNode;
  return node && (node.nodeType === 3 ? node.parentNode : node);
}

function getSelectionBlockElement(selection) {
  selection = selection || window.getSelection();
  var element = getSelectionElement();
  var tag = element && element.tagName.toLowerCase();
  while (tag && RootTags.indexOf(tag) === -1) {
    if (element.contentEditable === 'true') { return; } // Stop traversing up dom when hitting an editor element
    element = element.parentNode;
    tag = element.tagName && element.tagName.toLowerCase();
  }
  return element;
}

function getSelectionTagName() {
  var element = getSelectionElement();
  return element ? element.tagName.toLowerCase() : null;
}

function getSelectionBlockTagName() {
  var element = getSelectionBlockElement();
  return element ? element.tagName && element.tagName.toLowerCase() : null;
}

function tagsInSelection(selection) {
  var element = getSelectionElement(selection);
  var tags = [];
  if (!selection.isCollapsed) {
    while(element) {
      if (element.contentEditable === 'true') { break; } // Stop traversing up dom when hitting an editor element
      if (element.tagName) {
        tags.push(element.tagName.toLowerCase());
      }
      element = element.parentNode;
    }
  }
  return tags;
}

function selectionIsInElement(selection, element) {
  var node = selection.anchorNode;
  return node && nodeIsDescendantOfElement(node, element);
}

function selectionIsEditable(selection) {
  var el = getSelectionBlockElement(selection);
  return el && el.isContentEditable;
}

function restoreRange(range) {
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function selectNode(node) {
  var range = document.createRange();
  var selection = window.getSelection();
  range.setStart(node, 0);
  range.setEnd(node, node.length);
  selection.removeAllRanges();
  selection.addRange(range);
}

export { getDirectionOfSelection, getSelectionElement, getSelectionBlockElement, getSelectionTagName,
         getSelectionBlockTagName, tagsInSelection, selectionIsInElement, selectionIsEditable, restoreRange, selectNode };
