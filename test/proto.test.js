import { expect } from 'chai';
import grpc from 'grpc';
import { loadSync } from '@grpc/proto-loader';
import path from  'path';
import GRPCClient from '../src';

const PROTO_PATH = path.join(__dirname, './proto_with_dot.proto');

const packageDefinition = loadSync(PROTO_PATH);
const greetProto = grpc.loadPackageDefinition(packageDefinition).com.greeting.proto;

const serverAddress = '0.0.0.0:51001';

function sayHello(call, cb) {
    cb(null, { greet: 'Hello!' });
}

function main() {
    const server = new grpc.Server();
    server.addService(greetProto.Greeting.service, { _Hi: sayHello });
    server.bind(serverAddress, grpc.ServerCredentials.createInsecure());
    server.start();
}

describe('#proto Proto tests', () => {
    before(done => {
        main();
        setTimeout(done, 1000);
    });

    it('should be able to handle proto files with \'.\' in the package names', async () => {
        const client = new GRPCClient(PROTO_PATH, {
            serviceName : 'Greeting',
            packageName : 'com.greeting.proto',
            url         : serverAddress,
            rpcPrefix   : 'RPC',
        });

        const { RPC_Hi } = client;

        const response = await RPC_Hi();
        expect(response.greet).to.be.eql('Hello!');
    });
});
