import grpc from 'grpc';
import delay from 'delay';
import stream from 'stream';

// Properties - Symbols
const maxConns = Symbol('MaxConns');
const prefix = Symbol('Prefix');
const url = Symbol('URL');
const client = Symbol('Client');
const connPool = Symbol('ConnPool');


// Methods - Symbols
const createNewConn = Symbol('CreateNewConn');
const getFreeConn = Symbol('GetFreeConn');
const findFreeConn = Symbol('FindFreeConn');
const reserveConn = Symbol('ReserveConn');
const releaseConn = Symbol('ReleaseConn');
const initializeRPCs = Symbol('InitializeRPCs');


const CONN_STATUS = {
    FREE : 1,
    BUSY : 2,
};
export default class GRPCClient {
    constructor(protoFile, { serviceName, packageName, url: serverURL, maxConnections = 2, rpcPrefix = 'RPC', poolInterval = 200 }) {
        this[maxConns] = maxConnections;
        this[prefix] = rpcPrefix;
        this.connCount = 0;
        this.poolInterval = poolInterval;


        this[url] = serverURL;
        this[client] = grpc.load(protoFile)[packageName][serviceName];
        this[connPool] = {
            [CONN_STATUS.FREE] : {},
            [CONN_STATUS.BUSY] : {},
        };

        this[createNewConn]();

        this[initializeRPCs](this[findFreeConn]());
    }

    [createNewConn]() {
        this[connPool][CONN_STATUS.FREE][++this.connCount] = new this[client](this[url], grpc.credentials.createInsecure());
    }

    async [getFreeConn]() {
        const freeConn = this[findFreeConn]();
        if (freeConn) return freeConn;

        if (this.connCount < this[maxConns]) {
            this[createNewConn]();
        } else {
            await delay(this.poolInterval + (Math.random() * 20));
        }
        return this[getFreeConn]();
    }

    [findFreeConn]() {
        return Object.values(this[connPool][CONN_STATUS.FREE])[0];
    }

    [reserveConn](conn) {
        const connId = Object.keys(this[connPool][CONN_STATUS.FREE]).find(id => {
            const _conn = this[connPool][CONN_STATUS.FREE][id];
            return _conn === conn;
        });

        const _conn = this[connPool][CONN_STATUS.FREE][connId];
        delete this[connPool][CONN_STATUS.FREE][connId];

        this[connPool][CONN_STATUS.BUSY][connId] = _conn;
    }

    [releaseConn](conn) {
        const connId = Object.keys(this[connPool][CONN_STATUS.BUSY]).find(id => {
            const _conn = this[connPool][CONN_STATUS.BUSY][id];
            return _conn === conn;
        });

        const _conn = this[connPool][CONN_STATUS.BUSY][connId];
        delete this[connPool][CONN_STATUS.BUSY][connId];

        this[connPool][CONN_STATUS.FREE][connId] = _conn;
    }

    [initializeRPCs](conn) {
        for (const rpc in conn) { // eslint-disable-line
            if (rpc.match(/^_[A-Z]/)) {
                this[`${this[prefix]}${rpc}`] = async (data, cb) => {
                    // Minute delay for handling recursive calls
                    await delay(Math.random() * 5);

                    const freeConn = await this[getFreeConn]();
                    this[reserveConn](freeConn);

                    let resolved = false;
                    return new Promise((resolve, reject) => {
                        const response = freeConn[rpc](data, (err, result) => {
                            this[releaseConn](freeConn);

                            cb && cb(err, result);

                            if (!resolved) {
                                if (err) return reject(err);
                                return resolve(result);
                            }
                        });
                        if (response instanceof stream.Readable || response instanceof stream.Writable) {
                            response.on && response.on('end', () => {
                                this[releaseConn](freeConn);
                            });
                            resolved = true;
                            resolve(response);
                        }
                    });
                };
            }
        }
    }
}
