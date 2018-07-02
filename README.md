# lib-grpc-client-pool
A Nodejs Lib implementing Pool Connection for GRPC client

## What this library provides ?
- *Connection Pool* - To overcome RESOURCE_EXHAUSTED issue
- *RPC Abstraction* - To provide ease of use
- *Async/Await* - Converts callback handling of gRPC response to Promise based

## Naming Rules in Proto Files
Names of the RPC function must Match /^_[A-Z]/, meaning it must start with an `_` followed by an Upper-Case letter  
Sample .proto file:
```protobuf
syntax = "proto3";

package Hello;

service Greeting {
    rpc NotAvailable(Request) returns (Reply) {};
    rpc _Hi(Request) returns (Reply) {};
}

message Request {
    string msg = 1;
}

message Reply {
    string resp = 1;
}
```
** Note that the RPC `NotAvailable` will not be exposed by this library

## Usage
```js
const client = new GRPCClient(PROTO_FILE_PATH, {
    maxConnections : 5,
    packageName    : 'Hello',
    serviceName    : 'Greeting',
    url            : 'localhost:50001',
    prefix         : 'RPC'
});

const { RPC_Hi } = client;

const response = await RPC_Hi({msg: 'Hey Bot!'})
```

## ES-Lint
> npm run lint

## Babel
> npm run build  

## Mocha & Chai (Testing)
> npm run test

## Coverage Report
> npm run coverage

## Contributions
Any PR is always welcome, just make sure that your test cases would cover your new features