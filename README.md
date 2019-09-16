# grpc-pool [![Build Status](https://travis-ci.com/AkashBabu/lib-grpc-client-pool.svg?branch=master)](https://travis-ci.com/AkashBabu/lib-grpc-client-pool) [![Maintainability](https://api.codeclimate.com/v1/badges/099d46a7375d95caa3c6/maintainability)](https://codeclimate.com/github/AkashBabu/lib-grpc-client-pool/maintainability)
A light-weight efficient implementation for gRPC connection pool.   
For detailed documentation please visit this [wiki](https://github.com/AkashBabu/lib-grpc-client-pool/wiki)

## What's new in 1.4.0 ?
* Support for statically generated code(protobuf) files

# Example
### Naming Rules in Proto Files
Names of the RPC function must Match /^_[A-Z]/, meaning it must start with an `_` followed by an Upper-Case letter  
Sample `.proto` file:
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

```js
const PROTO_FILE_PATH = path.join(__dirname, 'hello_grpc_pb');
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

### Usage with statically generated code (protobuf)
**Note: You must use the same naming convention mentioned for the above protobuf file**
```JS
const PROTO_FILE_PATH = path.join(__dirname, 'hello_grpc_pb');
const client = new GRPCClient(PROTO_FILE_PATH, {
    maxConnections : 2,
    rpcPrefix      : 'RPC',
    serviceName    : 'Greeting',
    url            : 'localhost:50001',
    staticFile     : true,
});

const { RPC_Hi } = client;

const request = new messages.Request();
request.setMsg('Hi');

const res = await RPC_Hi(request);
expect(res.getResp()).to.be.eql('Hello');
```
Notice the usage of `staticFile` flag. Also notice that packageName is not needed when static file is being used.

## Installation
> npm i lib -S

## ES-Lint
> npm run lint

## Babel
> npm run build  

## Mocha & Chai (Testing)
> npm test

## Coverage Report
> npm run coverage

## Contributions
This is open-source, which makes it obvious for any PRs, but I would request you to add necessary test-cases for the same 
