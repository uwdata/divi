const INTERACTION_CONSTANTS = {
    INTERACTION_TYPES: {
        SELECTION: 'selection',
        ZOOM: 'zoom',
        PAN: 'pan',
        FILTER: 'filter',
        SORT: 'sort',
        BRUSH: 'brush',
        HIGHLIGHT: 'highlight',
        ANNOTATE: 'annotate'
    },
    INTERACTION_TARGETS: {
        CATEGORICAL: 'Categorical',
        CONTINUOUS: 'Continuous',
        EDGE: 'Edge',
        BACKGROUND: 'Background',
        LEGEND: 'Legend',
        TEXT: 'Text',
        BRUSH_BOX: 'Brush box',
        BRUSH_BOX_EDGE: 'Brush box edge',
        AXIS: 'axis'
    },
    INPUT_EVENTS: {
        SCROLL: 'scroll',
        LEFT_CLICK: 'left_click',
        RIGHT_CLICK: 'right_click',
        DBL_CLICK: 'dblclick',
        MOUSE_DOWN: 'mousedown',
        MOUSE_UP: 'mouseup',
        SHIFT: 'shift',
        HOVER_OVER: 'mouseover',
        HOVER_LEAVE: 'mouseleave'
    },
    SVG_TYPE: {
        SVG_CONTAINER: "svg",
        SVG_GROUP: "g",
        SVG_TICK: "tick",
        TICK_DOMAIN: "domain",
        DEFAULT_ID: "svg_plot",
        SVG_MARK: ["circle", "ellipse", "line", "polygon", "polyline", "rect", "path"],
    }
};

function max(values, valueof) {
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  }
  return max;
}

function min(values, valueof) {
  let min;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  }
  return min;
}

var noop = {value: () => {}};

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames$1(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

var xhtml = "http://www.w3.org/1999/xhtml";

var namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

function namespace(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
}

function creatorInherit(name) {
  return function() {
    var document = this.ownerDocument,
        uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml
        ? document.createElement(name)
        : document.createElementNS(uri, name);
  };
}

function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}

function creator(name) {
  var fullname = namespace(name);
  return (fullname.local
      ? creatorFixed
      : creatorInherit)(fullname);
}

function none() {}

function selector(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

function selection_select(select) {
  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }

  return new Selection$1(subgroups, this._parents);
}

// Given something array like (or null), returns something that is strictly an
// array. This is used to ensure that array-like objects passed to d3.selectAll
// or selection.selectAll are converted into proper arrays when creating a
// selection; we don’t ever want to create a selection backed by a live
// HTMLCollection or NodeList. However, note that selection.selectAll will use a
// static NodeList as a group, since it safely derived from querySelectorAll.
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}

function empty() {
  return [];
}

function selectorAll(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}

function selection_selectAll(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }

  return new Selection$1(subgroups, parents);
}

function matcher(selector) {
  return function() {
    return this.matches(selector);
  };
}

function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

var find = Array.prototype.find;

function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}

function childFirst() {
  return this.firstElementChild;
}

function selection_selectChild(match) {
  return this.select(match == null ? childFirst
      : childFind(typeof match === "function" ? match : childMatcher(match)));
}

var filter$1 = Array.prototype.filter;

function children() {
  return Array.from(this.children);
}

function childrenFilter(match) {
  return function() {
    return filter$1.call(this.children, match);
  };
}

function selection_selectChildren(match) {
  return this.selectAll(match == null ? children
      : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

function selection_filter(match) {
  if (typeof match !== "function") match = matcher(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Selection$1(subgroups, this._parents);
}

function sparse(update) {
  return new Array(update.length);
}

function selection_enter() {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}

function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}

EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
  insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
  querySelector: function(selector) { return this._parent.querySelector(selector); },
  querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
};

function constant$2(x) {
  return function() {
    return x;
  };
}

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}

function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
      node,
      nodeByKeyValue = new Map,
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
      exit[i] = node;
    }
  }
}

function datum(node) {
  return node.__data__;
}

function selection_data(value, key) {
  if (!arguments.length) return Array.from(this, datum);

  var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

  if (typeof value !== "function") value = constant$2(value);

  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
        dataLength = data.length,
        enterGroup = enter[j] = new Array(dataLength),
        updateGroup = update[j] = new Array(dataLength),
        exitGroup = exit[j] = new Array(groupLength);

    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }

  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}

// Given some data, this returns an array-like view of it: an object that
// exposes a length property and allows numeric indexing. Note that unlike
// selectAll, this isn’t worried about “live” collections because the resulting
// array will only be used briefly while data is being bound. (It is possible to
// cause the data to change while iterating by using a key function, but please
// don’t; we’d rather avoid a gratuitous copy.)
function arraylike(data) {
  return typeof data === "object" && "length" in data
    ? data // Array, TypedArray, NodeList, array-like
    : Array.from(data); // Map, Set, iterable, string, or anything else
}

function selection_exit() {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}

function selection_join(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove(); else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

function selection_merge(context) {
  var selection = context.selection ? context.selection() : context;

  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Selection$1(merges, this._parents);
}

function selection_order() {

  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }

  return this;
}

function selection_sort(compare) {
  if (!compare) compare = ascending;

  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }

  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }

  return new Selection$1(sortgroups, this._parents).order();
}

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function selection_call() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

function selection_nodes() {
  return Array.from(this);
}

function selection_node() {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }

  return null;
}

function selection_size() {
  let size = 0;
  for (const node of this) ++size; // eslint-disable-line no-unused-vars
  return size;
}

function selection_empty() {
  return !this.node();
}

function selection_each(callback) {

  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }

  return this;
}

function attrRemove$1(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS$1(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant$1(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}

function attrConstantNS$1(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}

function attrFunction$1(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}

function attrFunctionNS$1(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}

function selection_attr(name, value) {
  var fullname = namespace(name);

  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local
        ? node.getAttributeNS(fullname.space, fullname.local)
        : node.getAttribute(fullname);
  }

  return this.each((value == null
      ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
      ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
      : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
}

function defaultView(node) {
  return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
      || (node.document && node) // node is a Window
      || node.defaultView; // node is a Document
}

function styleRemove$1(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant$1(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}

function styleFunction$1(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}

function selection_style(name, value, priority) {
  return arguments.length > 1
      ? this.each((value == null
            ? styleRemove$1 : typeof value === "function"
            ? styleFunction$1
            : styleConstant$1)(name, value, priority == null ? "" : priority))
      : styleValue(this.node(), name);
}

function styleValue(node, name) {
  return node.style.getPropertyValue(name)
      || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}

function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}

function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}

function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}

function selection_property(name, value) {
  return arguments.length > 1
      ? this.each((value == null
          ? propertyRemove : typeof value === "function"
          ? propertyFunction
          : propertyConstant)(name, value))
      : this.node()[name];
}

function classArray(string) {
  return string.trim().split(/^|\s+/);
}

function classList(node) {
  return node.classList || new ClassList(node);
}

function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}

ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};

function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}

function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}

function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}

function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}

function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}

function selection_classed(name, value) {
  var names = classArray(name + "");

  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }

  return this.each((typeof value === "function"
      ? classedFunction : value
      ? classedTrue
      : classedFalse)(names, value));
}

function textRemove() {
  this.textContent = "";
}

function textConstant$1(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction$1(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}

function selection_text(value) {
  return arguments.length
      ? this.each(value == null
          ? textRemove : (typeof value === "function"
          ? textFunction$1
          : textConstant$1)(value))
      : this.node().textContent;
}

function htmlRemove() {
  this.innerHTML = "";
}

function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}

function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}

function selection_html(value) {
  return arguments.length
      ? this.each(value == null
          ? htmlRemove : (typeof value === "function"
          ? htmlFunction
          : htmlConstant)(value))
      : this.node().innerHTML;
}

function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}

function selection_raise() {
  return this.each(raise);
}

function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}

function selection_lower() {
  return this.each(lower);
}

function selection_append(name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function() {
    return this.appendChild(create.apply(this, arguments));
  });
}

function constantNull() {
  return null;
}

function selection_insert(name, before) {
  var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function() {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}

function selection_remove() {
  return this.each(remove);
}

function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}

function selection_clone(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

function selection_datum(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.node().__data__;
}

function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}

function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return {type: t, name: name};
  });
}

function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}

function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
    if (!on) this.__on = [o];
    else on.push(o);
  };
}

function selection_on(typename, value, options) {
  var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }

  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

function dispatchEvent(node, type, params) {
  var window = defaultView(node),
      event = window.CustomEvent;

  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type, false, false);
  }

  node.dispatchEvent(event);
}

function dispatchConstant(type, params) {
  return function() {
    return dispatchEvent(this, type, params);
  };
}

function dispatchFunction(type, params) {
  return function() {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}

function selection_dispatch(type, params) {
  return this.each((typeof params === "function"
      ? dispatchFunction
      : dispatchConstant)(type, params));
}

function* selection_iterator() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

var root = [null];

function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}

function selection() {
  return new Selection$1([[document.documentElement]], root);
}

function selection_selection() {
  return this;
}

Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};

function select$1(selector) {
  return typeof selector === "string"
      ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
      : new Selection$1([[selector]], root);
}

function sourceEvent(event) {
  let sourceEvent;
  while (sourceEvent = event.sourceEvent) event = sourceEvent;
  return event;
}

function pointer(event, node) {
  event = sourceEvent(event);
  if (node === undefined) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}

// These are typically used in conjunction with noevent to ensure that we can
const nonpassivecapture = {capture: true, passive: false};

function noevent$1(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

function yesdrag(view, noclick) {
  var root = view.document.documentElement,
      selection = select$1(view).on("dragstart.drag", null);
  if (noclick) {
    selection.on("click.drag", noevent$1, nonpassivecapture);
    setTimeout(function() { selection.on("click.drag", null); }, 0);
  }
  if ("onselectstart" in root) {
    selection.on("selectstart.drag", null);
  } else {
    root.style.MozUserSelect = root.__noselect;
    delete root.__noselect;
  }
}

function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  copy: function(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});

function color_formatHex() {
  return this.rgb().formatHex();
}

function color_formatHsl() {
  return hslConvert(this).formatHsl();
}

function color_formatRgb() {
  return this.rgb().formatRgb();
}

function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));

function rgb_formatHex() {
  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
}

function rgb_formatRgb() {
  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(")
      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
      + (a === 1 ? ")" : ", " + a + ")");
}

function hex(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(")
        + (this.h || 0) + ", "
        + (this.s || 0) * 100 + "%, "
        + (this.l || 0) * 100 + "%"
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

var constant$1 = x => () => x;

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
}

var interpolateRgb = (function rgbGamma(y) {
  var color = gamma(y);

  function rgb$1(start, end) {
    var r = color((start = rgb(start)).r, (end = rgb(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb$1.gamma = rgbGamma;

  return rgb$1;
})(1);

function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

function interpolateString(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: interpolateNumber(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

var degrees = 180 / Math.PI;

var identity$2 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};

function decompose(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

var svgNode;

/* eslint-disable no-undef */
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$2 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}

function parseSvg(value) {
  if (value == null) return identity$2;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$2;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {

  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }

  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }

  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
      q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }

  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }

  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }

  return function(a, b) {
    var s = [], // string constants and placeholders
        q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}

var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

var epsilon2 = 1e-12;

function cosh(x) {
  return ((x = Math.exp(x)) + 1 / x) / 2;
}

function sinh(x) {
  return ((x = Math.exp(x)) - 1 / x) / 2;
}

function tanh(x) {
  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
}

var interpolateZoom = (function zoomRho(rho, rho2, rho4) {

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function zoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
        dx = ux1 - ux0,
        dy = uy1 - uy0,
        d2 = dx * dx + dy * dy,
        i,
        S;

    // Special case for u0 ≅ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    }

    // General case.
    else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }

    i.duration = S * 1000 * rho / Math.SQRT2;

    return i;
  }

  zoom.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };

  return zoom;
})(Math.SQRT2, 2, 4);

var frame = 0, // is an animation frame pending?
    timeout$1 = 0, // is a timeout pending?
    interval = 0, // are any timers active?
    pokeDelay = 1000, // how frequently we check for clock skew
    taskHead,
    taskTail,
    clockLast = 0,
    clockNow = 0,
    clockSkew = 0,
    clock = typeof performance === "object" && performance.now ? performance : Date,
    setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}

function clearNow() {
  clockNow = 0;
}

function Timer() {
  this._call =
  this._time =
  this._next = null;
}

Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};

function timer(callback, delay, time) {
  var t = new Timer;
  t.restart(callback, delay, time);
  return t;
}

function timerFlush() {
  now(); // Get the current time, if not already set.
  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
    t = t._next;
  }
  --frame;
}

function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}

function poke() {
  var now = clock.now(), delay = now - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}

function nap() {
  var t0, t1 = taskHead, t2, time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}

function sleep(time) {
  if (frame) return; // Soonest alarm already set, or will be.
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

function timeout(callback, delay, time) {
  var t = new Timer;
  delay = delay == null ? 0 : +delay;
  t.restart(elapsed => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];

var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;

function schedule(node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id in schedules) return;
  create(node, id, {
    name: name,
    index: index, // For context during callback.
    group: group, // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}

function init(node, id) {
  var schedule = get(node, id);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}

function set(node, id) {
  var schedule = get(node, id);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}

function get(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
  return schedule;
}

function create(node, id, self) {
  var schedules = node.__transition,
      tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = timer(schedule, 0, self.time);

  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) start(elapsed - self.delay);
  }

  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== SCHEDULED) return stop();

    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) return timeout(start);

      // Interrupt the active transition, if any.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions.
      else if (+i < id) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    timeout(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return; // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }

  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
        i = -1,
        n = tween.length;

    while (++i < n) {
      tween[i].call(node, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }

  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) return; // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

function interrupt(node, name) {
  var schedules = node.__transition,
      schedule,
      active,
      empty = true,
      i;

  if (!schedules) return;

  name = name == null ? null : name + "";

  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }

  if (empty) delete node.__transition;
}

function selection_interrupt(name) {
  return this.each(function() {
    interrupt(this, name);
  });
}

function tweenRemove(id, name) {
  var tween0, tween1;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }

    schedule.tween = tween1;
  };
}

function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error;
  return function() {
    var schedule = set(this, id),
        tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }

    schedule.tween = tween1;
  };
}

function transition_tween(name, value) {
  var id = this._id;

  name += "";

  if (arguments.length < 2) {
    var tween = get(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }

  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
}

function tweenValue(transition, name, value) {
  var id = transition._id;

  transition.each(function() {
    var schedule = set(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });

  return function(node) {
    return get(node, id).value[name];
  };
}

function interpolate(a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber
      : b instanceof color ? interpolateRgb
      : (c = color(b)) ? (b = c, interpolateRgb)
      : interpolateString)(a, b);
}

function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}

function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}

function attrConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrConstantNS(fullname, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function attrFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function attrFunctionNS(fullname, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function transition_attr(name, value) {
  var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function"
      ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
      : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
      : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}

function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}

function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}

function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function transition_attrTween(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

function delayFunction(id, value) {
  return function() {
    init(this, id).delay = +value.apply(this, arguments);
  };
}

function delayConstant(id, value) {
  return value = +value, function() {
    init(this, id).delay = value;
  };
}

function transition_delay(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? delayFunction
          : delayConstant)(id, value))
      : get(this.node(), id).delay;
}

function durationFunction(id, value) {
  return function() {
    set(this, id).duration = +value.apply(this, arguments);
  };
}

function durationConstant(id, value) {
  return value = +value, function() {
    set(this, id).duration = value;
  };
}

function transition_duration(value) {
  var id = this._id;

  return arguments.length
      ? this.each((typeof value === "function"
          ? durationFunction
          : durationConstant)(id, value))
      : get(this.node(), id).duration;
}

function easeConstant(id, value) {
  if (typeof value !== "function") throw new Error;
  return function() {
    set(this, id).ease = value;
  };
}

function transition_ease(value) {
  var id = this._id;

  return arguments.length
      ? this.each(easeConstant(id, value))
      : get(this.node(), id).ease;
}

function easeVarying(id, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error;
    set(this, id).ease = v;
  };
}

function transition_easeVarying(value) {
  if (typeof value !== "function") throw new Error;
  return this.each(easeVarying(this._id, value));
}

function transition_filter(match) {
  if (typeof match !== "function") match = matcher(match);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }

  return new Transition(subgroups, this._parents, this._name, this._id);
}

function transition_merge(transition) {
  if (transition._id !== this._id) throw new Error;

  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }

  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }

  return new Transition(merges, this._parents, this._name, this._id);
}

function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}

function onFunction(id, name, listener) {
  var on0, on1, sit = start(name) ? init : set;
  return function() {
    var schedule = sit(this, id),
        on = schedule.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

    schedule.on = on1;
  };
}

function transition_on(name, listener) {
  var id = this._id;

  return arguments.length < 2
      ? get(this.node(), id).on.on(name)
      : this.each(onFunction(id, name, listener));
}

function removeFunction(id) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id) return;
    if (parent) parent.removeChild(this);
  };
}

function transition_remove() {
  return this.on("end.remove", removeFunction(this._id));
}

function transition_select(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selector(select);

  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id, i, subgroup, get(node, id));
      }
    }
  }

  return new Transition(subgroups, this._parents, name, id);
}

function transition_selectAll(select) {
  var name = this._name,
      id = this._id;

  if (typeof select !== "function") select = selectorAll(select);

  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }

  return new Transition(subgroups, parents, name, id);
}

var Selection = selection.prototype.constructor;

function transition_selection() {
  return new Selection(this._groups, this._parents);
}

function styleNull(name, interpolate) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = styleValue(this, name),
        string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}

function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}

function styleConstant(name, interpolate, value1) {
  var string00,
      string1 = value1 + "",
      interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null
        : string0 === string00 ? interpolate0
        : interpolate0 = interpolate(string00 = string0, value1);
  };
}

function styleFunction(name, interpolate, value) {
  var string00,
      string10,
      interpolate0;
  return function() {
    var string0 = styleValue(this, name),
        value1 = value(this),
        string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null
        : string0 === string00 && string1 === string10 ? interpolate0
        : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}

function styleMaybeRemove(id, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
  return function() {
    var schedule = set(this, id),
        on = schedule.on,
        listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

    schedule.on = on1;
  };
}

function transition_style(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this
      .styleTween(name, styleNull(name, i))
      .on("end.style." + name, styleRemove(name))
    : typeof value === "function" ? this
      .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
      .each(styleMaybeRemove(this._id, name))
    : this
      .styleTween(name, styleConstant(name, i, value), priority)
      .on("end.style." + name, null);
}

function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}

function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}

function transition_styleTween(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}

function textFunction(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}

function transition_text(value) {
  return this.tween("text", typeof value === "function"
      ? textFunction(tweenValue(this, "text", value))
      : textConstant(value == null ? "" : value + ""));
}

function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}

function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}

function transition_textTween(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error;
  return this.tween(key, textTween(value));
}

function transition_transition() {
  var name = this._name,
      id0 = this._id,
      id1 = newId();

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }

  return new Transition(groups, this._parents, name, id1);
}

function transition_end() {
  var on0, on1, that = this, id = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = {value: reject},
        end = {value: function() { if (--size === 0) resolve(); }};

    that.each(function() {
      var schedule = set(this, id),
          on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }

      schedule.on = on1;
    });

    // The selection was empty, resolve end immediately
    if (size === 0) resolve();
  });
}

var id = 0;

function Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}

function newId() {
  return ++id;
}

var selection_prototype = selection.prototype;

Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

var defaultTiming = {
  time: null, // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};

function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id} not found`);
    }
  }
  return timing;
}

function selection_transition(name) {
  var id,
      timing;

  if (name instanceof Transition) {
    id = name._id, name = name._name;
  } else {
    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }

  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }

  return new Transition(groups, this._parents, name, id);
}

selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;

function identity$1(x) {
    return x;
}

/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */

function peg$subclass(child, parent) {
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.location = location;
  this.name     = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { svg_path: peg$parsesvg_path },
      peg$startRuleFunction  = peg$parsesvg_path,

      peg$c0 = function(data) {
          if (!data) return [];
          for (var cmds=[],i=0;i<data.length;i++) cmds=cmds.concat.apply(cmds,data[i]);
          var first=cmds[0];
          if (first && first.code=='m'){ // Per spec, first moveto is never relative
            delete first.relative;
            first.code = 'M';
          }
          return cmds;
        },
      peg$c1 = function(first, more) { return merge(first,more) },
      peg$c2 = /^[Mm]/,
      peg$c3 = peg$classExpectation(["M", "m"], false, false),
      peg$c4 = function(c, first, more) {
          var move = commands(c,[first]);
          if (more) move = move.concat(commands(c=='M' ? 'L' : 'l',more[1]));
          return move;
        },
      peg$c5 = /^[Zz]/,
      peg$c6 = peg$classExpectation(["Z", "z"], false, false),
      peg$c7 = function() { return commands('Z') },
      peg$c8 = /^[Ll]/,
      peg$c9 = peg$classExpectation(["L", "l"], false, false),
      peg$c10 = function(c, args) { return commands(c,args) },
      peg$c11 = /^[Hh]/,
      peg$c12 = peg$classExpectation(["H", "h"], false, false),
      peg$c13 = function(c, args) { return commands(c,args.map(function(x){ return {x:x}})) },
      peg$c14 = /^[Vv]/,
      peg$c15 = peg$classExpectation(["V", "v"], false, false),
      peg$c16 = function(c, args) { return commands(c,args.map(function(y){ return {y:y}})) },
      peg$c17 = /^[Cc]/,
      peg$c18 = peg$classExpectation(["C", "c"], false, false),
      peg$c19 = function(a, b, c) { return { x1:a.x, y1:a.y, x2:b.x, y2:b.y, x:c.x, y:c.y } },
      peg$c20 = /^[Ss]/,
      peg$c21 = peg$classExpectation(["S", "s"], false, false),
      peg$c22 = function(b, c) { return { x2:b.x, y2:b.y, x:c.x, y:c.y } },
      peg$c23 = /^[Qq]/,
      peg$c24 = peg$classExpectation(["Q", "q"], false, false),
      peg$c25 = function(a, b) { return { x1:a.x, y1:a.y, x:b.x, y:b.y } },
      peg$c26 = /^[Tt]/,
      peg$c27 = peg$classExpectation(["T", "t"], false, false),
      peg$c28 = /^[Aa]/,
      peg$c29 = peg$classExpectation(["A", "a"], false, false),
      peg$c30 = function(rx, ry, xrot, large, sweep, xy) { return { rx:rx, ry:ry, xAxisRotation:xrot, largeArc:large, sweep:sweep, x:xy.x, y:xy.y } },
      peg$c31 = function(x, y) { return { x:x, y:y } },
      peg$c32 = function(n) { return n*1 },
      peg$c33 = function(parts) { return parts.join('')*1 },
      peg$c34 = /^[01]/,
      peg$c35 = peg$classExpectation(["0", "1"], false, false),
      peg$c36 = function(bit) { return bit=='1' },
      peg$c37 = function() { return '' },
      peg$c38 = ",",
      peg$c39 = peg$literalExpectation(",", false),
      peg$c40 = function(parts) { return parts.join('') },
      peg$c41 = ".",
      peg$c42 = peg$literalExpectation(".", false),
      peg$c43 = /^[eE]/,
      peg$c44 = peg$classExpectation(["e", "E"], false, false),
      peg$c45 = /^[+\-]/,
      peg$c46 = peg$classExpectation(["+", "-"], false, false),
      peg$c47 = /^[0-9]/,
      peg$c48 = peg$classExpectation([["0", "9"]], false, false),
      peg$c49 = function(digits) { return digits.join('') },
      peg$c50 = /^[ \t\n\r]/,
      peg$c51 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),

      peg$currPos          = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
      peg$maxFailPos       = 0,
      peg$maxFailExpected  = [],
      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line:   details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails   = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line:   startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line:   endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parsesvg_path() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsewsp();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsewsp();
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsemoveTo_drawTo_commandGroups();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsewsp();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsewsp();
        }
        if (s3 !== peg$FAILED) {
          s1 = peg$c0(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsemoveTo_drawTo_commandGroups() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsemoveTo_drawTo_commandGroup();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = [];
      s5 = peg$parsewsp();
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$parsewsp();
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsemoveTo_drawTo_commandGroup();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsemoveTo_drawTo_commandGroup();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsemoveTo_drawTo_commandGroup() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsemoveto();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = [];
      s5 = peg$parsewsp();
      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$parsewsp();
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsedrawto_command();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parsewsp();
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsedrawto_command();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedrawto_command() {
    var s0;

    s0 = peg$parseclosepath();
    if (s0 === peg$FAILED) {
      s0 = peg$parselineto();
      if (s0 === peg$FAILED) {
        s0 = peg$parsehorizontal_lineto();
        if (s0 === peg$FAILED) {
          s0 = peg$parsevertical_lineto();
          if (s0 === peg$FAILED) {
            s0 = peg$parsecurveto();
            if (s0 === peg$FAILED) {
              s0 = peg$parsesmooth_curveto();
              if (s0 === peg$FAILED) {
                s0 = peg$parsequadratic_bezier_curveto();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsesmooth_quadratic_bezier_curveto();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseelliptical_arc();
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsemoveto() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    if (peg$c2.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c3); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          s5 = peg$parsecomma_wsp();
          if (s5 === peg$FAILED) {
            s5 = null;
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parselineto_argument_sequence();
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s1 = peg$c4(s1, s3, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseclosepath() {
    var s0, s1;

    s0 = peg$currPos;
    if (peg$c5.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c6); }
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c7();
    }
    s0 = s1;

    return s0;
  }

  function peg$parselineto() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c8.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c9); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parselineto_argument_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parselineto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsecoordinate_pair();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsecoordinate_pair();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsehorizontal_lineto() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c11.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c12); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c13(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecoordinate_sequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsenumber();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsenumber();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsenumber();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsevertical_lineto() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c14.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c15); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c16(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecurveto() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c17.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c18); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecurveto_argument_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecurveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsecurveto_argument();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsecurveto_argument();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsecurveto_argument();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecurveto_argument() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsecomma_wsp();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsecoordinate_pair();
            if (s5 !== peg$FAILED) {
              s1 = peg$c19(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_curveto() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c20.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c21); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsesmooth_curveto_argument_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_curveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsesmooth_curveto_argument();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsesmooth_curveto_argument();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsesmooth_curveto_argument();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_curveto_argument() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();
        if (s3 !== peg$FAILED) {
          s1 = peg$c22(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsequadratic_bezier_curveto() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c23.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c24); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsequadratic_bezier_curveto_argument_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsequadratic_bezier_curveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsequadratic_bezier_curveto_argument();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsequadratic_bezier_curveto_argument();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsequadratic_bezier_curveto_argument();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsequadratic_bezier_curveto_argument() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();
        if (s3 !== peg$FAILED) {
          s1 = peg$c25(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_quadratic_bezier_curveto() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c26.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c27); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsesmooth_quadratic_bezier_curveto_argument_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_quadratic_bezier_curveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parsecoordinate_pair();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parsecoordinate_pair();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseelliptical_arc() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (peg$c28.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c29); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseelliptical_arc_argument_sequence();
        if (s3 !== peg$FAILED) {
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseelliptical_arc_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseelliptical_arc_argument();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();
      if (s4 === peg$FAILED) {
        s4 = null;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseelliptical_arc_argument();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();
        if (s4 === peg$FAILED) {
          s4 = null;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseelliptical_arc_argument();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseelliptical_arc_argument() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

    s0 = peg$currPos;
    s1 = peg$parsenonnegative_number();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenonnegative_number();
        if (s3 !== peg$FAILED) {
          s4 = peg$parsecomma_wsp();
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parsenumber();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsecomma_wsp();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseflag();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parsecomma_wsp();
                  if (s8 === peg$FAILED) {
                    s8 = null;
                  }
                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseflag();
                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsecomma_wsp();
                      if (s10 === peg$FAILED) {
                        s10 = null;
                      }
                      if (s10 !== peg$FAILED) {
                        s11 = peg$parsecoordinate_pair();
                        if (s11 !== peg$FAILED) {
                          s1 = peg$c30(s1, s3, s5, s7, s9, s11);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecoordinate_pair() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsenumber();
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();
        if (s3 !== peg$FAILED) {
          s1 = peg$c31(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsenonnegative_number() {
    var s0, s1;

    s0 = peg$currPos;
    s1 = peg$parsefloating_point_constant();
    if (s1 === peg$FAILED) {
      s1 = peg$parsedigit_sequence();
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c32(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsenumber() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsesign();
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsefloating_point_constant();
      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$parsesign();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsedigit_sequence();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c33(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseflag() {
    var s0, s1;

    s0 = peg$currPos;
    if (peg$c34.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c35); }
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c36(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsecomma_wsp() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsewsp();
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsewsp();
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma();
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsewsp();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsewsp();
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsecomma();
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsewsp();
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsewsp();
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s1 = peg$c37();
      }
      s0 = s1;
    }

    return s0;
  }

  function peg$parsecomma() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 44) {
      s0 = peg$c38;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      { peg$fail(peg$c39); }
    }

    return s0;
  }

  function peg$parsefloating_point_constant() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsefractional_constant();
    if (s2 !== peg$FAILED) {
      s3 = peg$parseexponent();
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$parsedigit_sequence();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseexponent();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c40(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsefractional_constant() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsedigit_sequence();
    if (s2 === peg$FAILED) {
      s2 = null;
    }
    if (s2 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s3 = peg$c41;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        { peg$fail(peg$c42); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsedigit_sequence();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$parsedigit_sequence();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c41;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          { peg$fail(peg$c42); }
        }
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c40(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parseexponent() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$currPos;
    if (peg$c43.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      { peg$fail(peg$c44); }
    }
    if (s2 !== peg$FAILED) {
      s3 = peg$parsesign();
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parsedigit_sequence();
        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c40(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsesign() {
    var s0;

    if (peg$c45.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      { peg$fail(peg$c46); }
    }

    return s0;
  }

  function peg$parsedigit_sequence() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = [];
    if (peg$c47.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      { peg$fail(peg$c48); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        if (peg$c47.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          { peg$fail(peg$c48); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c49(s1);
    }
    s0 = s1;

    return s0;
  }

  function peg$parsewsp() {
    var s0, s1;

    s0 = peg$currPos;
    if (peg$c50.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      { peg$fail(peg$c51); }
    }
    if (s1 !== peg$FAILED) {
      s1 = peg$c37();
    }
    s0 = s1;

    return s0;
  }


    function merge(first,more){
      if (!more) return [first];
      for (var a=[first],i=0,l=more.length;i<l;i++) a[i+1]=more[i][1];
      return a;
    }

    var cmds = {m:'moveto',l:'lineto',h:'horizontal lineto',v:'vertical lineto',c:'curveto',s:'smooth curveto',q:'quadratic curveto',t:'smooth quadratic curveto',a:'elliptical arc',z:'closepath'};
    for (var code in cmds) cmds[code.toUpperCase()]=cmds[code];
    function commands(code,args){
      if (!args) args=[{}];
      for (var i=args.length;i--;){
        var cmd={code:code,command:cmds[code]};
        if (code==code.toLowerCase()) cmd.relative=true;
        for (var k in args[i]) cmd[k]=args[i][k];
        args[i] = cmd;
      }
      return args;
    }


  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

var parser = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};

// v1.0 exported just the parser function. To maintain backwards compatibility,
// we export additional named features as properties of that function.
var parserFunction = parser.parse;
parserFunction.parseSVG = parserFunction;
parserFunction.makeAbsolute = makeSVGPathCommandsAbsolute;
var svgPathParser = parserFunction;

function makeSVGPathCommandsAbsolute(commands) {
	var subpathStart, prevCmd={x:0,y:0};
	var attr = {x:'x0',y:'y0',x1:'x0',y1:'y0',x2:'x0',y2:'y0'};
	commands.forEach(function(cmd) {
		if (cmd.command==='moveto') subpathStart=cmd;
		cmd.x0=prevCmd.x; cmd.y0=prevCmd.y;
		for (var a in attr) if (a in cmd) cmd[a] += cmd.relative ? cmd[attr[a]] : 0;
		if (!('x' in cmd)) cmd.x = prevCmd.x; // V
		if (!('y' in cmd)) cmd.y = prevCmd.y; // X
		cmd.relative = false;
		cmd.code = cmd.code.toUpperCase();
		if (cmd.command=='closepath') {
			cmd.x = subpathStart.x;
			cmd.y = subpathStart.y;
		}
		prevCmd = cmd;
	});
	return commands;
}

var constant = x => () => x;

function ZoomEvent(type, {
  sourceEvent,
  target,
  transform,
  dispatch
}) {
  Object.defineProperties(this, {
    type: {value: type, enumerable: true, configurable: true},
    sourceEvent: {value: sourceEvent, enumerable: true, configurable: true},
    target: {value: target, enumerable: true, configurable: true},
    transform: {value: transform, enumerable: true, configurable: true},
    _: {value: dispatch}
  });
}

function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}

Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x) {
    return x * this.k + this.x;
  },
  applyY: function(y) {
    return y * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x) {
    return (x - this.x) / this.k;
  },
  invertY: function(y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function(x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function(y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};

var identity = new Transform(1, 0, 0);

function nopropagation(event) {
  event.stopImmediatePropagation();
}

function noevent(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

// Ignore right-click, since that should open the context menu.
// except for pinch-to-zoom, which is sent as a wheel+ctrlKey event
function defaultFilter(event) {
  return (!event.ctrlKey || event.type === 'wheel') && !event.button;
}

function defaultExtent() {
  var e = this;
  if (e instanceof SVGElement) {
    e = e.ownerSVGElement || e;
    if (e.hasAttribute("viewBox")) {
      e = e.viewBox.baseVal;
      return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
    }
    return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
  }
  return [[0, 0], [e.clientWidth, e.clientHeight]];
}

function defaultTransform() {
  return this.__zoom || identity;
}

function defaultWheelDelta(event) {
  return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * (event.ctrlKey ? 10 : 1);
}

function defaultTouchable() {
  return navigator.maxTouchPoints || ("ontouchstart" in this);
}

function defaultConstrain(transform, extent, translateExtent) {
  var dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0],
      dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0],
      dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1],
      dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
  return transform.translate(
    dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
    dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
  );
}

function zoom() {
  var filter = defaultFilter,
      extent = defaultExtent,
      constrain = defaultConstrain,
      wheelDelta = defaultWheelDelta,
      touchable = defaultTouchable,
      scaleExtent = [0, Infinity],
      translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
      duration = 250,
      interpolate = interpolateZoom,
      listeners = dispatch("start", "zoom", "end"),
      touchstarting,
      touchfirst,
      touchending,
      touchDelay = 500,
      wheelDelay = 150,
      clickDistance2 = 0,
      tapDistance = 10;

  function zoom(selection) {
    selection
        .property("__zoom", defaultTransform)
        .on("wheel.zoom", wheeled, {passive: false})
        .on("mousedown.zoom", mousedowned)
        .on("dblclick.zoom", dblclicked)
      .filter(touchable)
        .on("touchstart.zoom", touchstarted)
        .on("touchmove.zoom", touchmoved)
        .on("touchend.zoom touchcancel.zoom", touchended)
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }

  zoom.transform = function(collection, transform, point, event) {
    var selection = collection.selection ? collection.selection() : collection;
    selection.property("__zoom", defaultTransform);
    if (collection !== selection) {
      schedule(collection, transform, point, event);
    } else {
      selection.interrupt().each(function() {
        gesture(this, arguments)
          .event(event)
          .start()
          .zoom(null, typeof transform === "function" ? transform.apply(this, arguments) : transform)
          .end();
      });
    }
  };

  zoom.scaleBy = function(selection, k, p, event) {
    zoom.scaleTo(selection, function() {
      var k0 = this.__zoom.k,
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return k0 * k1;
    }, p, event);
  };

  zoom.scaleTo = function(selection, k, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t0 = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p,
          p1 = t0.invert(p0),
          k1 = typeof k === "function" ? k.apply(this, arguments) : k;
      return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
    }, p, event);
  };

  zoom.translateBy = function(selection, x, y, event) {
    zoom.transform(selection, function() {
      return constrain(this.__zoom.translate(
        typeof x === "function" ? x.apply(this, arguments) : x,
        typeof y === "function" ? y.apply(this, arguments) : y
      ), extent.apply(this, arguments), translateExtent);
    }, null, event);
  };

  zoom.translateTo = function(selection, x, y, p, event) {
    zoom.transform(selection, function() {
      var e = extent.apply(this, arguments),
          t = this.__zoom,
          p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
      return constrain(identity.translate(p0[0], p0[1]).scale(t.k).translate(
        typeof x === "function" ? -x.apply(this, arguments) : -x,
        typeof y === "function" ? -y.apply(this, arguments) : -y
      ), e, translateExtent);
    }, p, event);
  };

  function scale(transform, k) {
    k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
    return k === transform.k ? transform : new Transform(k, transform.x, transform.y);
  }

  function translate(transform, p0, p1) {
    var x = p0[0] - p1[0] * transform.k, y = p0[1] - p1[1] * transform.k;
    return x === transform.x && y === transform.y ? transform : new Transform(transform.k, x, y);
  }

  function centroid(extent) {
    return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
  }

  function schedule(transition, transform, point, event) {
    transition
        .on("start.zoom", function() { gesture(this, arguments).event(event).start(); })
        .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).event(event).end(); })
        .tween("zoom", function() {
          var that = this,
              args = arguments,
              g = gesture(that, args).event(event),
              e = extent.apply(that, args),
              p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point,
              w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
              a = that.__zoom,
              b = typeof transform === "function" ? transform.apply(that, args) : transform,
              i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
          return function(t) {
            if (t === 1) t = b; // Avoid rounding error on end.
            else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
            g.zoom(null, t);
          };
        });
  }

  function gesture(that, args, clean) {
    return (!clean && that.__zooming) || new Gesture(that, args);
  }

  function Gesture(that, args) {
    this.that = that;
    this.args = args;
    this.active = 0;
    this.sourceEvent = null;
    this.extent = extent.apply(that, args);
    this.taps = 0;
  }

  Gesture.prototype = {
    event: function(event) {
      if (event) this.sourceEvent = event;
      return this;
    },
    start: function() {
      if (++this.active === 1) {
        this.that.__zooming = this;
        this.emit("start");
      }
      return this;
    },
    zoom: function(key, transform) {
      if (this.mouse && key !== "mouse") this.mouse[1] = transform.invert(this.mouse[0]);
      if (this.touch0 && key !== "touch") this.touch0[1] = transform.invert(this.touch0[0]);
      if (this.touch1 && key !== "touch") this.touch1[1] = transform.invert(this.touch1[0]);
      this.that.__zoom = transform;
      this.emit("zoom");
      return this;
    },
    end: function() {
      if (--this.active === 0) {
        delete this.that.__zooming;
        this.emit("end");
      }
      return this;
    },
    emit: function(type) {
      var d = select$1(this.that).datum();
      listeners.call(
        type,
        this.that,
        new ZoomEvent(type, {
          sourceEvent: this.sourceEvent,
          target: zoom,
          type,
          transform: this.that.__zoom,
          dispatch: listeners
        }),
        d
      );
    }
  };

  function wheeled(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var g = gesture(this, args).event(event),
        t = this.__zoom,
        k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
        p = pointer(event);

    // If the mouse is in the same location as before, reuse it.
    // If there were recent wheel events, reset the wheel idle timeout.
    if (g.wheel) {
      if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
        g.mouse[1] = t.invert(g.mouse[0] = p);
      }
      clearTimeout(g.wheel);
    }

    // If this wheel event won’t trigger a transform change, ignore it.
    else if (t.k === k) return;

    // Otherwise, capture the mouse point and location at the start.
    else {
      g.mouse = [p, t.invert(p)];
      interrupt(this);
      g.start();
    }

    noevent(event);
    g.wheel = setTimeout(wheelidled, wheelDelay);
    g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

    function wheelidled() {
      g.wheel = null;
      g.end();
    }
  }

  function mousedowned(event, ...args) {
    if (touchending || !filter.apply(this, arguments)) return;
    var currentTarget = event.currentTarget,
        g = gesture(this, args, true).event(event),
        v = select$1(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
        p = pointer(event, currentTarget),
        x0 = event.clientX,
        y0 = event.clientY;

    // dragDisable(event.view);
    // nopropagation(event);
    g.mouse = [p, this.__zoom.invert(p)];
    interrupt(this);
    g.start();

    function mousemoved(event) {
      // noevent(event);
      if (!g.moved) {
        var dx = event.clientX - x0, dy = event.clientY - y0;
        g.moved = dx * dx + dy * dy > clickDistance2;
      }
      g.event(event)
       .zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer(event, currentTarget), g.mouse[1]), g.extent, translateExtent));
    }

    function mouseupped(event) {
      v.on("mousemove.zoom mouseup.zoom", null);
      yesdrag(event.view, g.moved);
      // noevent(event);
      g.event(event).end();
    }
  }

  function dblclicked(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var t0 = this.__zoom,
        p0 = pointer(event.changedTouches ? event.changedTouches[0] : event, this),
        p1 = t0.invert(p0),
        k1 = t0.k * (event.shiftKey ? 0.5 : 2),
        t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);

    noevent(event);
    if (duration > 0) select$1(this).transition().duration(duration).call(schedule, t1, p0, event);
    else select$1(this).call(zoom.transform, t1, p0, event);
  }

  function touchstarted(event, ...args) {
    if (!filter.apply(this, arguments)) return;
    var touches = event.touches,
        n = touches.length,
        g = gesture(this, args, event.changedTouches.length === n).event(event),
        started, i, t, p;

    nopropagation(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      p = [p, this.__zoom.invert(p), t.identifier];
      if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
      else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
    }

    if (touchstarting) touchstarting = clearTimeout(touchstarting);

    if (started) {
      if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
      interrupt(this);
      g.start();
    }
  }

  function touchmoved(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t, p, l;

    noevent(event);
    for (i = 0; i < n; ++i) {
      t = touches[i], p = pointer(t, this);
      if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
      else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
    }
    t = g.that.__zoom;
    if (g.touch1) {
      var p0 = g.touch0[0], l0 = g.touch0[1],
          p1 = g.touch1[0], l1 = g.touch1[1],
          dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
          dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
      t = scale(t, Math.sqrt(dp / dl));
      p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
    }
    else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
    else return;

    g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
  }

  function touchended(event, ...args) {
    if (!this.__zooming) return;
    var g = gesture(this, args).event(event),
        touches = event.changedTouches,
        n = touches.length, i, t;

    nopropagation(event);
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() { touchending = null; }, touchDelay);
    for (i = 0; i < n; ++i) {
      t = touches[i];
      if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
      else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
    }
    if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
    if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
    else {
      g.end();
      // If this was a dbltap, reroute to the (optional) dblclick.zoom handler.
      if (g.taps === 2) {
        t = pointer(t, this);
        if (Math.hypot(touchfirst[0] - t[0], touchfirst[1] - t[1]) < tapDistance) {
          var p = select$1(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
        }
      }
    }
  }

  zoom.wheelDelta = function(_) {
    return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant(+_), zoom) : wheelDelta;
  };

  zoom.filter = function(_) {
    return arguments.length ? (filter = typeof _ === "function" ? _ : constant(!!_), zoom) : filter;
  };

  zoom.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant(!!_), zoom) : touchable;
  };

  zoom.extent = function(_) {
    return arguments.length ? (extent = typeof _ === "function" ? _ : constant([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
  };

  zoom.scaleExtent = function(_) {
    return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
  };

  zoom.translateExtent = function(_) {
    return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
  };

  zoom.constrain = function(_) {
    return arguments.length ? (constrain = _, zoom) : constrain;
  };

  zoom.duration = function(_) {
    return arguments.length ? (duration = +_, zoom) : duration;
  };

  zoom.interpolate = function(_) {
    return arguments.length ? (interpolate = _, zoom) : interpolate;
  };

  zoom.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? zoom : value;
  };

  zoom.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
  };

  zoom.tapDistance = function(_) {
    return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
  };

  return zoom;
}

// import { ticks } from "d3";
// import { ZoomTransform } from 'd3-zoom';

function _zoom(SVG, control, axis_control) {
    var svg = d3.select("#" + SVG.state().svg.id);

    if (SVG.state().x_axis.scale && !SVG.state().x_axis.ordinal.length) SVG.state().x_axis.axis.scale(SVG.state().x_axis.scale)();
    if (SVG.state().y_axis.scale && !SVG.state().y_axis.ordinal.length) SVG.state().y_axis.axis.scale(SVG.state().y_axis.scale)();

    svg.append('defs')
        .append('clipPath')
        .attr('id', 'clip-' + SVG.state().svg.id)
        .append('rect')
        .attr('x', SVG.state().x_axis.range[0])
        .attr('y', SVG.state().y_axis.range[1])
        .attr('width', Math.abs(SVG.state().x_axis.range[1] - SVG.state().x_axis.range[0]))
        .attr('height', Math.abs(SVG.state().y_axis.range[0] - SVG.state().y_axis.range[1]));

    const marks = svg.selectAll('[__mark__="true"]');

    // if (marks.node().parentElement.id !== "_g_clip") {
    for (const node of marks.nodes()) {
        let container = node.parentElement;
        if (container.id !== "_g_clip") {
            container = document.createElementNS("http://www.w3.org/2000/svg", "g");
            container.id = "_g_clip";
            container.setAttribute('clip-path', 'url(#clip-' + SVG.state().svg.id + ')'); 

            node.parentElement.appendChild(container);
        }  
        container.appendChild(node);
    }

    // if (marks.node().parentElement.id !== "_g_clip") {
    //     let container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    //     container.id = "_g_clip";
    //     marks.node().parentElement.appendChild(container);
    //     marks.nodes().forEach(d => container.appendChild(d));
    // }
    // marks.node().parentElement.setAttribute('clip-path', 'url(#clip-' + SVG.state().svg.id + ')');
    var left_bound = marks.node()._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
    var top_bound = marks.node()._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;

    // var g_x_axis = d3.select(".x-axis.tick").select(function() { return this.parentNode; });
    // var g_y_axis = d3.select(".y-axis.tick").select(function() { return this.parentNode; });
    var g_x_axis = svg.append("g").attr("id", "x-axis-zoom-accessor");
    var g_y_axis = svg.append("g").attr("id", "y-axis-zoom-accessor");

    let z = d3.zoomIdentity;
    const zoomX = zoom();
    const zoomY = zoom();
    const tx = () => d3.zoomTransform(g_x_axis.node());
    const ty = () => d3.zoomTransform(g_y_axis.node());
    g_x_axis.call(zoomX).attr("pointer-events", "none");
    g_y_axis.call(zoomY).attr("pointer-events", "none");

    let zoom_callback = function({sourceEvent, transform}) {
        // var zoom_enabled = document.getElementById("zoom").checked;
        // var pan_enabled = document.getElementById("pan").checked;
        sourceEvent.preventDefault();
        document.getElementById("modebar").style['visibility'] = 'hidden';
        // if (SVG.state().interactions.pan.flag) document.getElementById("brush_disam").style['display'] = 'block';
        var pan_enabled = true,
            control_zoom_X = true,
            control_pan_X = SVG.state().interactions.pan.flag,
            control_pan_Y = SVG.state().interactions.pan.flag,
            pan_shift = false;
        // var control_zoom_X = document.getElementById("zoom-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("zoom-x").className.split(" ").indexOf("bg-primary") > -1;
        // var control_zoom_Y = document.getElementById("zoom-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("zoom-y").className.split(" ").indexOf("bg-primary") > -1;
        // var control_pan_X = document.getElementById("pan-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("pan-x").className.split(" ").indexOf("bg-primary") > -1;
        // var control_pan_Y = document.getElementById("pan-2d").className.split(" ").indexOf("bg-primary") > -1 ||
        //     document.getElementById("pan-y").className.split(" ").indexOf("bg-primary") > -1;

        // var pan_shift = document.getElementById("pan-shift").className.split(" ").indexOf("bg-primary") > -1 &&
        //     document.getElementById("pan-drag").className.split(" ").indexOf("bg-primary") <= -1;

        const k = transform.k / z.k;
        const x = (transform.x - z.x) / tx().k;
        const y = (transform.y - z.y) / ty().k;

        if (!SVG.state().x_axis.axis && !SVG.state().y_axis.axis) {
            console.log('here');
            let cliX = sourceEvent.clientX - marks.node()._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
            let cliY = sourceEvent.clientY - marks.node()._global_transform[1] - SVG.state().svg.getBoundingClientRect().top;

            if (k === 1) {
                control_pan_X && g_x_axis.call(zoomX.translateBy, x, 0);
                control_pan_Y && g_y_axis.call(zoomY.translateBy, 0, y);
            } else {
                g_x_axis.call(zoomX.scaleBy, k, [cliX, cliY]);
                g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);
                SVG.disambiguate("zoom", true);
            }
            marks.attr('transform', 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
            svg.selectAll('text').attr('transform','translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')');
            z = transform;
            return;
        }

        let zoom_X = sourceEvent.clientX - left_bound > SVG.state().x_axis.range[0], 
            zoom_Y = sourceEvent.clientY - top_bound < SVG.state().y_axis.range[0];
        let cliX = sourceEvent.clientX - marks.node()._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
        let cliY = sourceEvent.clientY - marks.node()._global_transform[1] - SVG.state().svg.getBoundingClientRect().top;

        // let std = SVG.std();
        // if (std < 0.5 && zoom_X && zoom_Y) {
        //     zoom_X = true;
        //     zoom_Y = false;
        // } else if (std > 2 && zoom_X && zoom_Y) {
        //     zoom_X = false;
        //     zoom_Y = true;
        // }
        
        if (k === 1 && pan_enabled) {
            ((!sourceEvent.shiftKey) || (pan_shift )) && 
                control_pan_X && zoom_X && g_x_axis.call(zoomX.translateBy, x, 0);
                // SVG.disambiguate("zoom");
        } else {
            zoom_X && g_x_axis.call(zoomX.scaleBy, k, [cliX, cliY]);
            // SVG.disambiguate("zoom", true);
        }
        SVG.state().x_axis.ordinal.length ?
            SVG.state().x_axis.axis.applyTransform(tx())() :
            SVG.state().x_axis.axis.scale(tx().rescaleX(SVG.state().x_axis.scale))();

        let discrete = marks.node().nodeName === "path" && marks.node().type === "ellipse" && zoom_Y;
        let not_discrete = marks.node().nodeName === "path" && marks.node().type !== "ellipse" && zoom_Y && !zoom_X;
        let ordinal = SVG.state().x_axis.scale.domain().length > 2 && zoom_Y && !zoom_X;
        let not_path = SVG.state().x_axis.scale.domain().length == 2 && marks.node().nodeName !== "path" && zoom_Y;

        if (k === 1 && pan_enabled) {
            ((!sourceEvent.shiftKey) || (pan_shift )) && 
                control_pan_Y && (not_path || discrete || not_discrete || ordinal) && g_y_axis.call(zoomY.translateBy, 0, y);
        } else {
            (not_path || discrete || not_discrete || ordinal) && g_y_axis.call(zoomY.scaleBy, k, [cliX, cliY]);   
        }
        SVG.state().y_axis.axis.scale(ty().rescaleY(SVG.state().y_axis.scale))();

        var keys = (sourceEvent.ctrlKey ? " ctrl " : "") + (sourceEvent.shiftKey ? " shift " : "") + (sourceEvent.altKey ? " alt " : "");
        if (sourceEvent.type === 'mousemove' && control_pan_X) {
            document.getElementById("logfile").innerHTML += sourceEvent.type + " [" + keys + "] " + SVG.state().svg.id + " to pan [" +
            (zoom_X && zoom_Y ? "2D" : (zoom_X ? "X-AXIS" : "Y-AXIS")) + "] <br/>";
        } else if (sourceEvent.type !== 'mousemove' && control_zoom_X) {
            document.getElementById("logfile").innerHTML += sourceEvent.type + " [" + keys + "] " + SVG.state().svg.id + " to zoom [" +
            (zoom_X && zoom_Y ? "2D" : (zoom_X ? "X-AXIS" : "Y-AXIS")) + "] <br/>";
        }
        
        marks.attr("transform", function() {
            let transform = this.__transform.match(/(-?\d+\.?-?\d*)/g);
            
            let t_x = (this.getBoundingClientRect().left - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left +
                this.getBoundingClientRect().right - this._global_transform[0] - SVG.state().svg.getBoundingClientRect().left) / 2;
            let t_y = (this.getBoundingClientRect().top - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top + 
                this.getBoundingClientRect().bottom - this._global_transform[1] - SVG.state().svg.getBoundingClientRect().top) / 2;

            if (!this._t) this._t = [t_x, t_y];
            let x_offset = +transform[0] === 0 ? 0 : +transform[0] - +this._t[0];
            let y_offset = +transform[1] === 0 ? 0 : +transform[1] - +this._t[1];

            let new_x = tx().applyX(+this._t[0]) + x_offset;
            let new_y = ty().applyY(+this._t[1]) + y_offset;

            let is_ellipse = this.nodeName === "path" && this.type !== "ellipse";
            let is_ordinal = SVG.state().x_axis.scale.domain().length > 2;
            if (is_ellipse || is_ordinal) {
                return 'translate(' + tx().x + ',' + ty().y + ') scale(' + tx().k + ',' + ty().k + ')';
            }

            return 'translate(' + (this.hasAttribute("cx") ? new_x - this.getAttribute("cx") : new_x) + ',' + (this.hasAttribute("cy") ? new_y - this.getAttribute("cy") : new_y) + ')';
        });

        marks.attr('vector-effect', 'non-scaling-stroke');

        svg.selectAll(".hover").attr("display", "none");
        let tooltips = document.querySelectorAll(".tooltip");
        if (tooltips.length) tooltips.forEach(d => d.style['visibility'] = 'hidden');

        SVG.updateBrush();
        z = transform;
    };

    // control.addEventListener('change', function() {
    //     if (this.checked) {
    svg.call(zoom().on("zoom", zoom_callback)); //.on("mousedown.zoom", null).on("dblclick.zoom", null);
        // } else {
            // svg.call(d3.zoom().on("zoom", null));
        // }
    // });

    // axis_control.addEventListener('change', function(event) {
    //     console.log(event.id);
    // });
}

function dragElement$1(elmnt, SVG, constrains) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        elmnt.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        if (!constrains[1]) elmnt.setAttribute("y", elmnt.getAttribute("y") - pos2);
        if (!constrains[0]) elmnt.setAttribute("x", elmnt.getAttribute("x") - pos1);

        SVG.filter(
            +elmnt.getAttribute("x") + +SVG.state().svg.getBoundingClientRect().left,
            +elmnt.getAttribute("y") + +SVG.state().svg.getBoundingClientRect().top,
            elmnt.getAttribute("width"),
            elmnt.getAttribute("height")
        );
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        elmnt.onmouseup = null;
        elmnt.onmousemove = null;
    }
}    

function brush(SVG, control, axis_control) {
    // if (SVG.state().svg_marks[0].nodeName === "path") {
    //     return;
    // }

    let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("fill", "gray");
    rect.setAttribute("opacity", 0.35);
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", 0);
    rect.setAttribute("height", 0);
    rect.setAttribute("id", "brush-rect");
    // rect.style['cursor'] = 'move';
    // rect.style['strokeWidth'] = '2px';
    rect.style['stroke'] = '#fff';

    let svg = SVG.state().svg;
    svg.appendChild(rect);

    let mousedown = false,
        constrains = [false, false];

    function update_rect() {
        if (+rect.getAttribute("width") === 0 || +rect.getAttribute("height") === 0) return;
        if (constrains[0]) {
            rect.setAttribute("x", SVG.state().x_axis.global_range[0]);
            rect.setAttribute("width", SVG.state().x_axis.global_range[1] - SVG.state().x_axis.global_range[0]);
        } else if (constrains[1]) {
            rect.setAttribute("y", SVG.state().y_axis.global_range[1]);
            rect.setAttribute("height", SVG.state().y_axis.global_range[0] - SVG.state().y_axis.global_range[1]);
        }

        SVG.filter(
            +rect.getAttribute("x") + +svg.getBoundingClientRect().left,
            +rect.getAttribute("y") + +svg.getBoundingClientRect().top,
            rect.getAttribute("width"),
            rect.getAttribute("height")
        );
    }
    
    function mousedown_callback(e) {
        if (!SVG.state().interactions.brush.flag) return;
        let intersects = false;
            for (const mark of SVG.state().svg_marks) {
                if (mark.type === "line" || mark.type === "polygon") continue;
                let bb = mark.getBoundingClientRect();
                if (e.clientX >= +bb.left && e.clientX <= +bb.right && e.clientY >= +bb.top && e.clientY <= +bb.bottom) {
                    intersects = true;
                    break;
                }
            }

        if (intersects) return;

        SVG.disambiguate("brush");
        // document.getElementById('pan_disam').style['display'] = 'block';

        if (e.clientX - svg.getBoundingClientRect().left >= +rect.getAttribute("x") && 
            e.clientX - svg.getBoundingClientRect().left <= +rect.getAttribute("x") + +rect.getAttribute("width") &&
            e.clientY - svg.getBoundingClientRect().top >= +rect.getAttribute("y") &&
            e.clientY - svg.getBoundingClientRect().top <= +rect.getAttribute("y") + +rect.getAttribute("height")) {
            return;
        }

        SVG.state().interactions.brush.active = true;

        var left_bound = SVG.state().svg_marks[0]._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
        var top_bound = SVG.state().svg_marks[0]._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;

        let x_flag = e.clientX - left_bound > SVG.state().x_axis.range[0], 
            y_flag = e.clientY - top_bound < SVG.state().y_axis.range[0];

        let brush_Y = !x_flag && y_flag;
        let brush_X = (x_flag && !y_flag) || 
            ((SVG.state().svg_marks[0].type === "line" || SVG.state().svg_marks[0].type === "polygon") && !brush_Y && 
            SVG.state().x_axis.ticks.length);

        // let std = SVG.std();
        // if (std < 0.5 && !brush_X && !brush_Y) {
        //     brush_X = false;
        //     brush_Y = true;
        // } else if (std > 2 && !brush_X && !brush_Y) {
        //     brush_X = true;
        //     brush_Y = false;
        // }

        constrains[0] || brush_Y ? 
            rect.setAttribute("width", SVG.state().x_axis.global_range[1] - SVG.state().x_axis.global_range[0]) : 
            rect.setAttribute("width", 0);
        constrains[1] || brush_X ? 
            rect.setAttribute("height", SVG.state().y_axis.global_range[0] - SVG.state().y_axis.global_range[1]) :
            rect.setAttribute("height", 0);

        e.preventDefault();
        mousedown = true;
        constrains[0] || brush_Y ? 
            rect.setAttribute("x", SVG.state().x_axis.global_range[0]) :
            rect.setAttribute("x", e.clientX - svg.getBoundingClientRect().left);
        constrains[1] || brush_X ? 
            rect.setAttribute("y", SVG.state().y_axis.global_range[1]) :
            rect.setAttribute("y", e.clientY - svg.getBoundingClientRect().top);

        var keys = (e.ctrlKey ? " ctrl " : "") + (e.shiftKey ? " shift " : "") + (e.altKey ? " alt " : "");
        document.getElementById("logfile").innerHTML += e.type + " [" + keys + "] " + SVG.state().svg.id + " to brush [" +
            (!brush_X && !brush_Y ? "2D" : (brush_X ? "X-AXIS" : "Y-AXIS")) + "] <br/>";
    }

    function mousemove_callback(e) {
        // var brush_shift = document.getElementById("brush-shift").className.split(" ").indexOf("bg-primary") > -1 &&
        //     document.getElementById("brush-drag").className.split(" ").indexOf("bg-primary") <= -1;
        // var brush_shift = false;
        // if ((brush_shift && !e.shiftKey) || (!brush_shift && e.shiftKey)) return;
        var left_bound = SVG.state().svg_marks[0]._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
        var top_bound = SVG.state().svg_marks[0]._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;

        let x_flag = e.clientX - left_bound > SVG.state().x_axis.range[0], 
            y_flag = e.clientY - top_bound < SVG.state().y_axis.range[0];
        let brush_Y = !x_flag && y_flag;
        let brush_X = (x_flag && !y_flag) ||
            ((SVG.state().svg_marks[0].type === "line" || SVG.state().svg_marks[0].type === "polygon") && !brush_Y &&
            SVG.state().x_axis.ticks.length);

        if (mousedown) {
            e.preventDefault();
            let width = e.clientX - rect.getAttribute("x") - svg.getBoundingClientRect().left;
            let height = e.clientY - rect.getAttribute("y") - svg.getBoundingClientRect().top;
            constrains[0] || brush_Y ? 
                rect.setAttribute("width", SVG.state().x_axis.global_range[1] - SVG.state().x_axis.global_range[0]) :
                rect.setAttribute("width", width < 0 ? 0 : width);
            constrains[1] || brush_X ?
                rect.setAttribute("height", SVG.state().y_axis.global_range[0] - SVG.state().y_axis.global_range[1]) :
                rect.setAttribute("height", height < 0 ? 0 : height);
            // if (SVG.state().svg_marks[0].type !== "line" && SVG.state().svg_marks[0].type !== "polygon") {
                SVG.filter(
                    +rect.getAttribute("x") + +svg.getBoundingClientRect().left,
                    +rect.getAttribute("y") + +svg.getBoundingClientRect().top,
                    rect.getAttribute("width"),
                    rect.getAttribute("height")
                );
            // }
        }
    }
    function mouseup_callback(e) {
        if (!SVG.state().interactions.brush.active) return;
        SVG.state().interactions.brush.active = false;
        mousedown = false;
        if (+rect.getAttribute("width") === 0 || +rect.getAttribute("height") === 0) { 
            SVG.unfilter();
            // document.getElementById('pan_disam').style['display'] = 'none';
            // SVG.disambiguate("brush", true);
            d3.selectAll(".brush_tooltip").remove();
            document.getElementById("logfile").innerHTML += "reset brush <br/>";
        } else {
            rect.setAttribute("width", 0);
            rect.setAttribute("height", 0);
        }
    }
    svg.addEventListener("mousedown", mousedown_callback);
    svg.addEventListener("mousemove", mousemove_callback);
    svg.addEventListener("mouseup", mouseup_callback);

    control.addEventListener('change', function() {
        if (!this.checked) { 
            SVG.unfilter();
            rect.setAttribute("width", 0);
            rect.setAttribute("height", 0);
        }

        this.checked ? svg.addEventListener("mousedown", mousedown_callback) : svg.removeEventListener("mousedown", mousedown_callback);
        this.checked ? svg.addEventListener("mousemove", mousemove_callback) : svg.removeEventListener("mousemove", mousemove_callback);
        this.checked ? svg.addEventListener("mouseup", mouseup_callback) : svg.removeEventListener("mouseup", mouseup_callback);
    });

    document.querySelectorAll('ul.brush a.axis').forEach(d => d.addEventListener('click', function(event) {
        switch(event.target.innerHTML) {
            case "2D":
                constrains[0] = constrains[1] = false;
                break;
            case "X axis":
                constrains[0] = false;
                constrains[1] = true;
                break;
            case "Y axis":
                constrains[0] = true;
                constrains[1] = false;
                break;
        }
        update_rect();
    }));

    dragElement$1(rect, SVG, constrains);
}

// import { svg_objects } from "./inspect";

function filter(SVG, control) {
    return;
}

function constrain_elements(SVG) {
    SVG.state().x_axis.ticks.sort((a, b) => {
        return +a['label'].getBoundingClientRect().left < +b['label'].getBoundingClientRect().left ? -1 : 1;
    });

    let labels = SVG.state().x_axis.ticks.map(d => d['label'].innerHTML);
    SVG.state().x_axis.ordinal = labels;
    SVG.state().x_axis.scale.domain(labels);
}

function dragElement(SVG) {
    var pos3 = 0, pos4 = 0;
    document.addEventListener('mousedown', dragMouseDown);
    var elmnt, tick, original_positions;

    function dragMouseDown(e) {
        if (SVG.state().svg.parentElement.style['visibility'] === 'hidden') return;
        
        e = e || window.event;
        // e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        // elmnt.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        // elmnt.onmousemove = elementDrag;
        elmnt = null;
        tick = SVG.state().x_axis.ticks[0];
        original_positions = [];
        for (const mark of SVG.state().svg_marks) {
            if (mark.hasAttribute("__legend__")) continue;
            let bb = mark.getBoundingClientRect();
            if (e.clientX >= +bb.left && e.clientX <= +bb.right && e.clientY >= +bb.top && e.clientY <= +bb.bottom) {
                elmnt = mark;
                break;
            }
        }
        if (elmnt) {
            var keys = (e.ctrlKey ? " ctrl " : "") + (e.shiftKey ? " shift " : "") + (e.altKey ? " alt " : "");
            document.getElementById("logfile").innerHTML += e.type + " [" + keys + "] " + SVG.state().svg.id + " to sort <br/>";

            document.addEventListener('mousemove', elementDrag);
            document.addEventListener('mouseup', closeDragElement);
            elmnt.__x__ = e.clientX;

            SVG.state().svg_marks.sort((a, b) => {
                +a.getBoundingClientRect().left < +b.getBoundingClientRect().left ? -1 : 1;
            });

            let pos = (+elmnt.getBoundingClientRect().left + +elmnt.getBoundingClientRect().right) / 2;
            let min_diff = 1000;
            for (let i = 0; i < SVG.state().x_axis.ticks.length; ++i) {
                if (Math.abs(+SVG.state().x_axis.ticks[i]['ticks'][0].getBoundingClientRect().left - pos) < min_diff) {
                    min_diff = Math.abs(+SVG.state().x_axis.ticks[i]['ticks'][0].getBoundingClientRect().left - pos);
                    tick = SVG.state().x_axis.ticks[i];
                }

                let p = SVG.state().x_axis.ticks[i]['ticks'][0];
                original_positions.push((+p.getBoundingClientRect().left + +p.getBoundingClientRect().right) / 2);

                SVG.state().x_axis.ticks[i]['mark'] = SVG.state().svg_marks[i];
            }

            tick['__x__'] = e.clientX;
        }
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos3 - e.clientX;
        pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.setAttribute("transform", "translate(" + (e.clientX - elmnt.__x__) + ", 0)");

        let label = tick['label'];
        let rotate = label.hasAttribute("transform") && label.getAttribute("transform").includes("rotate") ? +label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
        label.setAttribute("transform", "translate(" + (e.clientX - elmnt.__x__) + ", 0)" + (rotate ? " rotate(" + rotate + ")" : ""));

        for (const t of tick['ticks']) {
            t.setAttribute("transform", "translate(" + (e.clientX - elmnt.__x__) + ", 0)");
        }

        constrain_elements(SVG);
    
        for (let i = 0; i < SVG.state().x_axis.ticks.length; ++i) {
            if (SVG.state().x_axis.ticks[i]['label'].innerHTML === tick['label'].innerHTML) continue;

            let t = SVG.state().x_axis.ticks[i];
            let curr_pos = (+t['ticks'][0].getBoundingClientRect().left + 
                +t['ticks'][0].getBoundingClientRect().right ) / 2;

            let l = t['label'];
            let rotate = label.hasAttribute("transform") && l.getAttribute("transform").includes("rotate") ? +l.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
            l.setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)" + (rotate ? " rotate(" + rotate + ")" : ""));

            for (const tick of SVG.state().x_axis.ticks[i]['ticks']) {
                tick.setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)");
            }

            t['mark'].setAttribute("transform", "translate(" + (original_positions[i] - curr_pos) + ", 0)");
        }
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        // elmnt.onmouseup = null;
        // elmnt.onmousemove = null;
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        // constrain_elements(SVG);
    }
}    

function sort(SVG) {
    if (!SVG.state().x_axis.ordinal.length) return;
    dragElement(SVG);
}

function getFormattedDate(date) {
    var year = date.getFullYear();
  
    var month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
  
    var day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    
    return month + '/' + day + '/' + year;
  }  

function mouseleave() {
    let tooltip = document.querySelector("#tooltip");
    tooltip.style['visibility'] = 'hidden';
}

function create_tooltip(id, c=null) {
    if (document.querySelector("#" + id)) return;

    const div = document.createElement("div");
    div.id = id;
    div.setAttribute("class", c ? c : "tooltip");
    div.style = "opacity:1; visibility:visible; position:absolute; background-color:white; z-index:999; " +
        "border:solid; border-width:1px; border-radius:2px; padding:2px; font-size:14px; font-weight:500; pointer-events:none;";
    document.body.insertBefore(div, null);
}

function line(SVG, event, mark, i, id=null, c=null) {
    if (!id && d3.selectAll(".brush_tooltip").nodes().length) return;

    let transform = mark.getAttribute('transform');
    let x_scale = 1, x_translate = 0;
    if (transform) {
        let t = transform.match(/(-?\d+\.?\d*)/g);
        x_translate = +t[0];
        x_scale = +t[2];
    }

    let offset = SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0] 
        +SVG.state().svg.getBoundingClientRect().left,
        path_x = event.clientX - offset,
        start = SVG.state().x_axis.range[0], 
        end = mark.getTotalLength(),
        target, 
        pos;

    create_tooltip("tooltip" + (id ? id : ""), c);
    let tooltip = document.querySelector("#tooltip" + (id ? id : ""));
    // tooltip.style['visibility'] = 'visible';
    if (path_x < SVG.state().x_axis.range[0] || SVG.state().x_axis.range[1] < path_x) {
        d3.selectAll(".hover").attr("visibility", "hidden");
        if (tooltip) tooltip.style["visibility"] = "hidden";
    } else {
        d3.selectAll(".hover").attr("visibility", "visible");
        if (tooltip) tooltip.style["visibility"] = "visible";
    }
 
    path_x = (path_x - x_translate) / x_scale;
    while (true){
        target = Math.floor((start + end) / 2);
        pos = mark.getPointAtLength(target);
        if ((target === end || target === start) && pos.x !== path_x) {
            break;
        }

        if (pos.x > path_x) {
            end = target;
        } else if (pos.x < path_x) {
            start = target;
        } else {
            break; //position found
        }
    }

    let y = pos.y + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1];
    let y_domain = SVG.state().y_axis.scale.invert(
        y - SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]
    );
    let data_x = SVG.state().x_axis.scale.invert(path_x);
    data_x = typeof data_x === "number" ? Math.round(data_x) : getFormattedDate(data_x);

    // tooltip.innerHTML = (SVG.state().titles.x ? SVG.state().titles.x + ":" : "") + data_x + "<hr style='margin:0px;border:0.5px solid black;opacity:1;'>" + 
    //     (SVG.state().titles.y ? SVG.state().titles.y + ":" : "") + Math.round(y_domain);
    let color = mark.type === "line" ? window.getComputedStyle(mark)['stroke'] : window.getComputedStyle(mark)['fill'];
    if (i === 1) {
        tooltip.innerHTML = SVG.state().svg_marks.length === 1 ? Math.round(y_domain) :
            "<div><span class='dot' style='background-color:" + color + ";'></span>" +
            "<div style='display:inline;margin-right:20px;'> " + (mark.__data__.key ? mark.__data__.key : "") + "</div> " +
            "<div style='display:inline;float:right;'>" + Math.round(y_domain) + "</div></div>";
    } else {
        tooltip.innerHTML = SVG.state().svg_marks.length === 1 ? Math.round(y_domain) :
            "<div><span class='dot' style='background-color:" + color + ";'></span>" +
            "<div style='display:inline;margin-right:20px;'> " + (mark.__data__.key ? mark.__data__.key : "") + "</div> " +
            "<div style='display:inline;float:right;'>" + Math.round(y_domain) + "</div></div>" +
            tooltip.innerHTML;
    }
    
    d3.selectAll(".dot")
        .style("height", "10px")
        .style("width", "10px")
        // .style("background-color", "#bbb")
        .style("border-radius", "50%")
        .style("display", "inline-block");
    
    tooltip.style['color'] = mark.type === "line" ? window.getComputedStyle(mark)['stroke'] : "black";
    tooltip.style['left'] = event.pageX + 7.5;
    tooltip.style['top'] = /*SVG.state().svg.getBoundingClientRect().top + 10;*/
    event.pageY - event.clientY + y + 
        SVG.state().svg.getBoundingClientRect().top - 15;

    let circle = SVG.state().svg.querySelector("#_circle" + (id ? id : "") + i);
    if (circle) {
        circle.setAttribute("cx", (path_x * x_scale + x_translate) 
            + SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
        circle.setAttribute("cy", y);
        circle.setAttribute("display", "");
    } else {
        circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", 6);
        circle.setAttribute("fill", mark.type === "line" ? window.getComputedStyle(mark)['stroke'] : 
            window.getComputedStyle(mark)['fill']);
        circle.setAttribute("opacity", 0.75);
        circle.setAttribute("stroke", "black");
        // circle.setAttribute("stroke", window.getComputedStyle(mark)['fill']);
        circle.setAttribute("stroke-width", '1px');
        circle.id = "_circle" + (id ? id : "") + i;
        circle.setAttribute("class", c ? c : "hover");
        SVG.state().svg.append(circle);
        circle.setAttribute("cx", (path_x * x_scale + x_translate) 
            + SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
        circle.setAttribute("cy", y);
    }
    
    let line = SVG.state().svg.querySelector("#_hoverline" + (id ? id : ""));
    if (line) { 
        line.setAttribute("x1", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.setAttribute("x2", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.setAttribute("display", "");
        // line.setAttribute("visibility", "hidden");
    } else {
        line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", 1.5);
        line.setAttribute("opacity", "0.5");
        line.style['pointer-events'] = 'none';
        // line.setAttribute("visibility", "hidden");
        line.setAttribute("class", c ? c : "hover");
        line.setAttribute("y1", 
            SVG.state().y_axis.range[0] + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);
        line.setAttribute("y2", 
            SVG.state().y_axis.range[1] + SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);
        line.setAttribute("x1", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.setAttribute("x2", event.clientX - SVG.state().svg.getBoundingClientRect().left);
        line.id = "_hoverline" + (id ? id : "");
        SVG.state().svg.append(line);
    }
}


function create_hover(SVG, control) {
    function highlight(event) {
        SVG.state().interactions.selection.active = true;

        if (event.target.hasAttribute("__legend__")) {
            let color = window.getComputedStyle(event.target).fill;
            for (const mark of SVG.state().svg_marks) {
                if (window.getComputedStyle(mark).fill != color) {
                    mark.setAttribute("opacity", 0.25);
                } else {
                    mark.setAttribute("opacity", 1);
                }
            }
            var keys = (event.ctrlKey ? " ctrl " : "") + (event.shiftKey ? " shift " : "") + (event.altKey ? " alt " : "");
            document.getElementById("logfile").innerHTML += event.type + " [" + keys + "] " + SVG.state().svg.id + " to filter by legend <br/>";
            return;
        } 
        document.getElementById("filter_mode").style['opacity'] = 1;
        document.getElementById("filter_mode").style['display'] = 'block';

        let ctrl = event.ctrlKey, cmd = event.metaKey, alt = event.altKey, shift = event.shiftKey;
        let has_selected = false;

        if (ctrl || cmd || alt || shift) {
            event.target.setAttribute("opacity", +event.target.getAttribute("opacity") === 1 ? 0.25 : 1);
        } else {
            event.target.setAttribute("opacity", 1);
        }

        for (const mark of SVG.state().svg_marks) {
            if (mark === event.target) continue;
            if (mark.hasAttribute("opacity") && +mark.getAttribute("opacity") === 1) {
                has_selected = true;
                break;
            }
        }

        if (!has_selected) {
            for (const mark of SVG.state().svg_marks) {
                mark.setAttribute("opacity", !mark.hasAttribute("opacity") ? 0.25 : (+mark.getAttribute("opacity") === 1 ? 0.25 : 1));
            }
        } 

        var keys = (event.ctrlKey ? " ctrl " : "") + (event.shiftKey ? " shift " : "") + (event.altKey ? " alt " : "");
        document.getElementById("logfile").innerHTML += event.type + " [" + keys + "] " + SVG.state().svg.id + " to select mark <br/>";
    }

    function show_data(event) {
        create_tooltip("tooltip");
        let tooltip = document.querySelector("#tooltip");
        let data = "";
        let mark = event.target;

        if (!mark.__inferred__data__) return;
        
        for (const [key, value] of Object.entries(mark.__inferred__data__)) {
            data += String(key) + ": " + String(value);
            data += "<br/>";
        }
    
        tooltip.innerHTML = data;
        tooltip.style['visibility'] = 'visible';
        tooltip.style['left'] = event.pageX + 7;
        tooltip.style['top'] = event.pageY;
    }

    function showline(event) {
        const marks = SVG.state().svg_marks;
        var i = 0;
        for (const mark of marks) {
            // if (mark.style['opacity'] && +mark.style['opacity'] !== 1) return;
            ++i;
            line(SVG, event, mark, i);
        }
        if (marks.length > 1) {
            let tooltip = document.getElementById("tooltip");
            [...tooltip.children]
                .sort((a,b) => +a.children[2].innerHTML < +b.children[2].innerText ? 1 : -1)
                .forEach(node => tooltip.appendChild(node));
            for (let i = 0; i < tooltip.children.length - 1; ++i) {
                tooltip.children[i].children[2].innerHTML = +tooltip.children[i].children[2].innerHTML - 
                    +tooltip.children[i + 1].children[2].innerHTML;
            }
        }
    }

    for (const mark of SVG.state().svg_marks) {
        if (!mark.type || mark.type === "ellipse" || (!SVG.state().x_axis.ticks.length && !SVG.state().y_axis.ticks.length)) {
            mark.addEventListener('mouseenter', show_data);
            mark.addEventListener('mouseleave', mouseleave);
            mark.style['cursor'] = 'pointer';
        } else {
            SVG.state().svg.addEventListener('mousemove', showline);
        }
        mark.addEventListener('click', highlight);
        // mark.addEventListener('mousedown', mousedown);
    }

    control.addEventListener("change", function() {
        if (!this.checked) {
            d3.select("#" + SVG.state().svg.id).selectAll(".hover").attr("display", "none");
            let tooltips = document.querySelectorAll(".tooltip");
            if (tooltips.length) tooltips.forEach(d => d.style['visibility'] = 'hidden');
        } 

        for (const mark of SVG.state().svg_marks) {
            if (!mark.type || mark.type === "ellipse" || (!SVG.state().x_axis.ticks.length && !SVG.state().y_axis.ticks.length)) {
                this.checked ? mark.addEventListener('mouseenter', show_data) : mark.removeEventListener('mouseenter', show_data);
                this.checked ? mark.addEventListener('mouseleave', mouseleave) : mark.removeEventListener('mouseleave', mouseleave);
            } else {
                this.checked ? SVG.state().svg.addEventListener('mousemove', showline) : SVG.state().svg.removeEventListener('mousemove', showline);
            }
            // this.checked ? mark.addEventListener('mousedown', mousedown) : mark.removeEventListener('mousedown', mousedown);
        }
    });
}

function select(SVG, control) {
    create_hover(SVG, control);
    // add_click(svg_objects);
}

select.applyBrush = function(SVG, x, y, width, height) {
    d3.selectAll(".brush_tooltip").remove();

    let event1 = { clientX: x, pageX: x, clientY: y, pageY: y };
    let event2 = { clientX: x + +width, pageX: x + +width, clientY: y + +height, pageY: y + +height};
    let i = 0;
    for (const mark of SVG.state().svg_marks) {
        ++i;
        line(SVG, event1, mark, i, "brush1", "brush_tooltip");
        line(SVG, event2, mark, i, "brush2", "brush_tooltip");
    }

    if (SVG.state().svg_marks.length > 1) {
        let tooltips = [document.getElementById("tooltipbrush1"), document.getElementById("tooltipbrush2")];
        for (const tooltip of tooltips) {
            [...tooltip.children]
                .sort((a,b) => +a.children[2].innerHTML < +b.children[2].innerText ? 1 : -1)
                .forEach(node => tooltip.appendChild(node));
            for (let i = 0; i < tooltip.children.length - 1; ++i) {
                tooltip.children[i].children[2].innerHTML = +tooltip.children[i].children[2].innerHTML - 
                    +tooltip.children[i + 1].children[2].innerHTML;
            }
        }
    }
};

select.updateBrush = function(SVG) {
    if (!document.getElementById("_hoverlinebrush1")) return;
    let x1 = document.getElementById("_hoverlinebrush1").getBoundingClientRect().left;
    let y1 = document.getElementById("_hoverlinebrush1").getBoundingClientRect().top;
    let x2 = document.getElementById("_hoverlinebrush2").getBoundingClientRect().left;
    let y2 = document.getElementById("_hoverlinebrush2").getBoundingClientRect().top;

    let event1 = { clientX: x1, pageX: x1, clientY: y1, pageY: y1 };
    let event2 = { clientX: x2, pageX: x2, clientY: y2, pageY: y2 };
    let i = 0;
    for (const mark of SVG.state().svg_marks) {
        ++i;
        line(SVG, event1, mark, i, "brush1", "brush_tooltip");
        line(SVG, event2, mark, i, "brush2", "brush_tooltip");
    }

    if (SVG.state().svg_marks.length > 1) {
        let tooltips = [document.getElementById("tooltipbrush1"), document.getElementById("tooltipbrush2")];
        for (const tooltip of tooltips) {
            [...tooltip.children]
                .sort((a,b) => +a.children[2].innerHTML < +b.children[2].innerText ? 1 : -1)
                .forEach(node => tooltip.appendChild(node));
            for (let i = 0; i < tooltip.children.length - 1; ++i) {
                tooltip.children[i].children[2].innerHTML = +tooltip.children[i].children[2].innerHTML - 
                    +tooltip.children[i + 1].children[2].innerHTML;
            }
        }
    }
};

var top = 1,
    right = 2,
    bottom = 3,
    left = 4;

function translateX(x, _y) {
  return "translate(" + x + "," + _y + ")";
}

function translateY(y, _x) {
  return "translate(" + _x + "," + y + ")";
}

function number(scale) {
  return d => +scale(d);
}

function center(scale, offset) {
  offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
  if (scale.round()) offset = Math.round(offset);
  return d => +scale(d) + offset;
}

function axis(orient, scale, SVG) {
  var tickArguments = [],
      tickValues = null,
      tickFormat = null,
      tickSizeInner = 6,
      tickSizeOuter = 6,
      tickPadding = 3,
      offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
      transform = orient === top || orient === bottom ? translateX : translateY,
      diff = null, 
      range_index = orient === top || orient === bottom ? 0 : 1,
      scale_transform = null,
      svg_axis = orient === top || orient === bottom ? SVG.state().x_axis : SVG.state().y_axis,
      ticks = svg_axis.ticks;

  function axis() {
    var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
        format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$1) : tickFormat,
        position = (scale.bandwidth ? center : number)(scale.copy(), offset);
    values = orient === left || orient === right ? values.reverse() : values;

    function ordinal_transform(element, transform) {
        const global_position =
          element.getBoundingClientRect().right - element.parentElement._global_transform[0] - SVG.state().svg.getBoundingClientRect().left;
        
        if (!element._t) element._t = [global_position, 
          element.hasAttribute("transform") ? +element.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0] : global_position];
        let new_pos = transform.applyX(element._t[0]);

        new_pos < svg_axis.range[0] || new_pos > svg_axis.range[1] ? 
          element.style.display = "none" : element.style.display = "block";

        return (new_pos - element._t[0]) + element._t[1];
    }

    function update_tick(tick, value) {
      let label = tick['label'];
      let tick_marks = tick['ticks'];

      label.innerHTML = svg_axis.ordinal.length || label.innerHTML == format(value) ? label.innerHTML : format(value);

      let offset_label = label.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1] :
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0]) :
        0;

      let text_anchor = label.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0] :
          label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1]) :
        (orient === top || orient === bottom ? 
          label._global_transform[0] :
          label._global_transform[1]);      diff = diff == null ? +text_anchor - position(value) : diff;

      if (scale_transform) {
        var label_t = transform(ordinal_transform(label, scale_transform), +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
      } else {
        var label_t = transform(position(value) + (Math.abs(diff) < 5 ? diff : 0) + svg_axis.global_range[range_index] - label._global_transform[range_index], +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
      }

      let rotate = label.hasAttribute("transform") && label.getAttribute("transform").includes("rotate") ? +label.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g).pop() : null;
      label.setAttribute("transform", label_t + (rotate ? " rotate(" + rotate + ")" : ""));
      
      for (const mark of tick_marks) {
        let offset_mark = mark.hasAttribute("transform") ?
        (orient === top || orient === bottom ? 
          mark.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[1] :
          mark.getAttribute("transform").match(/(-?\d+\.?\d*e?-?\d*)/g)[0]) :
        0;

        if (scale_transform) {
          var mark_t = transform(ordinal_transform(label, scale_transform), +Math.abs(offset_label) > 1e-2 ? +offset_label : 0);
        } else {
          var mark_t = transform(position(value) + svg_axis.global_range[range_index] - label._global_transform[range_index], +Math.abs(offset_mark) > 1e-2 ? +offset_mark : 0);
        }
        mark.setAttribute("transform", mark_t);
      }
    }

    for (var counter = 0; counter < values.length && counter < ticks.length; ++counter) {
      update_tick(ticks[counter], svg_axis.ordinal.length ? svg_axis.ordinal[counter] : values[counter]);
    }

    for ( ; counter < values.length; ++counter) {
      let new_tick = { 
        'label': ticks[0]['label'].cloneNode(), 
        'ticks': ticks[0]['ticks'].map(d => { let e = d.cloneNode(); e._global_transform = d._global_transform; return e; }), 
        'offset': null
      };
      new_tick['label']._global_transform = ticks[0]['label']._global_transform;

      update_tick(new_tick, values[counter]);
      ticks[0]['label'].parentElement.appendChild(new_tick['label']);
      ticks[0]['ticks'].forEach((d, i) => d.parentElement.appendChild(new_tick['ticks'][i]));
      ticks.push(new_tick);
    }

    let l = ticks.length;
    for (let i = 0; counter < l; ++counter) {
      let pos = ticks.length - 1 - i;
      ticks[pos]['label'].remove();
      ticks[pos]['ticks'].forEach(d => d.remove());
      ticks.pop();
    }
  }

  axis.applyTransform = function(_) {
    return arguments.length ? (scale_transform = _, axis) : axis; 
  };

  axis.scale = function(_) {
    return arguments.length ? (scale = _, axis) : scale;
  };

  axis.ticks = function() {
    return tickArguments = Array.from(arguments), axis;
  };

  axis.tickArguments = function(_) {
    return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice();
  };

  axis.tickValues = function(_) {
    return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice();
  };

  axis.tickFormat = function(_) {
    return arguments.length ? (tickFormat = _, axis) : tickFormat;
  };

  axis.tickSize = function(_) {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
  };

  axis.tickSizeInner = function(_) {
    return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
  };

  axis.tickSizeOuter = function(_) {
    return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
  };

  axis.tickPadding = function(_) {
    return arguments.length ? (tickPadding = +_, axis) : tickPadding;
  };

  axis.offset = function(_) {
    return arguments.length ? (offset = +_, axis) : offset;
  };

  return axis;
}

function axisBottom(scale, SVG) {
  return axis(bottom, scale, SVG);
}

function axisLeft(scale, SVG) {
  return axis(left, scale, SVG);
}

function annotate(SVG) {
    bind(SVG);
}

// annotate.unbind = function() {
//     document.removeEventListener('click', listener);
// }

let bind = function(SVG) {
    function listener (event) {
        if (!SVG.state().interactions.annotate.flag) return;

        let x_click = event.clientX - SVG.state().svg.getBoundingClientRect().left,
            y_click = event.clientY - SVG.state().svg.getBoundingClientRect().top;
        
        if (x_click < SVG.state().x_axis.range[0] || y_click < SVG.state().y_axis.range[1]) return;

        let text = prompt('Type here');
        if (!text) return;

        const annotations = [
            {
              note: {
                label: text
                // title: "d3.annotationLabel"
              },
              x: event.clientX - SVG.state().svg.getBoundingClientRect().left,
              y: event.clientY - SVG.state().svg.getBoundingClientRect().top,
              dy: 20,
              dx: 20,
              connector: {
                end: "dot" // 'dot' also available
              }
            }];

        const makeAnnotations = d3.annotation()
            .type(d3.annotationLabel)
            .annotations(annotations);

        d3.select("#" + SVG.state().svg.id)
            .append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
        
        var keys = (event.ctrlKey ? " ctrl " : "") + (event.shiftKey ? " shift " : "") + (event.altKey ? " alt " : "");
        document.getElementById("logfile").innerHTML += event.type + " [" + keys + "] " + SVG.state().svg.id + " to annotate <br/>";
    }  

    document.addEventListener('mouseup', listener);
};

function SVG() {
    var state = {
        has_domain: false,
        svg: null,
        svg_marks: [],
        text_marks: [],
        axis_text_marks: [],
        x_axis: {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            global_range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        },
        y_axis: {
            domain: [null, null],
            ordinal: [],
            range: [null, null],
            global_range: [null, null],
            ticks: [],
            scale: null,
            axis: null
        },
        legend: [],
        titles: {
            x: null,
            y: null
        },
        interactions: {
            selection: {
                control: null,
                active: false
            },
            zoom: {
                control: null,
                axis_control: null
            },
            pan: {
                control: null,
                axis_control: null,
                flag: false
            },
            brush: {
                control: null,
                axis_control: null,
                flag: true,
                active: false
            },
            filter: {
                control: null,
                active: false
            },
            sort: {
                control: null
            },
            annotate: {
                flag: false
            }
        }
    };

    var group_labels = function() {
        for (let i = 0; i < state.axis_text_marks.length; ++i) {
            let x_offset = (+state.axis_text_marks[i].getBoundingClientRect().left + +state.axis_text_marks[i].getBoundingClientRect().right) / 2;
            let y_offset = (+state.axis_text_marks[i].getBoundingClientRect().top + +state.axis_text_marks[i].getBoundingClientRect().bottom) / 2;
            // console.log(state.axis_text_marks[i])
            // console.log([x_offset, y_offset])
            // console.log('')
            let x_min = 0, y_min = 0;
            for (let j = 0; j < state.x_axis.ticks.length; ++j) {
                if (Math.abs(x_offset - state.x_axis.ticks[j]['offset']) < Math.abs(x_offset - state.x_axis.ticks[x_min]['offset'])) {
                    x_min = j;
                }
            }
            
            for (let j = 0; j < state.y_axis.ticks.length; ++j) {
                if (Math.abs(y_offset - state.y_axis.ticks[j]['offset']) < Math.abs(y_offset - state.y_axis.ticks[y_min]['offset'])) {
                    y_min = j;
                }
            }
  
            Math.abs(x_offset - state.x_axis.ticks[x_min]['offset']) < Math.abs(y_offset - state.y_axis.ticks[y_min]['offset']) ? 
            state.x_axis.ticks[x_min]['label'] = state.axis_text_marks[i] :
            state.y_axis.ticks[y_min]['label'] = state.axis_text_marks[i];

            state.axis_text_marks[i].setAttribute("class", "tick");
        }
    };

    var group_axis = function (axis, index) {
        let position_map = { };

        for (let i = 0; i < axis.ticks.length; ++i) {
            let offset = axis.ticks[i].getBoundingClientRect()[index];
            axis.ticks[i].setAttribute("class", (index === "left" ? "x-axis" : "y-axis") + " tick");

            offset in position_map ? 
            position_map[offset]['ticks'].push(axis.ticks[i]) :
            position_map[offset] = { 'label': null, 'ticks': [axis.ticks[i]] };
        }

        axis.ticks = [];
        for (const [key, value] of Object.entries(position_map)) {
            value['offset'] = +key;
            axis.ticks.push(value);
        }

        axis.ticks.sort((first, second) => +first['offset'] < +second['offset'] ? -1 : (+first['offset'] > +second['offset'] ? 1 : 0));
    };

    var group_legend = function() {
        if (state.svg.id === "hexchart") return;
        let title_x, title_y,
            min_x = 10000, max_y = 0;
        for (const text of state.text_marks) {
            if (text.getBoundingClientRect().left < min_x) {
                min_x = text.getBoundingClientRect().left;
                title_y = text;
            }
            if (text.getBoundingClientRect().bottom > max_y) {
                max_y = text.getBoundingClientRect().bottom;
                title_x = text;
            }
        }

        if (title_y && Math.abs(min_x - state.svg.getBoundingClientRect().left) < 50) {
            title_y.__title__ = true;
            state.titles.y = title_y;
        }
        if (title_x && Math.abs(max_y - state.svg.getBoundingClientRect().bottom) < 50) {
            title_x.__title__ = true;
            state.titles.x = title_x;    
        }

        for (const text of state.text_marks) {
            if (text.__title__) continue;

            let text_x = (+text.getBoundingClientRect().left + +text.getBoundingClientRect().right) / 2,
                text_y = (+text.getBoundingClientRect().top + +text.getBoundingClientRect().bottom) / 2;
            let min_pos = 10000, min_mark;
            for (const mark of state.svg_marks) {
                let mark_x = (+mark.getBoundingClientRect().left + +mark.getBoundingClientRect().right / 2) / 2,
                    mark_y = (+mark.getBoundingClientRect().top + +mark.getBoundingClientRect().bottom) / 2;
                
                let diff = Math.abs(mark_x - text_x) + Math.abs(mark_y - text_y);
                if (diff < min_pos) {
                    min_pos = diff;
                    min_mark = mark;
                }
            }

            min_mark.removeAttribute("__mark__");
            text.setAttribute("__legend__", true);
            min_mark.setAttribute("__legend__", "true");
            state.legend.push({'label': text, 'glyph': min_mark});
        }
    };

    var compute_domain = function(axis) {
        // return;
        for (const [_, value] of Object.entries(axis.ticks)) {
            let format_val = value['label'].__data__ || +value['label'].__data__ === 0 ? 
                value['label'].__data__ : 
                isNaN(parseInt(value['label'].innerHTML)) ? 
                value['label'].innerHTML :
                +(value['label'].innerHTML.replace(/,/g, ''));

            if (typeof format_val === "string") {
                axis.ordinal.push(format_val);
            } else {
                axis.domain[0] = axis.domain[0] === null ? format_val : min([axis.domain[0], format_val]);
                axis.domain[1] = axis.domain[1] === null ? format_val : max([axis.domain[1], format_val]);
            }
        }
    };

    var configure_axes = function() {
        if (SVG.state().x_axis.scale && !SVG.state().x_axis.ordinal.length) {
            // Infer original X-axis domain
            let tick_left = SVG.state().x_axis.ticks[0]['ticks'][0];
            let tick_right = SVG.state().x_axis.ticks[SVG.state().x_axis.ticks.length - 1]['ticks'][0];
            
            tick_left = +(tick_left.hasAttribute("transform") ? tick_left.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0] : tick_left._global_transform[0] - SVG.state().x_axis.global_range[0]);
            tick_right = +(tick_right.hasAttribute("transform") ? tick_right.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[0] : tick_right._global_transform[0] - SVG.state().x_axis.global_range[0]);
    
            let new_domain_x = SVG.state().x_axis.range.map(
                SVG.state().x_axis.scale.copy().range([tick_left, tick_right]).invert, SVG.state().x_axis.scale
            );
            
            SVG.state().x_axis.scale.domain(new_domain_x);
        }
    
        // TO-DO: Fix transform bug.
        if (SVG.state().y_axis.scale && !SVG.state().y_axis.ordinal.length) {
            // Infer original Y-axis domain
            let tick_bottom = SVG.state().y_axis.ticks[0]['ticks'][0];
            let tick_top = SVG.state().y_axis.ticks[SVG.state().y_axis.ticks.length - 1]['ticks'][0];
            tick_bottom = +(tick_bottom.hasAttribute("transform") ? tick_bottom.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] : tick_bottom._global_transform[1] - SVG.state().y_axis.global_range[1]);
            tick_top = +(tick_top.hasAttribute("transform") ? tick_top.getAttribute("transform").match(/(-?\d+\.?-?\d*)/g)[1] : tick_top._global_transform[1] - SVG.state().y_axis.global_range[1]);
    
            let new_domain_y = SVG.state().y_axis.range.map(
                SVG.state().y_axis.scale.copy().range([tick_top, tick_bottom]).invert, SVG.state().y_axis.scale
            );
     
            SVG.state().y_axis.scale.domain(new_domain_y);
        }
    };

    function SVG() { }

    SVG.hydrate = function() {
        // document.getElementById("pan-btn").addEventListener('click', function(event) {
        //     SVG.unfilter();
        //     document.getElementById("brush-rect").setAttribute("width", 0);
        //     document.getElementById("brush-rect").setAttribute("height", 0);
        //     document.getElementById("pan_disam").style['display'] = 'none';
        //     state.svg.style['cursor'] = 'default';
        //     state.interactions.pan.flag = true;
        //     state.interactions.brush.flag = false;
        // });

        // document.getElementById("brush-btn").addEventListener('click', function(event) {
        //     document.getElementById("brush_disam").style['display'] = 'none';
        //     state.svg.style['cursor'] = 'crosshair';
        //     state.interactions.pan.flag = false;
        //     state.interactions.brush.flag = true;
        // });

        for (const [key, value] of Object.entries(state.interactions)) {
            switch(key) {
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.SELECTION:
                    select(SVG, value.control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.ZOOM:
                    _zoom(SVG, value.control, value.axis_control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.PAN:
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.BRUSH:
                    state.svg.style['cursor'] = 'crosshair';
                    brush(SVG, value.control, value.axis_control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.FILTER:
                    filter(SVG, value.control);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.SORT:
                    sort(SVG);
                    break;
                case INTERACTION_CONSTANTS.INTERACTION_TYPES.ANNOTATE:
                    annotate(SVG);
                    break;
            }
        }
        // if (state.svg.id !== "chart") return;
        // let field = document.getElementById("field");
        // let __data__ = state.svg_marks[0].__inferred__data__;
        // for (const [key, value] of Object.entries(__data__)) {
        //     let option = document.createElement('option');
        //     option.innerHTML = key;
        //     field.appendChild(option);
        // }

        // for (const attribute of state.svg_marks[0].attributes) {
        //     if (attribute.nodeName === "__mark__" || attribute.nodeName === "style") continue;
        //     let option = document.createElement('option');
        //     option.innerHTML = attribute.nodeName;
        //     field.appendChild(option);
        // }

        // let condition = document.getElementById("condition");
        // let conditions = ['<', '<=', '=', '>=', '>'];
        // for (const c of conditions) {
        //     let new_c = document.createElement('option');
        //     new_c.innerHTML = c;
        //     condition.appendChild(new_c);
        // }

        // Tooltip
        let mousedown = false;
        state.svg.addEventListener('mousedown', function(event) {
            mousedown = true;
        });
        state.svg.addEventListener('mouseup', function(event) {
            mousedown = false;
        });
        state.svg.addEventListener('mousemove', function(event) {
            if (!mousedown) document.getElementById("modebar").style['visibility'] = 'visible';

            if (state.interactions.pan.flag) {
                let left_bound = state.svg_marks[0]._global_transform[0] + SVG.state().svg.getBoundingClientRect().left;
                let top_bound = state.svg_marks[0]._global_transform[1] + SVG.state().svg.getBoundingClientRect().top;
    
                let x_axis = event.clientX - left_bound > state.x_axis.range[0], 
                    y_axis = event.clientY - top_bound < state.y_axis.range[0];

                state.svg.style['cursor'] = x_axis && !y_axis ? 'ew-resize' :
                    !x_axis && y_axis ? 'ns-resize' : 'move';
            }
        });
        state.svg.addEventListener('mouseleave', function(event) {
            if (event.clientX <= +state.svg.getBoundingClientRect().left || event.clientX >= +state.svg.getBoundingClientRect().right) {
                document.getElementById("modebar").style['visibility'] = 'hidden';
            }
        });

        let pan_elem = document.getElementById("pan_mode");
        let brush_elem = document.getElementById("brush_mode");
        let filter_elem = document.getElementById("filter_mode");
        let annotate_elem = document.getElementById("annotate_mode");

        pan_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            pan_elem.style['opacity'] = +pan_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            brush_elem.style['opacity'] = 0.4;
            annotate_elem.style['opacity'] = 0.4;

            state.interactions.pan.flag = !state.interactions.pan.flag;
            state.interactions.brush.flag = false;
            state.interactions.annotate.flag = false;
            state.svg.style['cursor'] = 'move';

            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (+pan_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " pan <br/>";
        });
        brush_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            brush_elem.style['opacity'] = +brush_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            pan_elem.style['opacity'] = 0.4;
            annotate_elem.style['opacity'] = 0.4;

            state.interactions.annotate.flag = false;
            state.interactions.pan.flag = false;
            state.interactions.brush.flag = !state.interactions.brush.flag;
            state.svg.style['cursor'] = 'crosshair';

            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (+brush_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " brush <br/>";
        });
        filter_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            state.interactions.filter.active = !state.interactions.filter.active;
            for (const mark of state.svg_marks) {
                mark.style['visibility'] = state.interactions.filter.active ? 
                    +mark.getAttribute("opacity") === 1 ? 'visible' : 'hidden'
                    : 'visible';
            }

            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (state.interactions.filter.active ? "enable" : "disable") + " filter <br/>";
        });
        annotate_elem.addEventListener("click", function(event) {
            if (state.svg.parentNode.style['visibility'] === 'hidden') return;

            annotate_elem.style['opacity'] = +annotate_elem.style['opacity'] === 0.4 ? 1 : 0.4;
            pan_elem.style['opacity'] = 0.4;
            brush_elem.style['opacity'] = 0.4;

            state.interactions.brush.flag = false;
            state.interactions.pan.flag = false;
            state.interactions.annotate.flag = !state.interactions.annotate.flag;
            state.svg.style['cursor'] = 'pointer';

            // +annotate_elem.style['opacity'] === 0.4 ? annotate.unbind() : annotate.bind(SVG);
            document.getElementById("logfile").innerHTML += "Click " + state.svg.id + " " +
                (+annotate_elem.style['opacity'] === 0.4 ? "disable" : "enable") + " annotate <br/>";
        });
    };

    SVG.infer_mark_attributes = function() { 
        for (const mark of state.svg_marks) {
            if (mark.nodeName !== "path" || (!state.x_axis.ticks.length && !state.y_axis.ticks.length) || (mark.nodeName === "path" && mark.type === "ellipse")) {
                if (mark.__data__) {
                    if (typeof mark.__data__ === "string") {
                        var iterable = mark.__data__;
                        break;
                    }
                    let has_datum = "datum" in mark.__data__;
                    let has_properties = "properties" in mark.__data__;
                    let has_data = "data" in mark.__data__;
                
                    var iterable = has_datum ? mark.__data__.datum : 
                        has_properties ? mark.__data__.properties :
                        has_data ? mark.__data__.data : mark.__data__;
                } else {
                    let mark_x = (mark.getBoundingClientRect().left + mark.getBoundingClientRect().right) / 2
                        - SVG.state().x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]
                        - SVG.state().svg.getBoundingClientRect().left;
                    let mark_y = (mark.getBoundingClientRect().top + mark.getBoundingClientRect().bottom) / 2
                        - SVG.state().y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]
                        - SVG.state().svg.getBoundingClientRect().top;

                    var iterable = {
                        [state.titles.x.innerHTML]: state.x_axis.scale.invert(mark_x).toFixed(2),
                        [state.titles.y.innerHTML]: state.y_axis.scale.invert(mark_y).toFixed(2)
                    };
                }
                mark.style['pointer-events'] = 'fill';
                
                mark.__inferred__data__ = iterable;
            }
        }

        return SVG;
    };

    SVG.state = function() { return state; };

    SVG.updateBrush = function() {
        select.updateBrush(SVG);
    };

    SVG.disambiguate = function(interaction, hide=false) {
        return;
    };

    // SVG.std = function() {
    //     if (state.svg_marks[0].nodeName === "path" && state.svg_marks[0].type !== "ellipse") return 1;

    //     let x = [], 
    //         y = [],
    //         x_mu = 0,
    //         x_std = 0,
    //         y_mu = 0,
    //         y_std = 0;
    //     for (const mark of state.svg_marks) {
    //         x_mu += +mark.getBoundingClientRect().left;
    //         y_mu += +mark.getBoundingClientRect().top
    //         x.push(+mark.getBoundingClientRect().left);
    //         y.push(+mark.getBoundingClientRect().top);
    //     }

    //     x_mu /= x.length;
    //     y_mu /= y.length;

    //     for (let i = 0; i < x.length; ++i) {
    //         x_std += (x[i] - x_mu) * (x[i] - x_mu);
    //         y_std += (y[i] - y_mu) * (y[i] - y_mu);
    //     }
    //     x_std = Math.sqrt(x_std / x.length);
    //     y_std = Math.sqrt(y_std / y.length);
        
    //     return x_std / y_std;
    // }

    SVG.filter = function(x, y, width, height) {
        document.getElementById("filter_mode").style['opacity'] = 1;
        document.getElementById("filter_mode").style['display'] = 'block';

        for (const mark of state.svg_marks) {
            if ((mark.type === "line" || mark.type === "polygon") && state.x_axis.ticks.length && state.y_axis.ticks.length) {
                state.interactions.brush.active = true;
                select.applyBrush(SVG, x, y, width, height);
                return;
            }
            
            if (state.x_axis.ordinal.length || (!state.x_axis.ticks.length && !state.y_axis.ticks.length)) {
                var brush_x_start = x;
                var brush_x_end = x + +width;
                var brush_y_end = y + +height;
                var brush_y_start = y;
    
                let bb = mark.getBoundingClientRect();
                var data_x = (+bb.left + +bb.right) / 2;
                var data_y = (+bb.top + +bb.bottom) / 2;
            } else {
                var brush_x_start = state.x_axis.scale.invert(x);
                var brush_x_end = state.x_axis.scale.invert(x + +width);
                var brush_y_end = state.y_axis.scale.invert(y);
                var brush_y_start = state.y_axis.scale.invert(y + +height);
    
                let bb = mark.getBoundingClientRect();
                var data_x = (state.x_axis.scale.invert(+bb.left) + state.x_axis.scale.invert(+bb.right)) / 2;
                var data_y = (state.y_axis.scale.invert(+bb.top) + state.y_axis.scale.invert(+bb.bottom)) / 2;
            }

            if (data_x < brush_x_start || data_x > brush_x_end || data_y < brush_y_start || data_y > brush_y_end) {
                mark.setAttribute("opacity", 0.25);
            } else {
                mark.setAttribute("opacity", 1);
            }
        }
    };

    SVG.unfilter = function() {
        state.interactions.brush.active = false;
        document.getElementById("filter_mode").style['display'] = 'none';
        for (const mark of state.svg_marks) {
            mark.setAttribute("opacity", 1);
        }
    };

    SVG.analyze_axes = function() {
        group_axis(state.x_axis, 'left');
        group_axis(state.y_axis, 'top');
        group_labels();
        group_legend();

        return SVG;
    };

    SVG.infer_view = function() {
        compute_domain(state.x_axis);
        compute_domain(state.y_axis);

        const width = +state.svg.getAttribute("width");
        const height = +state.svg.getAttribute("height");

        if (!state.x_axis.ticks.length && !state.y_axis.ticks.length) {
            state.x_axis.range = state.x_axis.global_range = [0, width];
            state.y_axis.range = state.y_axis.global_range = [height, 0];
            return SVG;
        }
        
        // TO-DO: Domain path 0.5 difference.
        if (state.has_domain) {
            let axes = [].slice.call(state.svg.querySelectorAll(".domain")).map((d) => { return d.getBoundingClientRect() });
            let y_axis = axes[0].width < axes[1].width ? axes[0] : axes[1];
            let x_axis = axes[0].height < axes[1].height ? axes[0] : axes[1];

            var x_min = x_axis.left - state.svg.getBoundingClientRect().left;
            var x_max = x_axis.right - state.svg.getBoundingClientRect().left;
    
            var y_max = y_axis.bottom - state.svg.getBoundingClientRect().top;
            var y_min = y_axis.top - state.svg.getBoundingClientRect().top;
        } else {
            let y_tick = state.y_axis.ticks[0]['ticks'][0].getBoundingClientRect();
            let x_tick = state.x_axis.ticks[0]['ticks'][0].getBoundingClientRect();

            if (y_tick.right < x_tick.left) {
                var x_min = y_tick.right - state.svg.getBoundingClientRect().left;
                var x_max = width;
            } else {
                var x_min = y_tick.left - state.svg.getBoundingClientRect().left;
                var x_max = d3.min([y_tick.width + x_min, width]);
            }

            if (x_tick.top > y_tick.bottom) {
                var y_max = x_tick.top - state.svg.getBoundingClientRect().top;
                var y_min = 0;
            } else {
                var y_max = x_tick.bottom - state.svg.getBoundingClientRect().top;
                var y_min = d3.max([y_max - x_tick.height, 0]);
            }
        }

        //     var x_min = d3.min(state.y_axis.ticks[0]['ticks'].map(d => d.getBoundingClientRect().left - state.svg.getBoundingClientRect().left));
        //     var x_max = d3.min([d3.max(state.y_axis.ticks[0]['ticks'].map(d => d.getBoundingClientRect().width + x_min)), width]);

        //     var y_max = d3.max(state.x_axis.ticks[0]['ticks'].map(d => d.getBoundingClientRect().bottom - state.svg.getBoundingClientRect().top));
        //     var y_min = d3.max([d3.min(state.x_axis.ticks[0]['ticks'].map(d => y_max - d.getBoundingClientRect().height)), 0]);
        // }


        // state.x_axis.range = [x_min, x_max].map(d => d - state.x_axis.ticks[0]['ticks'][0]._global_transform[0]);
        // state.y_axis.range = [y_max, y_min].map(d => d - state.y_axis.ticks[0]['ticks'][0]._global_transform[1]);
        state.x_axis.global_range = [x_min, x_max];
        state.y_axis.global_range = [y_max, y_min];
        state.x_axis.range = [x_min, x_max].map(d => d - state.x_axis.ticks[0]['ticks'][0].parentNode._global_transform[0]);
        state.y_axis.range = [y_max, y_min].map(d => d - state.y_axis.ticks[0]['ticks'][0].parentNode._global_transform[1]);

        let diff_1_y = +state.y_axis.ticks[1]['label'].innerHTML - +state.y_axis.ticks[0]['label'].innerHTML;
        let diff_2_y = +state.y_axis.ticks[2]['label'].innerHTML - +state.y_axis.ticks[1]['label'].innerHTML;
    
        let diff_1_x = +state.x_axis.ticks[1]['label'].innerHTML - +state.x_axis.ticks[0]['label'].innerHTML;
        let diff_2_x = +state.x_axis.ticks[2]['label'].innerHTML - +state.x_axis.ticks[1]['label'].innerHTML;

        let diff_tick_a = state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left - 
            state.x_axis.ticks[0]['ticks'][0].getBoundingClientRect().left;
        let diff_tick_b = state.x_axis.ticks[2]['ticks'][0].getBoundingClientRect().left - 
            state.x_axis.ticks[1]['ticks'][0].getBoundingClientRect().left;

        if (Math.abs(diff_1_x - diff_2_x) > 5e-1 || Math.abs(diff_tick_a - diff_tick_b) > 5e-1) {
            // let tick_diff_1 = state.x_axis.ticks['ticks'][1].getBoundingClientRect().left - 
            //     state.x_axis.ticks['ticks'][0].getBoundingClientRect().left;
            // let tick_diff_2 = state.x_axis.ticks['ticks'][2].getBoundingClientRect().left - 
            //     state.x_axis.ticks['ticks'][1].getBoundingClientRect().left;

            if (Math.abs(diff_tick_a - diff_tick_b) < 5e-1) {
                let format = state.x_axis.ticks['ticks'][0].childNodes[1].innerHTML;
                if (format != state.x_axis.ticks[0].__data__ && typeof format === "string") { 
                    var exponent = format.match(/^(e|\d+)\^(e|\d+)$/);
                    var superscript = format.match(/^(e|d+)([\u2070-\u209F\u00B2\u00B3\u00B9])$/);
                    if (exponent) {
                        var base = exponent[1];
                        base = (base === 'e' ? Math.E : parseInt(base));
                    } else if (superscript) {
                        var base = superscript[1];
                        base = (base === 'e' ? Math.E : parseInt(base));
                    }
                }
            } 
            
            function format(d) {
                function digitToSuperscript(superChar) {
                    let table = "⁰¹²³⁴⁵⁶⁷⁸⁹";
                    return table[superChar];
                }

                let exp = Math.log(d) / Math.log(base);
                return superscript ? 'e' + String(exp).replace(/\d/g, digitToSuperscript) : d + '^' + exp;
            }

            state.x_axis.scale = d3.scaleLog()
                .domain(state.x_axis.domain)
                .range(state.x_axis.range);
            state.x_axis.axis = axisBottom(state.x_axis.scale, SVG)
                // .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
                .ticks(state.x_axis.ticks.filter(d => d['label'].innerHTML).length);
            if (base) {
                state.x_axis.scale = state.x_axis.scale.base(base);
                state.x_axis.axis = state.x_axis.axis.tickFormat(d => exponent || superscript ? format(d) : d);
            }
        } else {
            state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : (state.x_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
                .domain(state.x_axis.ordinal.length ? state.x_axis.ordinal : state.x_axis.domain)
                .range(state.x_axis.range);
            // state.x_axis.scale = (state.x_axis.domain[0] instanceof Date ? d3.scaleTime() : d3.scaleLinear())
            //     .domain(state.x_axis.ordinal.length ? state.x_axis.range : state.x_axis.domain)
            //     .range(state.x_axis.range);
            state.x_axis.axis = axisBottom(state.x_axis.scale, SVG)
                .ticks(state.x_axis.ticks.length);
            // state.x_axis.axis(state.x_axis.ticks);
                // .tickSize(state.x_axis.ticks[1].children[0].getAttribute("y2"))
                // .ticks(typeof x_axis.ticks[0].__data__ === "string" ? state.x_axis.ordinal.length : state.x_axis.ticks.length);
        }

        if (Math.abs(diff_1_y - diff_2_y) > 5e-1) {
            state.y_axis.scale = d3.scaleLog()
                .domain(state.y_axis.domain)
                .range(state.y_axis.range);
            state.y_axis.axis = d3.axisLeft(state.y_axis.scale)
                .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
                .ticks(state.y_axis.ticks.length);
        } else {
            state.y_axis.scale = (state.y_axis.domain[0] instanceof Date ? d3.scaleTime() : (state.y_axis.ordinal.length ? d3.scaleBand() : d3.scaleLinear()))
                .domain(state.y_axis.ordinal.length ? state.y_axis.ordinal : state.y_axis.domain)
                .range(state.y_axis.range);
            state.y_axis.axis = axisLeft(state.y_axis.scale, SVG)
                .ticks(state.y_axis.ticks.length)
                .tickFormat(d => {
                    let s = state.y_axis.ticks[0]['label'].innerHTML;
                    return s.includes("M") || s.includes("k") ? d3.format(".2s")(d) : d3.format(",")(d);
                });
            // state.y_axis.axis(state.y_axis.ticks);
                // .tickSize(-state.y_axis.ticks[1].children[0].getAttribute("x2"))
                // .ticks(typeof state.y_axis.ticks[0].__data__ === "string" ? state.y_axis.ordinal.length : state.y_axis.ticks.length);
        }

        configure_axes();
        return SVG;
    };

    return SVG;
}

function infer_type_from_path(element) { 
    let commands = svgPathParser.parseSVG(element.getAttribute("d"));
    if (!commands.length) return;

    element.contour = commands;
    let end_cmd = commands[commands.length - 1];

    if (commands.length === 3 && commands[1].code === "A" && end_cmd.code === "A") {
        element.type = "ellipse";
    } else if (end_cmd.code !== "Z") {
        element.type = "line";
    } else {
        element.type = "polygon";
    }
}

function analyze_axis(element, SVG, transform) {
    element._global_transform = [...transform];

    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
        let t = element.getAttribute("transform");
        if (t) {
            transform[0] += +t.match(/(\d+\.?\d*)/g)[0];
            transform[1] += +t.match(/(\d+\.?\d*)/g)[1];
        }
    } else {
        if (element.nodeName === "text") {
            SVG.state().axis_text_marks.push(element);
            element.style['pointer-events'] = 'none';
            element.style['user-select'] = 'none';
        } else {
            for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
                if (element.nodeName === mark_type) {
                    let is_x = element.hasAttribute("x2") ? +element.getAttribute("x2") : 0;
                    let is_y = element.hasAttribute("y2") ? +element.getAttribute("y2") : 0;

                    if (is_x) SVG.state().y_axis.ticks.push(element);
                    if (is_y) SVG.state().x_axis.ticks.push(element);
                }
            }
        }
    }

    for (const child of element.childNodes) {
        analyze_axis(child, SVG, [...transform]);
    }
}

function analyze_DOM_tree(element, SVG, transform) {
    if (element === null) {
        return;
    }

    var skip = false;
    element._global_transform = [...transform];

    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_CONTAINER) {
        SVG.state().svg = element;
    }

    if (element.nodeName === INTERACTION_CONSTANTS.SVG_TYPE.SVG_GROUP) {
        let t = element.getAttribute("transform");
        if (t) {
            transform[0] += +t.match(/(\d+\.?\d*)/g)[0];
            transform[1] += +t.match(/(\d+\.?\d*)/g)[1];
        }

        let c_name = element.className.animVal;
        if (c_name.includes("legend")) {
            skip = true;
        } else if (c_name.includes("tick") || c_name.includes("grid") ||  c_name.includes("label") /*|| c_name.includes("title")*/) {
            skip = true;
            for (const child of element.childNodes) {
                analyze_axis(child, SVG, [...transform]);
            }
        }
    } else {
        let added = false;
        for (const mark_type of INTERACTION_CONSTANTS.SVG_TYPE.SVG_MARK) {
            if (element.nodeName === "text") {
                element.style['pointer-events'] = 'none';
                element.style['user-select'] = 'none';
                if (!added) {
                    SVG.state().text_marks.push(element);
                    added = true;
                }
            }

            if (element.className && (element.className.animVal === "background" || element.className.animVal === "foreground")) {
                break;
            }

            if (element.nodeName === mark_type) {
                if (mark_type === "path") infer_type_from_path(element);

                if (element.className && element.className.animVal === INTERACTION_CONSTANTS.SVG_TYPE.TICK_DOMAIN) {
                    SVG.state().has_domain = true;
                } else {
                    element.setAttribute("__mark__", "true");
                    element.__transform = element.hasAttribute("transform") ? element.getAttribute("transform") : "translate(0, 0)";
                    SVG.state().svg_marks.push(element);
                }

                break;
            }
        }
    }

    if (!skip) {
        for (const child of element.childNodes) {
            analyze_DOM_tree(child, SVG, [...transform]);
        }
    }
}

function inspect(element) {
    let svg = new SVG();
    analyze_DOM_tree(element, svg, [0, 0]);
    svg.analyze_axes().infer_view().infer_mark_attributes();
    console.log(svg.state());
    return svg;
}

function add_interactions(checkbox, SVG) {
    for (const [key, value] of Object.entries(SVG.state().interactions)) {
        value.control = document.querySelector("#" + key);
        const axis_control = document.querySelector("#" + key + "_axis");
        if (axis_control) value.axis_control = axis_control;
    }
    return SVG;
}

function hydrate(svg_id, checkbox_id) {
    let svg = document.querySelector(svg_id);
    if (!svg) return;
    
    let checkbox = document.querySelector(checkbox_id);
    let SVG = inspect(svg);
    add_interactions(checkbox, SVG).hydrate();
}

export { hydrate };
