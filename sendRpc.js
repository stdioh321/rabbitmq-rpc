const amqp = require('amqplib/callback_api');
const { v4: uuid } = require('uuid');

const id = process.argv.slice(2);

if(!id || id?.length < 1) return process.exit(1)

amqp.connect('amqp://localhost:5672', (err, conn) => {

    conn.createChannel((err, ch) => {
        ch.assertQueue('', { exclusive: true }, (err, q) => {

            const corr = uuid();
            console.log(` [x] Requesting user ${id}`);

           
            ch.sendToQueue('rpc_queue',
                Buffer.from(id.toString()),
                { correlationId: corr, replyTo: q.queue });

            ch.consume(q.queue, (msg) => {
                if (msg.properties.correlationId === corr) {
                    console.log(` [.] Got ${msg.content.toString()}`);
                    setTimeout(function () { conn.close(); process.exit(0) }, 500);
                }
                console.log("consuming.....");
            }, { noAck: true });


        });
    });


})