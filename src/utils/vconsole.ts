import VConsole from 'vconsole';

// 创建 vConsole 实例
const vConsole = new VConsole({
  theme: 'light', // 主题色
  defaultPlugins: ['system', 'network', 'element', 'storage'], // 默认插件
  maxLogNumber: 1000, // 最大日志数量
  onReady: () => {
    console.log('vConsole is ready.');
  },
  // 设置初始位置
  target: document.body
});

// 手动设置位置
setTimeout(() => {
  const vcBtn = document.querySelector('.vc-switch') as HTMLElement;
  if (vcBtn) {
    vcBtn.style.right = '10px';
    vcBtn.style.bottom = '10px';
  }
}, 500);

// 添加一些初始日志
console.log('JSB Demo 已启动');
console.log('当前环境：', import.meta.env.MODE);
console.log('User Agent:', navigator.userAgent);

export default vConsole; 