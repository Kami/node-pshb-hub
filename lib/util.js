var urllib = require('url');
var http = require('http');
var querystring = require('querystring');

var sprintf = require('extern/sprintf').sprintf;

var verify_arguments = function(object, namespace, required_keys, valid_values) {
  var valid_values = valid_values || {};

  var i = 0, num_found = 0;
  var num_keys = required_keys.length;
  var key, value, values;

  if (!object) {
    return false;
  }

  if (namespace) {
    if (!object.hasOwnProperty(namespace)) {
      return false;
    }

    object = object[namespace];
  }

  for (i = 0; i < num_keys; i++) {
    key = required_keys[i];

    if (!object.hasOwnProperty(key)) {
      return false;
    }
    else {
      num_found++;

      if (valid_values.hasOwnProperty(key)) {
        values = valid_values[key];
        value = object[key];

        if (values.indexOf(value) === -1) {
          return false;
        }
      }

      if (num_found == num_keys) {
        return true;
      }
    }
  }

  return true;
};

var buffer_array_to_object = function(buffer_array, property_mappings) {
  var i, buffer, key;
  var keys = Object.keys(property_mappings);
  var len = keys.length;
  var object = {};

  for (i = 0; i < len; i++) {
    key = keys[i];
    buffer = buffer_array[i].toString();

    object[key] = string_to_value(buffer, property_mappings[key]);
  }

  return object;
};

var string_to_value = function(string, type) {
  if (string === 'null') {
      return null;
  }
  else if (string === 'undefined') {
    return undefined;
  }
  else if (string === 'true') {
    return true;
  }
  else if (string === 'false') {
    return false;
  }

  if (type === 'string') {
    return string;
  }
  else if (type === 'int') {
    return parseInt(string, 10);
  }
  else {
    throw new Error('Invalid type: ' + type);
  }
};

var values_to_query_string = function(properties, values) {
  var i, len, property, value;
  var object;

  len = properties.length;

  for (i = 0; i < len; i++) {
    property = properties[i];
    value = values[i];

    if (value !== null) {
      object[property] = value;
    }
  }

  return querystring.stringify(object);
};

var get_random_string = function(char_count) {
  var char_count = char_count || 30;
  var min_index = 48, max_index = 90;
  var i, character;

  var string = [];
  for (i = 0; i < char_count; i++) {
    character = String.fromCharCode(Math.random() * (max_index - min_index) + min_index);
    string.push(character);
  }

  return string.join('');
};

/* Taken from Cast */
/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
get_response = function(url, method, parse_json, callback) {
  var url_object, client, path, requesT;
  var data_buffer, data, result_object;
  var callback_called = false;

  if (!misc.in_array(method, ['GET', 'PUT', 'POST'])) {
    return callback(new Error(sprintf('Invalid method: %s', method)));
  }

  url_object = urllib.parse(url);
  client = http.createClient(url_object.port, url_object.host);
  path = sprintf('%s%s', url_object.pathname, url_object.search);
  request = client.request(method, url_object., { 'host': url_object.host });

  client.on('error', function(err) {
    if (callback_called) {
      return;
    }

    callback(err, null);
    callback_called = true;
  });

  result_object = {'headers': null, 'status_code': null, 'body': null};

  request.on('response', function(response) {
    data_buffer = [];
    response.setEncoding('utf-8');

    response.on('error', callback);

    response.on('data', function(chunk) {
      data_buffer.push(chunk);
    });

    response.on('end', function() {
      data = data_buffer.join('');

      if (parse_json && data.length > 0) {
        data = JSON.parse(data);
      }

      if (callback_called) {
        return;
      }

      result_object.headers = response.headers;
      result_object.status_code = response.statusCode;
      result_object.body = data;

      callback(null, result_object);
      callback_called = true;
    });
  });

  request.end();
};

exports.verify_arguments = verify_arguments;
exports.buffer_array_to_object = buffer_array_to_object;
exports.string_to_value = string_to_value;
exports.values_tu_query_string = values_to_query_string;
exports.get_random_string = get_random_string;
exports.get_response = get_response;
