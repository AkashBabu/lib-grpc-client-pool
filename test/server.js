import grpc from 'grpc';
import { loadSync } from '@grpc/proto-loader';
import path from  'path';

const PROTO_PATH = path.join(__dirname, './hello.proto');

const packageDefinitions = loadSync(PROTO_PATH);
const helloProto = grpc.loadPackageDefinition(packageDefinitions).Hello;

function sayHi(call, cb) {
    setTimeout(() => {
        cb(null, { resp: 'Hello' });
    }, 100 + (Math.random() * 50));
}

function notAvailable() {
    throw new Error('Should not be able to call this');
}

function readStream(call) {
    let count = 5;
    function writer() {
        setTimeout(() => {
            call.write({ resp: `count:${count}` });
            if (count-- > 0) writer();
            else call.end();
        }, 100);
    }
    writer();
}

function writeStream(call, cb) {
    call.on('data', () => {});

    call.on('end', () => {
        cb(null, { resp: 'Done' });
    });
}

function bothStream(call) {
    call.on('data', data => {
        call.write({ resp: data.msg });
    });

    call.on('end', () => {
        call.end();
    });
}

function main() {
    const server = new grpc.Server();
    server.addService(helloProto.Greeting.service, { _Hi: sayHi, NotAvailable: notAvailable, _ReadStream: readStream, _WriteStream: writeStream, _BothStream: bothStream });
    server.bind('0.0.0.0:50001', grpc.ServerCredentials.createInsecure());
    server.start();
}

main();
