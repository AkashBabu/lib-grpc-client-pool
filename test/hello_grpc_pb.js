// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var hello_pb = require('./hello_pb.js');

function serialize_Hello_Reply(arg) {
  if (!(arg instanceof hello_pb.Reply)) {
    throw new Error('Expected argument of type Hello.Reply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Hello_Reply(buffer_arg) {
  return hello_pb.Reply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Hello_Request(arg) {
  if (!(arg instanceof hello_pb.Request)) {
    throw new Error('Expected argument of type Hello.Request');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Hello_Request(buffer_arg) {
  return hello_pb.Request.deserializeBinary(new Uint8Array(buffer_arg));
}


var GreetingService = exports.GreetingService = {
  notAvailable: {
    path: '/Hello.Greeting/NotAvailable',
    requestStream: false,
    responseStream: false,
    requestType: hello_pb.Request,
    responseType: hello_pb.Reply,
    requestSerialize: serialize_Hello_Request,
    requestDeserialize: deserialize_Hello_Request,
    responseSerialize: serialize_Hello_Reply,
    responseDeserialize: deserialize_Hello_Reply,
  },
  _Hi: {
    path: '/Hello.Greeting/_Hi',
    requestStream: false,
    responseStream: false,
    requestType: hello_pb.Request,
    responseType: hello_pb.Reply,
    requestSerialize: serialize_Hello_Request,
    requestDeserialize: deserialize_Hello_Request,
    responseSerialize: serialize_Hello_Reply,
    responseDeserialize: deserialize_Hello_Reply,
  },
  _ReadStream: {
    path: '/Hello.Greeting/_ReadStream',
    requestStream: false,
    responseStream: true,
    requestType: hello_pb.Request,
    responseType: hello_pb.Reply,
    requestSerialize: serialize_Hello_Request,
    requestDeserialize: deserialize_Hello_Request,
    responseSerialize: serialize_Hello_Reply,
    responseDeserialize: deserialize_Hello_Reply,
  },
  _WriteStream: {
    path: '/Hello.Greeting/_WriteStream',
    requestStream: true,
    responseStream: false,
    requestType: hello_pb.Request,
    responseType: hello_pb.Reply,
    requestSerialize: serialize_Hello_Request,
    requestDeserialize: deserialize_Hello_Request,
    responseSerialize: serialize_Hello_Reply,
    responseDeserialize: deserialize_Hello_Reply,
  },
  _BothStream: {
    path: '/Hello.Greeting/_BothStream',
    requestStream: true,
    responseStream: true,
    requestType: hello_pb.Request,
    responseType: hello_pb.Reply,
    requestSerialize: serialize_Hello_Request,
    requestDeserialize: deserialize_Hello_Request,
    responseSerialize: serialize_Hello_Reply,
    responseDeserialize: deserialize_Hello_Reply,
  },
};

exports.GreetingClient = grpc.makeGenericClientConstructor(GreetingService);
