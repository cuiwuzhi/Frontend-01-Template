function isMatch(selector, element) {
  const regex = /(?:\s*>\s*)|(?:\s*~(?!=)\s*)|(?:\s*\|\|\s*)|(?:\s+)/g;
  const combinators = selector.match(regex) || [];
  const selectors = selector.split(regex).filter(Boolean);
  let temp = element;
  let compoundSelector = selectors.pop();
  if (isMatchCompound(compoundSelector, temp)) {
    while (selectors.length > 0 && temp) {
      let combinator = combinators.pop();
      compoundSelector = selectors.pop();
      if (/~(?!=)/.test(combinator)) {
        temp = isMatchSibling(compoundSelector, temp);
      } else if (/>/.test(combinator)) {
        temp = isMatchParent(compoundSelector, temp);
      } else if (/(?:\|\|)/.test(combinator)) {
        temp = isMatchColumn(compoundSelector, temp);
      } else {
        temp = isMatchAncestor(compoundSelector, temp);
      }
    }
    return selectors.length === 0;
  }
  return false;
}

function isMatchCompound(compoundSelector, element) {
  let matched = false;
  let result;
  if (compoundSelector === '') {
    return true;
  } else if (result = compoundSelector.match(/^\*/)) {
    matched = true;
    return isMatchCompound(compoundSelector.substring(1), element);
  } else if (result = compoundSelector.match(/^(?:[a-zA-Z_]|[^\u0000-\u007F])(?:[a-zA-Z0-9-_]|[^\u0000-\u007F])*/)) {
    matched = element.tagName === result[0].toUpperCase();
  } else if (result = compoundSelector.match(/^#((?:[a-zA-Z0-9-_]|[^\u0000-\u007F])+)/)) {
    matched = element.id === result[1];
  } else if (result = compoundSelector.match(/^\.((?:[a-zA-Z_]|[^\u0000-\u007F])(?:[a-zA-Z0-9-_]|[^\u0000-\u007F])*)/)) {
    matched = element.classList.contains(result[1]);
  } else if (result = compoundSelector.match(/^\[((?:[a-zA-Z_]|[^\u0000-\u007F])(?:[a-zA-Z0-9-_]|[^\u0000-\u007F])*)([~\^\|\*\$]?=)?((?:\'[^\r]*?\')|(?:\"[^\r]*?\")|(?:(?:[a-zA-Z_]|[^\u0000-\u007F])(?:[a-zA-Z0-9-_]|[^\u0000-\u007F])*))?\]/)) {
    let attr = result[1];
    let attrMatcher = result[2];
    let attrValue = result[3];
    if (element.hasAttribute(attr)) {
      if (attrMatcher && !attrValue) {
        throw new Error(`'${result[0]}' is not a valid selector.`);
      } else if (attrMatcher && attrValue) {
        if (attrValue.match(/\'(.*?)\'/) || attrValue.match(/\"(.*?)\"/)) {
          attrValue = RegExp.$1;
        }
        let elementAttrValue = element.getAttribute(attr);
        if (attrMatcher === '~=') {
          matched = elementAttrValue.split(' ').indexOf(attrValue) > -1;
        } else if (attrMatcher === '^=') {
          matched = elementAttrValue.indexOf(attrValue) === 0;
        } else if (attrMatcher === '$=') {
          matched = elementAttrValue.lastIndexOf(attrValue) === elementAttrValue.length - attrValue.length;
        } else if (attrMatcher === '|=') {
          matched = elementAttrValue === attrValue || elementAttrValue.indexOf(attrValue + '-') === 0;
        } else if (attrMatcher === '*=') {
          matched = elementAttrValue.indexOf(attrValue) > -1;
        } else if (attrMatcher === '=') {
          matched = elementAttrValue === attrValue;
        }
      }
    }
  } else if (result = compoundSelector.match(/^:(?:[a-zA-Z_]|[^\u0000-\u007F])(?:[a-zA-Z0-9-_]|[^\u0000-\u007F])*(\(.*?\))?/)) {

  } else if (result = compoundSelector.match(/^::(?:[a-zA-Z_]|[^\u0000-\u007F])(?:[a-zA-Z0-9-_]|[^\u0000-\u007F])*(\(.*?\))?/)) {

  }
  return matched && isMatchCompound(compoundSelector.substring(result[0].length), element);
}

function isMatchSibling(compoundSelector, element) {
  let children = Array.prototype.slice.call(element.parentElement.children);
  let idx = children.indexOf(element);
  for (let i = 0; i < idx; i++) {
    if (isMatchCompound(compoundSelector, children[i])) {
      return children[i];
    }
  }
  return null;
}

function isMatchParent(compoundSelector, element) {
  let parent = element.parentElement;
  return isMatchCompound(compoundSelector, parent) ? parent : null;
}

function isMatchColumn(compoundSelector, element) {
  return element.parentElement;
}

function isMatchAncestor(compoundSelector, element) {
  let parent = element.parentElement
  while (parent != null) {
    if (isMatchCompound(compoundSelector, parent)) {
      return parent;
    } else {
      parent = parent.parentElement;
    }
  }
  return null;
}