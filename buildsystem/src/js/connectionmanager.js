var amqp = require('amqplib/callback_api');

if(!global.mq){
    global.mq = {
        connection: {
            default:null
        },
        channel:{
          default:null
        },
        channelConnectionMap:{},
        responseCallback:{},
        apiInterface:{}
    };
}

export default class Connection{
    static get(connectionName) {
        return Connection.connect(connectionName);
    }

    static connect(connectionName){
        if(!connectionName)
             connectionName = "default";

        return new Promise((resolve,reject)=>{
            if(global.mq.connection[connectionName]){
                resolve(global.mq.connection[connectionName]);  
            }else{
                amqp.connect('amqp://localhost', function (err, conn) {
                    if(conn){
                        global.mq.connection[connectionName] = conn;
                        resolve(global.mq.connection[connectionName]);  
                    }else
                        reject("Failed to connect!\nErr: " + err);  
                });
            }
        });
    }
}