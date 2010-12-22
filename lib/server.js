var http = require('http');
var utils = require('utils');

var clutch = require('extern/clutch');

var routes = require('routes');
var subscription = require('subscription');
var data_structures = require('data_structures');
var db = require('db');

function PubSubHubServer(port, secure) {
  this._port = port || 80;
  this._secure = secure || false;

  this.subscriptions = {};
  this.notification_queue = data_structures.SortedTable();
  this.topics = data_structures.SortedTable();

  this._retry_queue = [];
}

PubSubHubServer.prototype.start = function() {
  var server, urls;

  urls = clutch.route404(routes.routes, this);
  server = http.createServer(urls);

  server.listen(this._port, 'localhost');
};

PubSubHubServer.prototype.create_subscription = function(callback_url, topic, verify,
                                                         lease_seconds, secret,
                                                         verify_token, callback) {
  var sub, key;

  key = subscription.get_key_for_subscription(callback_url, topic);
  sub = subscription.get_subscription(key, function(err, sub) {
    var multi;
    var existing = true;

    if (err) {
      callback(err);
      return;
    }

    if (!sub) {
      sub = new subscription.Subscription(callback_url, topic, lease_seconds,
                                          secret);
      existing = false;
    }

    multi = sub.get_multi();

    // Save the subscription details
    multi.exec(function(err, replies) {
      if (err) {
        callback(err);
        return;
      }

      console.log(sub);

      callback(null, existing, sub);
    });
  });
};

PubSubHubServer.prototype.verify_intent = function(subs, mode, verify_token,
                                                   callback) {

  var topic, challange, lease_seconds;
  var challange = utils.get_random_string(20);
  var query_string = utils.values_to_query_string([ 'mode', 'topic', 'challenge',
                                                    'lease_seconds', 'verify_token'],
                                                  [ mode, topic, challenge,
                                                    lease_seconds, verify_token]);

  get_response(sprintf('%s?%s', topic, query_string), on_result);

  var on_result = function(err, result_object) {
    if (err) {
      callback(err, null, null);
      return;
    }

    if (result_object.status_code < 200 || result_object.status_code > 299) {
      // Invalid status code
      if (mode === 'sync') {
        // Verification failed
        return;
      }
      else if (mode === 'async') {
        // Re-try the request later
      }
    }

    if (result_object.body != challange) {
      // Invalid challange
      if (mode === 'sync') {
        // Verification failed
        return;
      }
      else if (mode === 'async') {
        // Re-try the request later
      }
    }

    // Everything passed, activate the subscription
  };

}:

PubSubHubServer.prototype.unsubscribe = function() {
  // Remove info from the database and unsubscribe
}

PubSubHubServer.prototype.handle_subscribe = function(req, res) {
}

new PubSubHubServer(1337).start();
