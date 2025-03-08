export class WebViewJavascriptBridge {

    private messagingIframe: any;
    private sendMessageQueue: any = [];
    private receiveMessageQueue: any = [];
    private messageHandlers: any = {};

    private CUSTOM_PROTOCOL_SCHEME: string = 'yy';
    private QUEUE_HAS_MESSAGE: string = '__QUEUE_MESSAGE__/';

    private responseCallbacks: any = {};
    private constRespCallbacks: any = {};
    private uniqueId: number = 1;
    private WebViewJavascriptBridge: any = {};

    // 创建队列iframe
    private _createQueueReadyIframe(doc: Document) {
        const wopayId = document.getElementById('wopayId');
        if (wopayId) {
            return;
        }
        this.messagingIframe = doc.createElement('iframe');
        this.messagingIframe.id = "wopayId";
        this.messagingIframe.style.display = 'none';
        doc.documentElement.appendChild(this.messagingIframe);
    }

    //set default messageHandler  初始化默认的消息线程
    public init(messageHandler: any) {
        if (this.WebViewJavascriptBridge._messageHandler) {
            throw new Error('WebViewJavascriptBridge.init called twice');
        }
        this.WebViewJavascriptBridge._messageHandler = messageHandler;
        const receivedMessages = this.receiveMessageQueue;
        this.receiveMessageQueue = [];
        for (var i = 0; i < receivedMessages.length; i++) {
            this._dispatchMessageFromNative(receivedMessages[i]);
        }
    }

    // 发送
    public send(data: any, responseCallback: any) {
        this._doSend({
            data: data
        }, responseCallback);
    }

    // 注册线程 往数组里面添加值
    public registerHandler(handlerName: string, handler: any) {
        this.messageHandlers[handlerName] = handler;
    }


    // 调用线程
    public callHandler(handlerName: any, data: any, responseCallback: any, isConst: boolean) {
        this._doSend({
            handlerName: handlerName,
            data: data
        }, responseCallback, isConst);
    }

    //sendMessage add message, 触发native处理 sendMessage
    private _doSend(message: any, responseCallback?: any, isConst?: boolean) {
        if (responseCallback) {
            const callbackId = 'cb_' + (this.uniqueId++) + '_' + new Date().getTime();
            if (isConst) {
                this.constRespCallbacks[callbackId] = responseCallback;
            } else {
                this.responseCallbacks[callbackId] = responseCallback;
            }
            message.callbackId = callbackId;
        }
        this.sendMessageQueue.push(message);
        this.messagingIframe.src = this.CUSTOM_PROTOCOL_SCHEME + '://' + this.QUEUE_HAS_MESSAGE;
    }

    // 提供给native调用,该函数作用:获取sendMessageQueue返回给native,由于android不能直接获取返回的内容,所以使用url shouldOverrideUrlLoading 的方式返回内容
    public _fetchQueue() {
        var messageQueueString = JSON.stringify(this.sendMessageQueue);
        this.sendMessageQueue = [];
        //android can't read directly the return data, so we can reload iframe src to communicate with java
        this.messagingIframe.src = this.CUSTOM_PROTOCOL_SCHEME + '://return/_fetchQueue/' + encodeURIComponent(messageQueueString);
    }

    //提供给native使用,
    private _dispatchMessageFromNative(messageJSON: string) {
        setTimeout(() => {
            const message = JSON.parse(messageJSON);
            let responseCallback;
            //java call finished, now need to call js callback function
            if (message.responseId) {
                responseCallback = this.responseCallbacks[message.responseId];
                if (!responseCallback) {
                    responseCallback = this.constRespCallbacks[message.responseId];
                    if (responseCallback) {
                        responseCallback(message.responseData);
                    }
                    return;
                }
                responseCallback(message.responseData);
                delete this.responseCallbacks[message.responseId];
            } else {
                //直接发送
                if (message.callbackId) {
                    const callbackResponseId = message.callbackId;
                    responseCallback = (responseData: any) => {
                        this._doSend({
                            responseId: callbackResponseId,
                            responseData: responseData
                        });
                    };
                }

                let handler = this.WebViewJavascriptBridge._messageHandler;
                if (message.handlerName) {
                    handler = this.messageHandlers[message.handlerName];
                }
                //查找指定handler
                try {
                    handler(message.data, responseCallback);
                } catch (exception) {
                    if (typeof console != 'undefined') {
                        console.log("WebViewJavascriptBridge: WARNING: javascript handler threw.", message, exception);
                    }
                }
            }
        });
    }

    //提供给native调用,receiveMessageQueue 在会在页面加载完后赋值为null,所以
    public _handleMessageFromNative(messageJSON: string) {
        console.log('handle message: ' + messageJSON);
        if (this.receiveMessageQueue) {
            this.receiveMessageQueue.push(messageJSON);
        }
        this._dispatchMessageFromNative(messageJSON);
    }

    public initHandler(webViewJavascriptBridge: WebViewJavascriptBridge) {
        (window as any).WebViewJavascriptBridge = webViewJavascriptBridge;
        const doc = document;
        this._createQueueReadyIframe(doc);
        let readyEvent: any = doc.createEvent('Events');
        readyEvent.initEvent('WebViewJavascriptBridgeReady');
        readyEvent.bridge = webViewJavascriptBridge;
        doc.dispatchEvent(readyEvent);
    }
}