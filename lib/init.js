var redis = require('extern/redis');

var get_db_client = function() {
  var client = redis.createClient();

  return client;
}

exports.get_db_client = get_db_client;
