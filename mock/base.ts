import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

export const defineMock = createDefineMock((mock) => {
  // 拼接url，避免额外的/api前缀
  mock.url = path.join(import.meta.env.VITE_APP_BASE_API, mock.url);
});
