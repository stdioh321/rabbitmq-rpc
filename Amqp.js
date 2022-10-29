var Emitter = require('events');
var amqp = require('amqplib/callback_api');

module.exports = class Amqp {
  connection = null
  channel = null
  static async connect(url = 'amqp://localhost'){
    return new Promise((resolve, reject) => {
      if(Amqp.connection) return resolve(Amqp.connection)
      amqp.connect(url, function(error1, conn){
        if(error1) return reject(error1)
        Amqp.connection = conn
        return resolve(Amqp.connection)
      })
    })
  }

  static async createChannel(conn){
    return new Promise((resolve, reject) => {
      conn.createChannel((error1, ch) => {
        if(error1) return reject(error1)
        Amqp.channel = ch;
        return resolve(Amqp.channel)
      })
    })
  }

  static consumeFromQueue(ch, queue){
    const event = new Emitter()
    ch.assertQueue(queue, { durable: true })
    ch.consume(queue, function(msg){
      event.emit('message', msg)
    },{
      noAck: false
    })
    return event
  }
  
  static consumeFromExchangeQueue(ch, exchange = '', routingKey = ''){
    const event = new Emitter()
    const queueName = [exchange,routingKey].filter(it=>it).join('-')
    ch.prefetch(2)
    ch.assertExchange(exchange, 'direct', { durable: true })
    ch.assertQueue(queueName, {exclusive: false}, function(error1, q){
      console.log({q});
      ch.bindQueue(q.queue, exchange, queueName)
      ch.consume(q.queue, (msg)=>{
        event.emit('message', msg)
      },{
        noAck: false
      })
    })
    return event
  }

  static sendToExchangeQueue(exchange = '', routingKey = '', ch, content = ''){
    return new Promise((resolve, reject) => {
      ch.assertExchange(exchange, 'direct', { durable: true })
    const routingKeyName = [exchange, routingKey].filter(it=>it).join('-')
    ch.publish(exchange, routingKeyName, Buffer.from(content),{
      persistent: true,
    });
    return resolve();
    })
  }
  static sendToQueue(queue = '',ch, content = ''){
    return new Promise((resolve, reject) => {
      ch.assertQueue(queue, { durable: true })
      ch.sendToQueue(queue, Buffer.from(content))
      
    return resolve();
    })
  }
}

module.exports.exampleQueue = 'temp-queue'
module.exports.exampleExchange = 'temp-exchange'
module.exports.exampleRoutingKey = 'temp_routing_key'