import { WoPay } from '../bridge/WoPay'

declare global {
    interface Window {
        WoPay: WoPay;
    }
}

export {};