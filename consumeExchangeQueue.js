var Amqp = require('./Amqp');
const queueName = 'temp-queue'
const exchangeName = 'temp-exchange'

const arg1 = process.argv[2] || '1'

Amqp.connect()
  .then(conn => {
    Amqp.createChannel(conn).then(ch => {
      const routingKey = `${Amqp.exampleRoutingKey}_${arg1}`
      const eventQueue = Amqp.consumeFromExchangeQueue(ch, Amqp.exampleExchange, routingKey)
      eventQueue.on('message', queueOnMessage.bind(queueOnMessage, ch, routingKey))
    })
  })



function queueOnMessage(ch, routinKey, message){
    const { content } = message
    const payload = JSON.parse(content.toString())
    console.log({ routinKey, payload})
    ch.ack(message)
}