var Amqp = require('./Amqp');
const queueName = 'my-queue'


Amqp.connect()
  .then(conn => {
    Amqp.createChannel(conn)
    .then(async (ch) => {
       const content = `${Math.round(Math.random() * 10000)}`
       await Amqp.sendToQueue(queueName, ch, content)

      setTimeout(function() {
        conn.close()
        process.exit(0);
      }, 500);
    })
  })