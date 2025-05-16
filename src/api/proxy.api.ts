import request from "@/utils/request";

const ProxyAPI = {
  /**
   * 代理获取图片
   * @param imageUrl 原始图片URL
   * @returns 图片Blob对象
   */
  getImage(imageUrl: string) {
    return request({
      url: "/proxy/image",
      method: "get",
      params: { url: imageUrl },
      responseType: "blob",
    });
  },
};

export default ProxyAPI;
