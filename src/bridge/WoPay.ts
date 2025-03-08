import { FlutterJsBridge } from "./FlutterJsBridge";
import { HarmonyJsBridge } from "./HamonyJsBridge";
import { WebViewJavascriptBridge } from "./WebViewJavascriptBridge";

export class WoPay {
  /**
   * 客户端现有的方法
   */
  private nativeMethods = [
    //登录
    "login",
    //苹果支付
    "doApplePay",
    //京东活体
    "jdMotionLiveness",
    //商汤活体
    "motionLiveness",
    //获取rptId
    "exRpt",
    //获取客户端基础信息
    "getBaseInfo",
    //发送短信
    "sendSMS",
    //获取定位信息
    "getLocation",
    //获取OCR信息
    "OCR",
    //保存二维码
    "merchantQR",
    //拉起客户端功能模块
    "module",
    //扫码获取信息
    "smartDetect",
    //用户反馈
    "feedback",
    //数字证书
    "digitalSignature",
    //指纹支付
    "fingerPrintAuth",
    //打开新页面
    "newPage",
    //是否安装QQ
    "isQQInstall",
    //获取用户信息
    "interact",
    //刷新页面
    "refresh",
    //返回钱包页
    "rollback",
    //返回上一页
    "dismiss",
    //拉起相机
    "camera",
    //拉起相册
    "photos",
    //获取联系人
    "contacts",
    //拉起实名页面
    "realNameAuth",
    //拉起绑卡页面
    "bindCard",
    //拉起分享页面
    "share",
    "notifyEvents",
    "backredirect",
    //刷新用户实名信息
    "refreshUserInfo",
    //获取设备ID
    "getDeviceInfo",
    // ---token钱包相关 开始
    "getTokenWalletContextId",
    "initToken",
    "appletTokenOpen",
    "openChannel",
    "executeApdu",
    "executeApduList",
    "closeChannel",
    "checkAppInstalled",
    // ---token钱包相关 结束
    "fetchPhoneNumByNet",
    "openMarkCamera",
    "readIDCUsingNFC",
    "fetchAppMode"
  ];

  private callbackPromise: any;

  private flutterBridge?: FlutterJsBridge;

  private harmonyBridge?: HarmonyJsBridge;

  /**
   * 版本比对
   * @param currVer
   * @param promoteVer
   * @returns
   */
  private versionCompare(currVer: string, promoteVer: string) {
    currVer = currVer || "0.0.0";
    promoteVer = promoteVer || "0.0.0";
    if (currVer === promoteVer) return false;
    const currVerArr = currVer.split(".");
    const promoteVerArr = promoteVer.split(".");
    const len = Math.max(currVerArr.length, promoteVerArr.length);
    for (let i = 0; i < len; i++) {
      const proVal = promoteVerArr[i],
        curVal = currVerArr[i];
      if (proVal < curVal) {
        return false;
      } else if (proVal > curVal) {
        return true;
      }
    }
    return false;
  }

  /**
   * 当前客户端是否支持
   * @returns
   */
  public isClientSupport(): boolean {
    const clientVersion = this.getClientVersion();
    const isSupport = this.versionCompare("3.9.0", clientVersion);
    if (!isSupport) {
      console.log("当前客户端版本过低，请使用沃钱包3.9.0及其以后的版本");
    }
    return isSupport;
  }

  /**
   * 获取客户端当前版本
   * @returns
   */
  public getClientVersion(): string {
    const ua = navigator.userAgent;
    const wopayTag: string = "wopaywallet/";
    const wopayIndex = ua.indexOf(wopayTag);
    let clientVersion = "0.0.0";
    if (wopayIndex > -1) {
      clientVersion = ua.substr(wopayIndex + wopayTag.length, 5);
    }
    return clientVersion;
  }

  /**
   * 判断客户端webview是否是flutter 环境
   * @returns
   */
  public isFlutterWebview(): boolean {
    const ua = navigator.userAgent;
    if (ua.indexOf("flutter") > -1 && "UnicomPayment" in window) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 判断设备类型
   * @returns
   */
  public deviceType() {
    const ua = navigator.userAgent;
    const isAndroid = /(android)/i.test(ua);
    const isIphone = /(iPhone|iPad|iPod)/i.test(ua);
    const isHarmony = /ArkWeb|OpenHarmony|HarmonyOS/.test(ua);
    if (isAndroid) {
      return DeviceType.ANDROID;
    } else if (isIphone) {
      return DeviceType.IOS;
    } else if (isHarmony) {
      return DeviceType.Harmony;
    } else {
      return DeviceType.UNKNOW;
    }
  }

  public init() {
    // 如果当前环境不为客户端或者为客户端不支持版本直接返回
    // if (!this.isClientSupport()) {
    //     return;
    // }
    if (this.isFlutterWebview()) {
      this.registerFlutterMethods();
      // 方式bridge重复 其实可以写成单例，之后优化 //todo
      // UnicomPaymentFlutterBridge 挂在window 上是为了让flutter 直接可以调用到
      if (!("UnicomPaymentFlutterBridge" in window)) {
        this.flutterBridge = (window as any).UnicomPaymentFlutterBridge =
          new FlutterJsBridge();
      }
    } else {
      if (this.deviceType() === DeviceType.Harmony) {
        this.registerHarmonyMethods();
        if (!("HamonyJsBridge" in window)) {
          this.harmonyBridge = (window as any).HamonyJsBridge =
            new HarmonyJsBridge();
        }
      } else {
        this.registerNativeMethods();
        if (this.deviceType() === DeviceType.ANDROID) {
          const wopayId = document.getElementById("wopayId");
          if ((window as any).WebViewJavascriptBridge && wopayId) {
            return;
          }
          const jsBridge = new WebViewJavascriptBridge();
          jsBridge.initHandler(jsBridge);
        }
      }
    }
  }

  private wpWebJavasriptBridge(callback: any) {
    if (this.deviceType() === DeviceType.IOS) {
      if ((window as any).WebViewJavascriptBridge) {
        return callback((window as any).WebViewJavascriptBridge);
      }
      if ((window as any).WVJBCallbacks) {
        return (window as any).WVJBCallbacks.push(callback);
      }
      (window as any).WVJBCallbacks = [callback];
      var WVJBIframe = document.createElement("iframe");
      WVJBIframe.style.display = "none";
      WVJBIframe.src = "https://__bridge_loaded__";
      document.documentElement.appendChild(WVJBIframe);
      setTimeout(function () {
        document.documentElement.removeChild(WVJBIframe);
      }, 0);
    } else {
      if ((window as any).WebViewJavascriptBridge) {
        return callback((window as any).WebViewJavascriptBridge);
      }
    }
  }

  /**
   * 注册原生bridge方法
   */
  private registerNativeMethods() {
    this.nativeMethods.forEach((method) => {
      (WoPay as any).prototype[method] = this.nativeTemplateFunction(method);
    });
  }

  /**
   * 注册flutter bridge方法
   */
  private registerFlutterMethods() {
    this.nativeMethods.forEach((method) => {
      (WoPay as any).prototype[method] = this.flutterTemplateFunction(method);
    });
  }

  /**
   * 注册鸿蒙bridge方法
   */
  private registerHarmonyMethods() {
    this.nativeMethods.forEach((method) => {
      (WoPay as any).prototype[method] = this.harmonyTemplateFunction(method);
    });
  }

  // todo 预留
  public registerNativeMethod(methodName: string) {
    (WoPay as any).prototype[methodName] =
      this.nativeTemplateFunction(methodName);
  }

  /**
   * Flutter模板方法
   * @param method
   * @returns
   */
  private flutterTemplateFunction(method: string) {
    return (params: any) => {
      params = params ?? {};
      params.method = method;
      return new Promise((resolve, reject) => {
        try {
          this.flutterBridge?.send2Flutter(params, (result: any) => {
            if (result.result || result.resultCode) {
              if (
                result.resultCode == ErrorCode.SUCCESS ||
                result.result == ErrorCode.SUCCESS
              ) {
                if (params.success) {
                  params.success(result);
                }
                resolve(result);
              } else {
                if (params.failed) {
                  params.failed(result);
                }
                reject(result);
              }
            } else {
              //如果客户端不返回resultCode 与 result直接无需判断返回结果
              if (params.success) {
                params.success(result);
              }
              resolve(result);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    };
  }

  /**
   * 鸿蒙模板方法
   * @param method
   * @returns
   */
  private harmonyTemplateFunction(method: string) {
    return (params: any) => {
      params = params ?? {};
      return new Promise((resolve, reject) => {
        try {
          this.harmonyBridge?.send2Harmony(method, params, (result: any) => {
            if (result.result || result.resultCode) {
              let resultParams = result.params;
              if (
                result.resultCode == ErrorCode.SUCCESS ||
                result.result == ErrorCode.SUCCESS
              ) {
                if (params.success) {
                  if (resultParams) {
                    resultParams["resultCode"] = ErrorCode.SUCCESS;
                  }
                  params.success(resultParams);
                }
                resolve(resultParams);
              } else {
                if (params.failed) {
                  if (resultParams) {
                    resultParams["resultCode"] = ErrorCode.FAILED;
                  }
                  params.failed(resultParams);
                }
                reject(resultParams);
              }
            } else {
              //如果客户端不返回resultCode 与 result直接无需判断返回结果
              if (params.success) {
                params.success(result);
              }
              resolve(result.params);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    };
  }

  /**
   * Native模板方法
   * @param method
   * @returns
   */
  private nativeTemplateFunction(method: string) {
    return (params: any) => {
      if (!this.isClientSupport()) {
        console.log("当前客户端版本过低，请使用沃钱包3.9.0及其以后的版本");
        return;
      }
      params = params ?? {};
      params.method = method;
      return new Promise((resolve, reject) => {
        try {
          const callBack = (bridge: any) => {
            bridge.callHandler("wopay_invoke", params, (res: any) => {
              let result = res;
              if (this.deviceType() === DeviceType.ANDROID) {
                result = JSON.parse(res);
              }
              //客户端返回时结果有可能是 result或者 resultCode ,还有可以能不返回这个字段，兼容操作
              if (result.result || result.resultCode) {
                if (
                  result.resultCode == ErrorCode.SUCCESS ||
                  result.result == ErrorCode.SUCCESS
                ) {
                  if (params.success) {
                    params.success(result);
                  }
                  resolve(result);
                } else {
                  if (params.failed) {
                    params.failed(result);
                  }
                  reject(result);
                }
              } else {
                //如果客户端不返回resultCode 与 result直接无需判断返回结果
                if (params.success) {
                  params.success(result);
                }
                resolve(result);
              }
            });
          };
          this.wpWebJavasriptBridge(callBack);
        } catch (error) {
          reject(error);
        }
      });
    };
  }
}

export enum DeviceType {
  ANDROID,
  IOS,
  Harmony,
  UNKNOW,
}

export enum ErrorCode {
  SUCCESS = "1",
  FAILED = "0",
}
