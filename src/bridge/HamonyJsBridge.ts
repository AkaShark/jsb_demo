export class HarmonyJsBridge {

  public send2Harmony(method: string, message: any, responseCallback: any) {
    (window as any).wopay_invoke[method](message,(callbackJson:any)=> {
      responseCallback(callbackJson);
    });
  }

}
