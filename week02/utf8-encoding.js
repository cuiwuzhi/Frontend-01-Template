/**
 * @param {string} str
 * @return ArrayBuffer
 */
function utf8Encoding(str) {
  return str.split('').map((s) => `\\u${s.charCodeAt().toString(16)}`).join('');
}

console.log(utf8Encoding('前端训练营')); //\u524d\u7aef\u8bad\u7ec3\u8425