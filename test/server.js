import grpc from 'grpc';
import path from  'path';

const PROTO_PATH = path.join(__dirname, './hello.proto');

const helloProto = grpc.load(PROTO_PATH).Hello;

function sayHi(call, cb) {
    setTimeout(() => {
        cb(null, { resp: 'Hello' });
    }, 100 + (Math.random() * 50));
}

function notAvailable() {
    throw new Error('Should not be able to call this');
}

function main() {
    const server = new grpc.Server();
    server.addService(helloProto.Greeting.service, { _Hi: sayHi, NotAvailable: notAvailable });
    server.bind('0.0.0.0:50001', grpc.ServerCredentials.createInsecure());
    server.start();
}

main();
