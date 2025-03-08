
export class FlutterJsBridge {

    private responseCallBacks: any = {}; 

    public send2Flutter (message: any,responseCallback: any){
        // 如果调用flutter 方法时需要回调，为了保证请求和回复一致，需添加callbackId
        if (responseCallback) {
            const callBackId = 'unicom_' + this.guid();
            this.responseCallBacks[callBackId] = responseCallback;
            message.callbackId = callBackId;
        }
       (window as any).UnicomPayment.postMessage(JSON.stringify(message));
    }


     //提供给native使用,
     public handleMessageFromFlutterCallback(messageJSON: string) {
        const message = JSON.parse(messageJSON);
        let responseCallback;
        if (message.responseId) {
            responseCallback = this.responseCallBacks[message.responseId];
            if (responseCallback) {
                responseCallback(message.responseData);
            }
            delete this.responseCallBacks[message.responseId];
        }
    }

    /**
     * 生成一个唯一的标识id
     * @returns uuid 唯一id
     */
    private guid(): string {
        return  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx' .replace(/[xy]/g,  function (c) {
            var  r = Math.random()*16|0, v = c ==  'x'  ? r : (r&0x3|0x8);
            return  v.toString(16);
        });
   }
}

