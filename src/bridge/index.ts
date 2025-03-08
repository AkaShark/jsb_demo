import { WoPay } from './WoPay';
const wopay = new WoPay();
wopay.init();
(window as any).WoPay = wopay;
export default wopay;