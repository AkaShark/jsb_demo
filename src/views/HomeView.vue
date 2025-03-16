<script setup lang="ts">
import { ref, onMounted } from 'vue';

type WoPayMethod = {
  fetchPhoneNumByNet: (params?: any) => Promise<any>;
  fetchAppMode: (params?: any) => Promise<any>;
  readIDCUsingNFC: (params?: any) => Promise<any>;
  openMarkCamera: (params?: any) => Promise<any>;
}

// 使用双重断言来解决类型转换问题
const wopay = (window.WoPay as unknown) as WoPayMethod;

// 添加响应式状态
const resultMessage = ref('');
const isError = ref(false);
const isLoading = ref(false);
const params = ref('');

// 组件挂载时输出日志
onMounted(() => {
  console.log('HomeView 组件已挂载');
  console.log('WoPay 对象:', wopay);
  console.group('可用方法');
  console.log('- fetchPhoneNumByNet');
  console.log('- fetchAppMode');
  console.log('- readIDCUsingNFC');
  console.log('- openMarkCamera');
  console.groupEnd();
});

const buttons = [
  { 
    label: '网络取号', 
    icon: '📱',
    onClick: async () => {
      try {
        isLoading.value = true;
        isError.value = false;
        resultMessage.value = '正在获取手机号...';
        console.log('开始获取手机号...');
        const result = await wopay.fetchPhoneNumByNet();
        console.log('网络取号结果：', result);
        resultMessage.value = `获取成功：${JSON.stringify(result)}`;
      } catch (error) {
        console.error('网络取号失败：', error);
        isError.value = true;
        resultMessage.value = `获取失败：${JSON.stringify(error)}`;
      } finally {
        isLoading.value = false;
      }
    },
    description: '通过网络获取手机号'
  },
  { 
    label: '应用模式', 
    icon: '⚙️',
    onClick: async () => {
      try {
        isLoading.value = true;
        isError.value = false;
        resultMessage.value = '正在获取应用模式...';
        console.log('开始获取应用模式...');
        const result = await wopay.fetchAppMode();
        console.log('应用模式结果：', result);
        resultMessage.value = `获取成功：${JSON.stringify(result)}`;
      } catch (error) {
        console.error('获取应用模式失败：', error);
        isError.value = true;
        resultMessage.value = `获取失败：${JSON.stringify(error)}`;
      } finally {
        isLoading.value = false;
      }
    },
    description: '获取当前应用模式'
  },
  { 
    label: 'NFC读卡', 
    icon: '📟',
    onClick: async () => {
      try {
        isLoading.value = true;
        isError.value = false;
        resultMessage.value = '正在读取NFC...';
        console.log('开始读取NFC...');
        const result = await wopay.readIDCUsingNFC();
        console.log('NFC读卡结果：', result);
        resultMessage.value = `读取成功：${JSON.stringify(result)}`;
      } catch (error) {
        console.error('NFC读卡失败：', error);
        isError.value = true;
        resultMessage.value = `读取失败：${JSON.stringify(error)}`;
      } finally {
        isLoading.value = false;
      }
    },
    description: '使用NFC读取身份信息'
  },
  { 
    label: '水印相机', 
    icon: '📸',
    onClick: async () => {
      try {
        isLoading.value = true;
        isError.value = false;
        resultMessage.value = '正在打开相机...';
        console.log('开始打开相机...');
        const result = await wopay.openMarkCamera(JSON.parse(params.value) ? JSON.parse(params.value) : JSON.parse('{"bizCode": "demo", "businessParams": "237dc147f6b7179cc0c53f34444d8bd7b72f3d409f23cb34439ee7fefc489f96d5a2dccadba7f10f094d997b936fb796b5c177ffb17677bbb9dbdbad96b4278520ff6b6c8ed9322e8a8dbef95e024300647f3e55de3e912246c936aeccebe46772e4e05f094ccdc44ad6c460b2290959ec81f4eec4db26bb06513e1c000fb78fe4b40168511844a959554e2db51edd8a13dd876e8af7ad58332c354400994ff038d39642b395c090e881b53ee99798e1902c8ebc9a7df61b6001b45c7d6934e265811d4cb86216fe9a2399f76a16aef70533489242d4f3ffd3379649199311777710cad66a4fc2e638c34024cca8e3007642fdc0e6627cdc9f297fc63de99bd9c1c3505e2fbd1a29bdd93f3bee6e977579c52b1cd3d9e99b6445a103da3a4388dc5c7a6d06f6ec95a501e3c357d09a72a3b594c36190764a3d4c3e12c445f64696e6c5d682a42e6909e8a46224c5fd51"}'));
        console.log('相机操作结果：', result);
        resultMessage.value = `操作成功：${JSON.stringify(result)}`;
      } catch (error) {
        console.error('相机操作失败：', error);
        isError.value = true;
        resultMessage.value = `操作失败：${JSON.stringify(error)}`;
      } finally {
        isLoading.value = false;
      }
    },
    description: '打开标记扫描相机'
  }
];
</script>

<template>
  <div class="min-h-screen bg-white py-4 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-xl font-bold text-gray-900 mb-4 text-center">JSB 功能演示</h1>
      
      <div class="grid grid-cols-1 gap-4">
        <div v-for="button in buttons" 
             :key="button.label"
             class="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200"
        >
          <button 
            @click="button.onClick"
            :disabled="isLoading"
            class="w-full py-3 px-4 flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="text-xl">{{ button.icon }}</span>
            <span class="font-medium text-gray-900">{{ button.label }}</span>
          </button>
        </div>

        <div class="mb-4">
          <label for="params" class="block text-sm font-medium text-gray-700 mb-1">参数值</label>
          <input 
            class="text-black"
            type="text" 
            id="params"
            v-model="params" 
            placeholder="请输入参数" 
          >
          <p class="mt-1 text-xs text-gray-500">输入的参数将在点击水印相机时传递给JSB</p>
        </div>

        <!-- 结果显示区域 -->
        <div v-if="resultMessage" 
             :class="[
               'mt-4 p-4 rounded-lg border',
               isError ? 'border-red-300 bg-red-50 text-red-700' : 'border-green-300 bg-green-50 text-green-700',
               isLoading ? 'animate-pulse' : ''
             ]"
        >
          <pre class="whitespace-pre-wrap break-words text-sm">{{ resultMessage }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>