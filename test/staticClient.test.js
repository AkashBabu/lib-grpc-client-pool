import path from 'path';
import { expect } from 'chai';

import GRPCClient from '../src';
import messages from './hello_pb';

const PROTO_FILE = path.join(__dirname, 'hello_grpc_pb');

describe('#static-client', () => {
    it('should be able to use static build files by using static flag', async () => {
        const client = new GRPCClient(PROTO_FILE, {
            maxConnections : 2,
            rpcPrefix      : 'RPC',
            // packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
            staticFile     : true,
        });

        const { RPC_Hi } = client;

        const request = new messages.Request();
        request.setMsg('Hi');

        const res = await RPC_Hi(request);
        expect(res.getResp()).to.be.eql('Hello');
    });
    it('should be able to use methods defined in the static build files', async () => {
        const client = new GRPCClient(PROTO_FILE, {
            maxConnections : 2,
            rpcPrefix      : 'RPC',
            // packageName    : 'Hello',
            serviceName    : 'Greeting',
            url            : 'localhost:50001',
            staticFile     : true,
        });

        const { RPC_Hi } = client;

        const request = new messages.Request();
        request.setMsg('Hi');

        const res = await RPC_Hi(request);
        expect(res.getResp).to.be.a('function');
    });
});
