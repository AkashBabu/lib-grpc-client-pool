# lib-grpc-client-pool [![Build Status](https://travis-ci.com/AkashBabu/lib-grpc-client-pool.svg?branch=master)](https://travis-ci.com/AkashBabu/lib-grpc-client-pool) [![Maintainability](https://api.codeclimate.com/v1/badges/099d46a7375d95caa3c6/maintainability)](https://codeclimate.com/github/AkashBabu/lib-grpc-client-pool/maintainability)
A Nodejs Lib implementing Pool Connection for GRPC client

## What this library provides ?
- *Connection Pool* - To overcome RESOURCE_EXHAUSTED issue
- *RPC Abstraction* - To provide ease of use
- *Async/Await* - Converts callback handling of gRPC response to Promise based

## Naming Rules in Proto Files
Names of the RPC function must Match /^_[A-Z]/, meaning it must start with an `_` followed by an Upper-Case letter  
Sample `.proto` file:
```protobuf
syntax = "proto3";

package Hello;

service Greeting {
    rpc NotAvailable(Request) returns (Reply) {};
    rpc _Hi(Request) returns (Reply) {};
    rpc _ReadStream(Request) returns (stream Reply) {};
    rpc _WriteStream(stream Request) returns (Reply) {};
    rpc _BothStream(stream Request) returns (stream Reply) {};
}

message Request {
    string msg = 1;
}

message Reply {
    string resp = 1;
}
```
** Note that the RPC `NotAvailable` will not be exposed by this library

# Usage
**Request - Response**
```js
const client = new GRPCClient(PROTO_FILE_PATH, {
    maxConnections : 5,
    packageName    : 'Hello',
    serviceName    : 'Greeting',
    url            : 'localhost:50001',
    prefix         : 'RPC'
});

const { RPC_Hi, RPC_ReadStream, RPC_WriteStream, RPC_BothStream } = client;

const response = await RPC_Hi({msg: 'Hey Bot!'})
```

**Request - Response(stream)**
```js
const response = await RPC_ReadStream({msg: 'Hey Bot!'})
response.on('data', data => {
    console.log('msg from server:', data)
})
response.on('end', () => {
    console.log('Response stream ends')
})
```

**Request(stream) - Response**
```js
const writer = await RPC_WriteStream({msg: 'Hey Bot!'}, (err, result) => {
    console.log('Response from server:', result);
});

writer.write({msg});
writer.end();
```

**Request(stream) - Response(stream)**
```js
const stream = await RPC_BothStream({msg: 'Hey Bot!'});

stream.on('data', data => {
    console.log('msg from server:', data)
})
stream.on('end', () => {
    console.log('Response stream ends')
})

stream.write({msg});
stream.end();
```

## ES-Lint
> npm run lint

## Babel
> npm run build  

## Mocha & Chai (Testing)
> npm test

## Coverage Report
> npm run coverage

## Contributions
Any PR is always welcome, just make sure that your test cases would cover your new features