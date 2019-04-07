import Connection from './connectionManager';

var amqp = require('amqplib/callback_api');

export default class ChannelManager {
    static get() {
        return ChannelManager.createChannel(null, null);
    }

    static getByChannelName(channelName) {
        return ChannelManager.createChannel(null, channelName);
    }

    static getByName(connectionName, channelName) {
        return ChannelManager.createChannel(connectionName, channelName);
    }

    static createChannel(connectionName, channelName) {
        if (!channelName)
            channelName = "default";

        return new Promise((resolve,reject) => {
            Connection.get(connectionName).then((conn) => {
                    try {
                        conn.createChannel((err, ch) => {
                            try {
                                if (ch) {

                                    global.mq.channel[channelName] = ch;
                                    global.mq.channelConnectionMap[channelName] = conn;
                                    var requestQueue = 'request';
                                    var responseQueue = 'response';
                                    ch.assertQueue(requestQueue,{durable: false});
                                    ch.assertQueue(responseQueue, {
                                        durable: false
                                    });
                                    ch.consume(responseQueue, function (msg) {
                                        console.log("response received :" + msg.content.toString());
                                        if (global.mq.responseCallback[msg.properties.correlationId] &&
                                            typeof (global.mq.responseCallback[msg.properties.correlationId]) == 'function') {

                                            var callback = global.mq.responseCallback[msg.properties.correlationId];
                                            try {
                                                callback(msg.content.toString());
                                                delete global.mq.responseCallback[msg.properties.correlationId];
                                            } catch (e) {
                                                console.log("Response callback invocation failed!");
                                                delete global.mq.responseCallback[msg.properties.correlationId];
                                            }
                                        }
                                    }, {
                                        noAck: true
                                    });

                                    resolve(global.mq.channel[channelName]);
                                } else {
                                    reject("Failed to create channel! \nErr : " + err);
                                }
                            } catch (e1) {
                                reject("Failed to create channel! \nErr : " + e1);
                            }
                        });
                    } catch (e) {
                        console.log("Exception in createChannel");
                    }
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}