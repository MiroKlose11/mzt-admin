import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import qs from "qs";
import { useUserStoreHook } from "@/store/modules/user.store";
import { ResultEnum } from "@/enums/api/result.enum";
import { getAccessToken } from "@/utils/auth";
import router from "@/router";

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
  paramsSerializer: (params) => qs.stringify(params),
});
// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    // 如果 Authorization 设置为 no-auth，则不携带 Token
    if (config.headers.Authorization !== "no-auth" && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果响应是二进制流，则直接返回，用于下载文件、Excel 导出等
    if (response.config.responseType === "blob") {
      return response;
    }

    console.log("[Request Interceptor] Response URL:", response.config.url);
    console.log("[Request Interceptor] Response Data:", response.data);

    const { code, data, msg } = response.data;

    // 特殊处理文件上传接口的成功响应
    // 尝试更灵活地匹配 URL，因为它可能包含 baseURL
    // 恢复：只有 "00000" 是 /file/upload 的成功码
    if (response.config.url?.endsWith("/file/upload") && code === "00000") {
      console.log("[Request Interceptor] Handled as /file/upload success with code:", code);
      return response.data; // 返回整个 { code, data, msg } 对象
    }

    if (code === ResultEnum.SUCCESS) {
      console.log("[Request Interceptor] Handled as ResultEnum.SUCCESS.");
      return data;
    }

    console.error(
      "[Request Interceptor] Unhandled success/error code:",
      code,
      "Expected SUCCESS:",
      ResultEnum.SUCCESS
    );
    ElMessage.error(msg || "系统出错");
    return Promise.reject(new Error(msg || "Error"));
  },
  async (error) => {
    console.error("request error", error); // for debug
    const { config, response } = error;

    // 处理HTTP状态码
    if (response) {
      // 检查是否有响应数据
      const responseData = response.data || {};
      const code = responseData.code;
      const msg = responseData.message || responseData.msg || "系统出错";

      // 处理令牌过期情况
      if (
        code === ResultEnum.ACCESS_TOKEN_INVALID ||
        code === ResultEnum.TOKEN_EXPIRED ||
        code === ResultEnum.INVALID_TOKEN
      ) {
        // Token 过期，刷新 Token
        return handleTokenRefresh(config);
      }
      // 处理刷新令牌过期情况
      else if (code === ResultEnum.REFRESH_TOKEN_INVALID) {
        // 刷新 Token 过期，跳转登录页
        await handleSessionExpired();
        return Promise.reject(new Error(msg));
      }
      // 处理未授权和禁止访问情况
      else if (
        code === ResultEnum.UNAUTHORIZED ||
        code === ResultEnum.FORBIDDEN ||
        code === ResultEnum.NO_PERMISSION ||
        response.status === 401 ||
        response.status === 403
      ) {
        // 如果有访问令牌，尝试刷新
        if (getAccessToken()) {
          return handleTokenRefresh(config);
        } else {
          await handleSessionExpired();
          return Promise.reject(new Error(msg));
        }
      } else {
        ElMessage.error(msg);
      }
    }
    return Promise.reject(error.message || "请求失败");
  }
);
export default service;
// 是否正在刷新标识，避免重复刷新
let isRefreshing = false;
// 因 Token 过期导致的请求等待队列
const waitingQueue: Array<() => void> = [];
// 刷新 Token 处理
async function handleTokenRefresh(config: InternalAxiosRequestConfig) {
  return new Promise((resolve) => {
    // 封装需要重试的请求
    const retryRequest = () => {
      config.headers.Authorization = `Bearer ${getAccessToken()}`;
      resolve(service(config));
    };
    waitingQueue.push(retryRequest);
    if (!isRefreshing) {
      isRefreshing = true;
      useUserStoreHook()
        .refreshToken()
        .then(() => {
          // 依次重试队列中所有请求, 重试后清空队列
          waitingQueue.forEach((callback) => callback());
          waitingQueue.length = 0;
        })
        .catch(async (error) => {
          console.error("handleTokenRefresh error", error);
          // 刷新 Token 失败，跳转登录页
          await handleSessionExpired();
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
  });
}
// 处理会话过期
async function handleSessionExpired() {
  ElNotification({
    title: "提示",
    message: "您的会话已过期，请重新登录",
    type: "info",
  });
  await useUserStoreHook().clearSessionAndCache();
  router.push("/login");
}
