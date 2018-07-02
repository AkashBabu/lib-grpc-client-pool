'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _grpc = require('grpc');

var _grpc2 = _interopRequireDefault(_grpc);

var _delay = require('delay');

var _delay2 = _interopRequireDefault(_delay);

var _stream = require('stream');

var _stream2 = _interopRequireDefault(_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Properties - Symbols
var maxConns = (0, _symbol2.default)('MaxConns');
var prefix = (0, _symbol2.default)('Prefix');
var url = (0, _symbol2.default)('URL');
var client = (0, _symbol2.default)('Client');
var connPool = (0, _symbol2.default)('ConnPool');

// Methods - Symbols
var createNewConn = (0, _symbol2.default)('CreateNewConn');
var getFreeConn = (0, _symbol2.default)('GetFreeConn');
var findFreeConn = (0, _symbol2.default)('FindFreeConn');
var reserveConn = (0, _symbol2.default)('ReserveConn');
var releaseConn = (0, _symbol2.default)('ReleaseConn');
var initializeRPCs = (0, _symbol2.default)('InitializeRPCs');

var CONN_STATUS = {
    FREE: 1,
    BUSY: 2
};

var GRPCClient = function () {
    function GRPCClient(protoFile, _ref) {
        var _connPool;

        var serviceName = _ref.serviceName,
            packageName = _ref.packageName,
            serverURL = _ref.url,
            _ref$maxConnections = _ref.maxConnections,
            maxConnections = _ref$maxConnections === undefined ? 2 : _ref$maxConnections,
            _ref$rpcPrefix = _ref.rpcPrefix,
            rpcPrefix = _ref$rpcPrefix === undefined ? 'RPC' : _ref$rpcPrefix,
            _ref$poolInterval = _ref.poolInterval,
            poolInterval = _ref$poolInterval === undefined ? 200 : _ref$poolInterval;
        (0, _classCallCheck3.default)(this, GRPCClient);

        this[maxConns] = maxConnections;
        this[prefix] = rpcPrefix;
        this.connCount = 0;
        this.poolInterval = poolInterval;

        this[url] = serverURL;
        this[client] = _grpc2.default.load(protoFile)[packageName][serviceName];
        this[connPool] = (_connPool = {}, (0, _defineProperty3.default)(_connPool, CONN_STATUS.FREE, {}), (0, _defineProperty3.default)(_connPool, CONN_STATUS.BUSY, {}), _connPool);

        this[createNewConn]();

        this[initializeRPCs](this[findFreeConn]());
    }

    (0, _createClass3.default)(GRPCClient, [{
        key: createNewConn,
        value: function value() {
            this[connPool][CONN_STATUS.FREE][++this.connCount] = new this[client](this[url], _grpc2.default.credentials.createInsecure());
        }
    }, {
        key: getFreeConn,
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var freeConn;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                freeConn = this[findFreeConn]();

                                if (!freeConn) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return', freeConn);

                            case 3:
                                if (!(this.connCount < this[maxConns])) {
                                    _context.next = 7;
                                    break;
                                }

                                this[createNewConn]();
                                _context.next = 9;
                                break;

                            case 7:
                                _context.next = 9;
                                return (0, _delay2.default)(this.poolInterval + Math.random() * 20);

                            case 9:
                                return _context.abrupt('return', this[getFreeConn]());

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function value() {
                return _ref2.apply(this, arguments);
            }

            return value;
        }()
    }, {
        key: findFreeConn,
        value: function value() {
            return (0, _values2.default)(this[connPool][CONN_STATUS.FREE])[0];
        }
    }, {
        key: reserveConn,
        value: function value(conn) {
            var _this = this;

            var connId = (0, _keys2.default)(this[connPool][CONN_STATUS.FREE]).find(function (id) {
                var _conn = _this[connPool][CONN_STATUS.FREE][id];
                return _conn === conn;
            });

            var _conn = this[connPool][CONN_STATUS.FREE][connId];
            delete this[connPool][CONN_STATUS.FREE][connId];

            this[connPool][CONN_STATUS.BUSY][connId] = _conn;
        }
    }, {
        key: releaseConn,
        value: function value(conn) {
            var _this2 = this;

            var connId = (0, _keys2.default)(this[connPool][CONN_STATUS.BUSY]).find(function (id) {
                var _conn = _this2[connPool][CONN_STATUS.BUSY][id];
                return _conn === conn;
            });

            var _conn = this[connPool][CONN_STATUS.BUSY][connId];
            delete this[connPool][CONN_STATUS.BUSY][connId];

            this[connPool][CONN_STATUS.FREE][connId] = _conn;
        }
    }, {
        key: initializeRPCs,
        value: function value(conn) {
            var _this3 = this;

            var _loop = function _loop(rpc) {
                // eslint-disable-line
                if (rpc.match(/^_[A-Z]/)) {
                    _this3['' + _this3[prefix] + rpc] = function () {
                        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(data, cb) {
                            var freeConn, resolved;
                            return _regenerator2.default.wrap(function _callee2$(_context2) {
                                while (1) {
                                    switch (_context2.prev = _context2.next) {
                                        case 0:
                                            _context2.next = 2;
                                            return (0, _delay2.default)(Math.random() * 5);

                                        case 2:
                                            _context2.next = 4;
                                            return _this3[getFreeConn]();

                                        case 4:
                                            freeConn = _context2.sent;

                                            _this3[reserveConn](freeConn);

                                            resolved = false;
                                            return _context2.abrupt('return', new _promise2.default(function (resolve, reject) {
                                                var response = freeConn[rpc](data, function (err, result) {
                                                    _this3[releaseConn](freeConn);

                                                    cb && cb(err, result);

                                                    if (!resolved) {
                                                        if (err) return reject(err);
                                                        return resolve(result);
                                                    }
                                                });
                                                if (response instanceof _stream2.default.Readable || response instanceof _stream2.default.Writable) {
                                                    response.on && response.on('end', function () {
                                                        _this3[releaseConn](freeConn);
                                                    });
                                                    resolved = true;
                                                    resolve(response);
                                                }
                                            }));

                                        case 8:
                                        case 'end':
                                            return _context2.stop();
                                    }
                                }
                            }, _callee2, _this3);
                        }));

                        return function (_x, _x2) {
                            return _ref3.apply(this, arguments);
                        };
                    }();
                }
            };

            for (var rpc in conn) {
                _loop(rpc);
            }
        }
    }]);
    return GRPCClient;
}();

exports.default = GRPCClient;