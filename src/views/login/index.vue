<template>
  <div class="wh-full flex-center flex-col login">
    <!-- 右侧切换主题、语言按钮 -->
    <div class="flex flex-col gap-4px fixed top-40px right-40px text-lg">
      <el-tooltip :content="t('login.themeToggle')" placement="left">
        <CommonWrapper>
          <DarkModeSwitch />
        </CommonWrapper>
      </el-tooltip>
      <el-tooltip :content="t('login.languageToggle')" placement="left">
        <CommonWrapper>
          <LangSelect size="text-20px" />
        </CommonWrapper>
      </el-tooltip>
    </div>
    <!-- 登录页主体 -->
    <div flex-1 flex-center>
      <div
        class="p-4xl h-full w-full sm:w-450px border-rd-10px sm:h-680px shadow-[var(--el-box-shadow-light)] backdrop-blur-3px"
      >
        <div w-full flex flex-col items-center>
          <!-- logo -->
          <el-image :src="logo" style="width: 100px" class="mt-8 mb-4" />

          <!-- 标题 -->
          <h2 class="mb-8">
            <el-badge :value="`v ${defaultSettings.version}`" type="success">
              {{ defaultSettings.title }}
            </el-badge>
          </h2>

          <!-- 登录组件 -->
          <Login class="w-90%" />
        </div>
      </div>
      <!-- 登录页底部版权 -->
      <el-text size="small" class="py-2.5! fixed bottom-0 text-center">
        Copyright © 2025 - 2025 四川华西医美研究院 All Rights Reserved.
      </el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import logo from "@/assets/m-logo.svg";
import defaultSettings from "@/settings";
import CommonWrapper from "@/components/CommonWrapper/index.vue";
import DarkModeSwitch from "@/components/DarkModeSwitch/index.vue";
import Login from "./components/Login.vue";

const t = useI18n().t;
</script>

<style lang="scss" scoped>
.login {
  background: url("@/assets/images/login-bg.svg");
  background-size: cover;
}
</style>
