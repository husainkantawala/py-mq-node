var amqp = require('amqplib/callback_api');

app.get('/dalembert', callD_alembert);

function callD_alembert3(req, res) {
  var input = [
    req.query.funds, // starting funds
    req.query.size, // (initial) wager size
    req.query.count, // wager count — number of wagers per sim
    req.query.sims // number of simulations
  ]

  amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
      var executor = 'executor';
      ch.assertQueue(simulations, { durable: false });
      var results = 'results';
      ch.assertQueue(results, { durable: false });
      ch.sendToQueue(simulations, new Buffer(JSON.stringify(input)));
      ch.consume(results, function (msg) {
        res.send(msg.content.toString())
      }, { noAck: true });
    });
    setTimeout(function () { conn.close(); }, 500); 
    });
}