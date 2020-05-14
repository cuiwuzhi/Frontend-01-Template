var globals = [
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "Array",
  "ArrayBuffer",
  "Boolean",
  "DataView",
  "Date",
  "Error",
  "EvalError",
  "Float32Array",
  "Float64Array",
  "Function",
  "Int8Array",
  "Int16Array",
  "Int32Array",
  "Map",
  "Number",
  "Object",
  'Promise',
  "Proxy",
  "RangeError",
  "ReferenceError",
  "RegExp",
  "Set",
  "SharedArrayBuffer",
  "String",
  "Symbol",
  "SyntaxError",
  "TypeError",
  "Uint8Array",
  "Uint8ClampedArray",
  "Uint16Array",
  "Uint32Array",
  "URIError",
  "WeakMap",
  "WeakSet",
  "Atomics",
  "JSON",
  "Math",
  "Reflect"
];
var queue = [];
let i = 0;
var nodeObjets = new Set();
for (let p of globals) {
  let node = {
      path: [p],
      object: this[p],
      id: i,
      tagret: i,
      label: this[p].name ? this[p].name : this[p].constructor.name
  };
  queue.push(node);
  nodeObjets.add(node);
  i++;
}


var set = new Set();
let current;
while (queue.length) {
  current = queue.shift();
  if (set.has(current.object)) { i--;continue; };
  set.add(current.object);
  nodeObjets.add(current);
  if (Object.getPrototypeOf(current.object)) {
      let p = Object.getPrototypeOf(current.object)
      let node = {
          path: current.path.concat("__proto__"),
          object: p,
          id: i,
          tagret: i,
          label: p.name ? p.name : p.constructor.name
      };
      queue.push(node);
      i++;
  }
  for (let p of Object.getOwnPropertyNames(current.object)) {
      var property = Object.getOwnPropertyDescriptor(current.object, p);
      if (property.hasOwnProperty('value') && property.value != null && (typeof property.value instanceof Object || typeof property.value === 'object')) {
          let node = {
              path: current.path.concat([p]),
              object: property.value,
              id: i,
              tagret: current.id,
              label: property.value.name ? property.value.name : property.value.constructor.name
          };
          queue.push(node);
          i++;
      }
      if (property.hasOwnProperty('get') && typeof property.get === 'function') {
          let node = {
              path: current.path.concat([p]),
              object: property.get,
              id: i,
              tagret: current.id,
              label: property.get.name ? property.get.name : property.get.constructor.name
          };
          queue.push(node);
          i++;
      }

      if (property.hasOwnProperty('set') && typeof property.set === 'function') {
          let node = {
              path: current.path.concat([p]),
              object: property.set,
              id: i,
              tagret: current.id,
              label: property.set.name ? property.set.name : property.set.constructor.name
          };
          queue.push(node);
          i++;
      }
  }
}