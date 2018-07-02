'use strict';

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Takes in proto path
 */

var proto = _grpc2.default.load(_path2.default.resolve('./hello.proto')).Hello;
var client = new proto.Greeting("localhost:50001", _grpc2.default.credentials.createInsecure());

for (var rpc in client) {
    if (client.hasOwnProperty && typeof client[rpc] === 'function') {
        console.log('RPC:', rpc);
    }
}