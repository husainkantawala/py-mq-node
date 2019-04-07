import ChannelManager from "./channelmanager";

export default class Api{

    static loadInterface(callback){
        Api.fetchApiList();
        if(!Api.isInterfaceLoaded){
            Api.onInterfaceLoaded = callback; 
        }
    }

    static get(){
        return global.mq.apiInterface;
    }

    static fetchApiList(){
        var req = Api.createRequest("getApis",null);
        Api.execute(req).then((resp)=>{
            if(resp){
                console.log(resp);
                resp = JSON.parse(resp);
                var keys = resp;
                var len = keys.length;
                for(var i =0;i <len;i++){
                    var key= keys[i];
                    global.mq.apiInterface[key]= Api.createInterfaceFunction(key);
                }
               
                if(len>0){
                    Api.onInterfaceLoaded();
                }
            }
        })
        .catch((e)=>{
            console.log(e);
        });
    }

    static createInterfaceFunction(key){
        return function(){
            var request = Api.createRequest(key,arguments);
            return Api.execute(request);
        };
    }

    static execute(req){
        return new Promise((resolve,reject)=>{
            ChannelManager.get().then((channel)=>{
                var requestQueue="request";
                global.mq.responseCallback[req.correlationId] = resolve;   
                channel.sendToQueue(requestQueue,Buffer.from(JSON.stringify(req),'utf-8'));
            })
            .catch((err)=>{
                console.log("Err in execute requeest!!")
                reject(err);
            });
        });
    }

    static parseArgs(args){
        var params = new Array(args.length);
        for(var i = 0; i < args.length; ++i) {
            params[i] = args[i];
        }
        
        return params;
    }

    static createRequest(method,args){
        var responseQueue="response";
        var params;
        if(method){
            if(!args){
                params = []; 
            }else{
                params = Api.parseArgs(args);
            }

            var req = {
                method,
                params,
                correlationId: Api.generateUuid(),
                replyTo: responseQueue
            }

            return req;
        }

        return null;
    }

    static generateUuid() {
        return Math.random().toString() +
               Math.random().toString() +
               Math.random().toString();
    }


}