var Amqp = require('./Amqp');
const queueName = 'temp-queue'
const exchangeName = 'temp-exchange'
const routingKey = ''

Amqp.connect()
  .then(conn => {
    Amqp.createChannel(conn)
    .then(async (ch) => {
      
       for await (const it of [...new Array(20).keys()] ){
        const routingKey = `${Amqp.exampleRoutingKey}_${it % 2 == 0 ? 1 : 2}` 
        const payload = `${Math.round(Math.random() * 100000)}`;
        await Amqp.sendToExchangeQueue(Amqp.exampleExchange, routingKey, ch, payload)
        console.log({routingKey},'payload sent:', { payload});
      
      }

      setTimeout(function() {
        conn.close()
        process.exit(0);
      }, 500);
    })
  })