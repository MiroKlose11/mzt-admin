<!--
 * 基于 wangEditor-next 的富文本编辑器组件二次封装
 * 版权所有 © 2021-present 有来开源组织
 *
 * 开源协议：https://opensource.org/licenses/MIT
 * 项目地址：https://gitee.com/youlaiorg/vue3-element-admin
 *
 * 在使用时，请保留此注释，感谢您对开源的支持！
 -->

<template>
  <div style="z-index: 999; border: 1px solid #ccc">
    <!-- 工具栏 -->
    <Toolbar
      :editor="editorRef"
      mode="simple"
      :default-config="toolbarConfig"
      style="border-bottom: 1px solid #ccc"
    />
    <!-- 编辑器 -->
    <Editor
      v-model="modelValue"
      :style="{ height: height, overflowY: 'hidden' }"
      :default-config="editorConfig"
      mode="simple"
      @on-created="handleCreated"
    />
  </div>
</template>

<script setup lang="ts">
import "@wangeditor-next/editor/dist/css/style.css";
import { Toolbar, Editor } from "@wangeditor-next/editor-for-vue";
import { IToolbarConfig, IEditorConfig } from "@wangeditor-next/editor";

// 文件上传 API
import FileAPI from "@/api/file.api";

// 上传图片回调函数类型
type InsertFnType = (_url: string, _alt: string, _href: string) => void;

defineProps({
  height: {
    type: String,
    default: "500px",
  },
});
// 双向绑定
const modelValue = defineModel("modelValue", {
  type: String,
  required: false,
});

// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef();

// 工具栏配置
const toolbarConfig = ref<Partial<IToolbarConfig>>({});

// 编辑器配置
const editorConfig = ref<Partial<IEditorConfig>>({
  placeholder: "请输入内容...",
  // 添加粘贴事件过滤处理
  customPaste: (editor: any, e: ClipboardEvent) => {
    // 获取粘贴的文本内容
    const text = e.clipboardData?.getData("text/plain") || "";

    // 如果粘贴内容过长或包含复杂HTML结构，可能导致栈溢出
    if (text.length > 50000) {
      // 只截取一部分文本，避免过长内容导致栈溢出
      const clippedText = text.substring(0, 50000) + "...(内容过长，已截断)";
      // 使用文本方式插入，而不是HTML方式
      editor.insertText(clippedText);
      // 阻止默认粘贴行为
      return false;
    }

    // 允许默认粘贴行为
    return true;
  },
  MENU_CONF: {
    uploadImage: {
      customUpload(file: File, insertFn: InsertFnType) {
        // 上传图片
        FileAPI.uploadFile(file).then((res) => {
          // 插入图片
          insertFn(res.url, res.name, res.url);
        });
      },
    } as any,
  },
});

// 记录 editor 实例，重要！
const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>
