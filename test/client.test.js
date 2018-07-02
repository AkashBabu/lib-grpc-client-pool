import { expect } from 'chai';
import path from 'path';
import delay from 'delay';
import GRPCClient from '../src';

require('./server');

const PROTO_FILE = path.join(__dirname, './hello.proto');

describe('#pool GRPC Connection Pool', () => {
    it('should not expose any of the private functions', () => {
        const client = new GRPCClient(PROTO_FILE, {
            maxConnections : 2,
            rpcPrefix      : 'RPC',
            packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
        });

        expect(client.maxConns).to.be.undefined;
        expect(client.prefix).to.be.undefined;
        expect(client.url).to.be.undefined;
        expect(client.client).to.be.undefined;
        expect(client.createNewConn).to.be.undefined;
        expect(client.getFreeConn).to.be.undefined;
        expect(client.findFreeConn).to.be.undefined;
        expect(client.initializeRPCs).to.be.undefined;
    });
    it('should expose only the rpc that start with _', () => {
        const client = new GRPCClient(PROTO_FILE, {
            maxConnections : 2,
            packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
        });

        expect(client.RPC_Hi).to.be.a('function');
        expect(client.RPC_NotAvailable).to.be.undefined;
    });
    it('should use the given prefix', () => {
        const client = new GRPCClient(PROTO_FILE, {
            maxConnections : 2,
            rpcPrefix      : 'Custom',
            packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
        });

        expect(client.Custom_Hi).to.be.a('function');
    });
    it('should be able to make a GRPC call', async () => {
        const client = new GRPCClient(PROTO_FILE, {
            maxConnections : 2,
            packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
        });

        const { RPC_Hi } = client;

        const result = await RPC_Hi({ msg: 'Hey Bot!' });
        expect(result.resp).to.be.eql('Hello');
    });
    it('should create connections of max upto maxConnections', async () => {
        const connOpts = {
            maxConnections : 2,
            packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
        };
        const client = new GRPCClient(PROTO_FILE, connOpts);

        const { RPC_Hi } = client;

        for (let i = 0; i < 10; i++) {
            RPC_Hi({ msg: 'Hey Bot!' });
        }

        await delay(10);
        expect(client.connCount).to.be.eql(connOpts.maxConnections);
    });
    it('should handle many rpc calls', async function () {
        this.timeout(10 * 1000);
        const connOpts = {
            maxConnections : 5,
            packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
        };
        const client = new GRPCClient(PROTO_FILE, connOpts);

        const { RPC_Hi } = client;

        client.poolInterval = 100;
        const rpcPromises = [];
        for (let i = 0; i < 100; i++) {
            rpcPromises.push(RPC_Hi({ msg: 'Hey Bot!' }));
        }

        const result = await Promise.all(rpcPromises);
        expect(client.connCount).to.be.eql(connOpts.maxConnections);
        for (let i = 0; i < 100; i++) {
            expect(result[i].resp).to.be.eql('Hello');
        }
    });
});
