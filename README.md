# grpc-pool [![Build Status](https://travis-ci.com/AkashBabu/lib-grpc-client-pool.svg?branch=master)](https://travis-ci.com/AkashBabu/lib-grpc-client-pool) [![Maintainability](https://api.codeclimate.com/v1/badges/099d46a7375d95caa3c6/maintainability)](https://codeclimate.com/github/AkashBabu/lib-grpc-client-pool/maintainability)
A light-weight efficient implementation for gRPC connection pool.   
For Documentation please visit this [wiki](https://github.com/AkashBabu/lib-grpc-client-pool/wiki)

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
> npm test

## Coverage Report
> npm run coverage

## Contributions
Any PR is always welcome, just make sure that your test cases would cover your new features