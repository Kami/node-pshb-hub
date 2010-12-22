/* http://blog.jcoglan.com/2010/10/18/i-am-a-fast-loop/ */
Table = function() {
  this._keys = [];
  this._data = {};
};

Table.prototype.put = function(key, value) {
  if (!this._data.hasOwnProperty(key)) this._keys.push(key);
  this._data[key] = value;
};

Table.prototype.forEach = function(block, context) {
  var keys = this._keys,
      data = this._data,
      i    = keys.length,
      key;

  while (i--) {
    key = keys[i];
    block.call(context, key, data[key]);
  }
};

SortedTable = function() {
  Table.call(this);
};

SortedTable.prototype = new Table();

SortedTable.prototype.put = function(key, value) {
  if (!this._data.hasOwnProperty(key)) {
    var index = this._indexOf(key);
    this._keys.splice(index, 0, key);
  }
  this._data[key] = value;
};

SortedTable.prototype.remove = function(key) {
  if (!this._data.hasOwnProperty(key)) return;
  delete this._data[key];
  var index = this._indexOf(key);
  this._keys.splice(index, 1);
};

SortedTable.prototype._indexOf = function(key) {
  var keys = this._keys,
      n    = keys.length,
      i    = 0,
      d    = n;

  if (n === 0)         return 0;
  if (key < keys[0])   return 0;
  if (key > keys[n-1]) return n;

  while (key !== keys[i] && d > 0.5) {
    d = d / 2;
    i += (key > keys[i] ? 1 : -1) * Math.round(d);
    if (key > keys[i-1] && key < keys[i]) d = 0;
  }
  return i;
};

exports.Table = Table;
exports.SortedTable = SortedTable;
