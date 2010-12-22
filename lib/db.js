var redis = require('extern/redis');

var get_client = function(port, host) {
  host = host || 'localhost';
  port = port || '6379';

  var client = redis.createClient(port, host);

  return client;
};

exports.get_client = get_client;
