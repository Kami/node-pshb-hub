var sprintf = require('extern/sprintf');

var util = require('./util');
var querystring = require('querystring');

/* All the handlers here are called in the context of the PubSub hub server. */

var handle_subscribe = function(req, res) {
  var self = this;
  var required_keys = [ 'callback', 'mode', 'topic', 'verify'];
  var valid_values = {
      'mode': [ 'subscribe' ],
      'verify': [ 'sync', 'async' ]
  }

  var data_buffer = [];
  var status;

  var on_data = function(chunk) {
    data_buffer.push(chunk);
  };

  var on_end = function() {
    var data, query_string;

    data = data_buffer.join('').toString();
    query_string = querystring.parse(data);

    if (!util.verify_arguments(query_string, 'hub', required_keys, valid_values)) {
      send_json(res, 500, 'Missing require argument or invalid value for some key: ' +
                            required_keys.join(', '))
      return;
    };

    data = query_string.hub;
    self.create_subscription(data.callback, data.topic, data.verify,
                             data.lease_seconds, data.secret, data.verify_token,
                             on_result);
  };

  var on_result = function(err, existing, sub) {
    var message;

    if (err) {
      send_json(res, 500, err.message);
    }

    if (existing) {
      message = 'Subscription successfully updated.';
    }
    else {
      message = 'Subscription successfully created.'
    }

    send_json(res, 200, message);
  };

  req.on('data', on_data);
  req.on('end', on_end);
}

var handle_unsubscribe = function(req_rest) {

}

var send_json = function(res, status_code, message) {
  res.writeHead(status_code, {'Content-Type': 'application/json'});
  res.end(message);
}

exports.handle_subscribe = handle_subscribe;
