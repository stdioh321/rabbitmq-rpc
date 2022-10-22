var Amqp = require('./Amqp');
const queueName = 'my-queue'

Amqp.connect()
  .then(conn => {
    Amqp.createChannel(conn).then(ch => {
      const eventQueue = Amqp.consumeFromExchangeQueue(ch, queueName)
      eventQueue.on('message', queueOnMessage.bind(queueOnMessage, ch))
    })
  })



function queueOnMessage(ch, message){
    const { content } = message
    const payload = JSON.parse(content.toString())
    console.log({payload})
    ch.ack(message)
}