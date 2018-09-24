'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _promise = require('babel-runtime/core-js/promise');var _promise2 = _interopRequireDefault(_promise);var _values = require('babel-runtime/core-js/object/values');var _values2 = _interopRequireDefault(_values);var _regenerator = require('babel-runtime/regenerator');var _regenerator2 = _interopRequireDefault(_regenerator);var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);var _defineProperty2 = require('babel-runtime/helpers/defineProperty');var _defineProperty3 = _interopRequireDefault(_defineProperty2);var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = require('babel-runtime/helpers/createClass');var _createClass3 = _interopRequireDefault(_createClass2);var _symbol = require('babel-runtime/core-js/symbol');var _symbol2 = _interopRequireDefault(_symbol);var _grpc = require('grpc');var _grpc2 = _interopRequireDefault(_grpc);
var _protoLoader = require('@grpc/proto-loader');
var _delay = require('delay');var _delay2 = _interopRequireDefault(_delay);
var _stream = require('stream');var _stream2 = _interopRequireDefault(_stream);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

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
var changeConnStatus = (0, _symbol2.default)('ChangeConnStatus');
var initializeRPCs = (0, _symbol2.default)('InitializeRPCs');

// Connection Status
var CONN_STATUS = {
    FREE: 0,
    BUSY: 1 };



/**
                * @typedef {object} ConnObj
                * @property {number} id
                * @property {object} conn
                */var

GRPCClient = function () {
    function GRPCClient(protoFile, _ref) {var _connPool;var serviceName = _ref.serviceName,packageName = _ref.packageName,serverURL = _ref.url,_ref$maxConnections = _ref.maxConnections,maxConnections = _ref$maxConnections === undefined ? 2 : _ref$maxConnections,_ref$rpcPrefix = _ref.rpcPrefix,rpcPrefix = _ref$rpcPrefix === undefined ? 'RPC' : _ref$rpcPrefix,_ref$poolInterval = _ref.poolInterval,poolInterval = _ref$poolInterval === undefined ? 200 : _ref$poolInterval;(0, _classCallCheck3.default)(this, GRPCClient);
        // Max Client connections to Server
        this[maxConns] = maxConnections;

        // Prefix for GRPC Methods
        this[prefix] = rpcPrefix;

        // Connection Ids
        this.connCount = 0;

        // Free-Client Check Interval
        this.poolInterval = poolInterval;

        // gRPC-Server URL
        this[url] = serverURL;

        // gRPC Client Channel
        var packageDefinition = (0, _protoLoader.loadSync)(protoFile);
        var tmp = _grpc2.default.loadPackageDefinition(packageDefinition);
        this[client] = packageName.split('.').reduce(function (proto, chunk) {return proto[chunk];}, tmp)[serviceName];

        // Connection Pool Buffer
        this[connPool] = (_connPool = {}, (0, _defineProperty3.default)(_connPool,
        CONN_STATUS.FREE, {}), (0, _defineProperty3.default)(_connPool,
        CONN_STATUS.BUSY, {}), _connPool);


        // Create a first Client
        this[createNewConn]();

        // Initialize RPC Methods by using the First Created Client
        this[initializeRPCs](this[findFreeConn]());
    }

    /**
       * Creates a New Connection and Adds it to the pool in FREE status
       */(0, _createClass3.default)(GRPCClient, [{ key:
        createNewConn, value: function value() {
            var newConnId = ++this.connCount;
            this[connPool][CONN_STATUS.FREE][newConnId] = {
                conn: new this[client](this[url], _grpc2.default.credentials.createInsecure()),
                id: newConnId };

        }

        /**
           * Finds/Waits for a FREE connection
           */ }, { key:
        getFreeConn, value: function () {var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {var freeConnObj;return _regenerator2.default.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (

                                    (0, _delay2.default)(Math.random() * 5));case 2:

                                freeConnObj = this[findFreeConn]();if (!
                                freeConnObj) {_context.next = 5;break;}return _context.abrupt('return', freeConnObj);case 5:if (!(


                                this.connCount < this[maxConns])) {_context.next = 9;break;}
                                this[createNewConn]();_context.next = 11;break;case 9:_context.next = 11;return (

                                    (0, _delay2.default)(this.poolInterval + Math.random() * 10));case 11:return _context.abrupt('return',

                                this[getFreeConn]());case 12:case 'end':return _context.stop();}}}, _callee, this);}));function value() {return _ref2.apply(this, arguments);}return value;}()


        /**
                                                                                                                                                                                                * Returns the first FREE connection if exists, else returns undefined
                                                                                                                                                                                                */ }, { key:
        findFreeConn, value: function value() {
            return (0, _values2.default)(this[connPool][CONN_STATUS.FREE])[0];
        }

        /**
           * Changes the Connection Status
           * @param {ConnObj} connObj
           * @param {number} newStatus
           */ }, { key:
        changeConnStatus, value: function value(connObj, newStatus) {
            // Converts 0->1(FREE->BUSY) & 1->0(BUSY->FREE) for changing status
            var currStatus = newStatus ^ 1;

            // Add the ConnObj to the NewStatus
            this[connPool][newStatus][connObj.id] = connObj;

            // Remove the ConnObj from CurrentStatus
            delete this[connPool][currStatus][connObj.id];
        }

        /**
           * Changes the status of the given ConnObj to BUSY
           * @param {ConnObj} connObj
           */ }, { key:
        reserveConn, value: function value(connObj) {
            this[changeConnStatus](connObj, CONN_STATUS.BUSY);
        }

        /**
           * Changes the status of the given ConnObj to FREE
           * @param {ConnObj} connObj
           */ }, { key:
        releaseConn, value: function value(connObj) {
            this[changeConnStatus](connObj, CONN_STATUS.FREE);
        }

        /**
           * Adds Methods from protoBuf file to `this` instance object
           * @param {ConnObj} connObj
           */ }, { key:
        initializeRPCs, value: function value(connObj) {var _this = this;var _loop = function _loop(
            rpc) {// eslint-disable-line
                if (rpc.match(/^_[A-Z]/)) {
                    // Creating Method on `this` instance => prefix + rpc_method
                    _this['' + _this[prefix] + rpc] = function () {var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(data, cb) {var freeConnObj;return _regenerator2.default.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
                                                _this[getFreeConn]());case 2:freeConnObj = _context2.sent;

                                            // Reserve a FREE Connection on obtaining one
                                            _this[reserveConn](freeConnObj);return _context2.abrupt('return',

                                            new _promise2.default(function (resolve, reject) {
                                                // To avoid Duplicate resolving of Promise
                                                var resolved = false;

                                                var response = freeConnObj.conn[rpc](data, function (err, result) {
                                                    // Release the connection after the request is Done
                                                    _this[releaseConn](freeConnObj);

                                                    cb && cb(err, result);
                                                    return !resolved && (err ? reject(err) : resolve(result));
                                                });
                                                if (response instanceof _stream2.default.Readable || response instanceof _stream2.default.Writable) {
                                                    response.on && response.on('end', function () {return _this[releaseConn](freeConnObj);});
                                                    resolved = true;
                                                    resolve(response);
                                                }
                                            }));case 5:case 'end':return _context2.stop();}}}, _callee2, _this);}));return function (_x, _x2) {return _ref3.apply(this, arguments);};}();

                }};for (var rpc in connObj.conn) {_loop(rpc);
            }
        } }]);return GRPCClient;}();exports.default = GRPCClient;