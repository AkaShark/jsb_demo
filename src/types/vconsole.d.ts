import 'vconsole';

// 扩展 VConsoleOptions 接口
declare module 'vconsole' {
  interface VConsoleOptions {
    // 添加可能缺失的属性
    theme?: 'dark' | 'light';
    target?: HTMLElement;
    defaultPlugins?: string[];
  }
} 