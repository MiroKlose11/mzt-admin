import request from "@/utils/request";

const FileAPI = {
  /**
   * 上传文件
   *
   * @param formData
   */
  upload(formData: FormData) {
    return request<any, FileInfo>({
      url: "/files",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 上传文件
   */
  uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<any, FileInfo>({
      url: "/files",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * 上传文件到腾讯云COS
   * @param file 要上传的文件
   * @param directory 上传到COS的目录路径 (可选)
   */
  uploadToCOS(file: File, directory?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (directory) {
      formData.append("directory", directory);
    }
    return request<any, { code: string; data: string; msg: string }>({
      url: "/file/upload",
      method: "post",
      data: formData,
      headers: {
        "Content-Type": undefined,
      },
    });
  },

  /**
   * 删除文件
   *
   * @param filePath 文件完整路径
   */
  delete(filePath?: string) {
    return request({
      url: "/files",
      method: "delete",
      params: { filePath: filePath },
    });
  },

  /**
   * 下载文件
   * @param url
   * @param fileName
   */
  download(url: string, fileName?: string) {
    return request({
      url: url,
      method: "get",
      responseType: "blob",
    }).then((res) => {
      const blob = new Blob([res.data]);
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName || "下载文件";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  },
};

export default FileAPI;

/**
 * 文件API类型声明
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** 文件路径 */
  url: string;
}
