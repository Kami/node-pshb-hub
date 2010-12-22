var crypto = require('crypto');

var db = require('db');
var util = require('./util');

var properties = {
                    'callback': 'string',
                    'topic': 'string',
                    'lease_seconds': 'int',
                    'secret': 'string',
                    'date_created': 'int',
                    'date_modified': 'int',
                    'date_expire': 'int',
                    'activated': 'string'
};

Subscription = function(callback, topic, lease_seconds, secret, date_created,
                        date_modified, date_expire) {
  this.callback = callback;
  this.topic = topic;
  this.lease_seconds = lease_seconds || null;
  this.secret = secret || null;

  this.date_created = date_created || new Date().getTime();
  this.date_modified = date_modified || this.date_created;
  this.date_expire = date_expire || (lease_seconds) ? (this.date_created + lease_seconds) : false;

  this.activated = false;

  this._key = get_key_for_subscription(this.callback, this.topic);
  this._retry_count = 0;
}

Subscription.prototype.get_multi = function() {
  var multi = db.get_client().multi();
  var keys = Object.keys(properties);
  var i, property;

  for (i = 0; i < keys.length; i++) {
    property = keys[i];
    multi.hset(this.key, property, this[property]);
  }

  return multi;
};

var get_subscription = function(key, callback) {
  var keys = Object.keys(properties);
  var command = [ key ].concat(keys);

  db.get_client().hmget(command, function (err, values) {
    if (err) {
      callback(err, null);
      return;
    }

    if (values[0] === null) {
      // This subscription does not yet exist
      callback(null, null);
      return;
    }

    var object = util.buffer_array_to_object(values, properties);

    sub = new Subscription(object.callback, object.topic, object.lease_seconds,
                           object.secret, object.date_created,
                           object.date_modified, object.date_expire);
    callback(null, sub);
  });
};

var get_key_for_subscription = function(callback_url, topic_url) {
  var data = callback_url + '-' + topic_url;

  return crypto.createHash('md5').update(data).digest('base64');
};


exports.Subscription = Subscription;
exports.get_subscription = get_subscription;
exports.get_key_for_subscription = get_key_for_subscription;
