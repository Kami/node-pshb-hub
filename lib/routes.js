var clutch = require('extern/clutch');

var handlers = require('handlers');

routes = [
      ['POST /subscribe/?', handlers.handle_subscribe],
      ['POST /unsubscribe/?', handlers.handle_unsubscribe]
];

exports.routes = routes;
