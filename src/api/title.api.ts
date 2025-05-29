import request from "@/utils/request";

// 头衔基础URL
const TITLE_BASE_URL = "/title";

const TitleAPI = {
  /**
   * 获取头衔列表
   *
   * @returns 头衔列表
   */
  getList() {
    return request<any, TitleVO[]>({
      url: `${TITLE_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取头衔详情
   *
   * @param id 头衔ID
   * @returns 头衔详情
   */
  getDetail(id: number) {
    return request<any, TitleVO>({
      url: `${TITLE_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建头衔
   *
   * @param data 头衔数据
   * @returns 创建结果
   */
  create(data: TitleDTO) {
    return request<any, boolean>({
      url: TITLE_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新头衔
   *
   * @param data 头衔数据
   * @returns 更新结果
   */
  update(data: TitleDTO) {
    return request<any, boolean>({
      url: TITLE_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除头衔
   *
   * @param id 头衔ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${TITLE_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default TitleAPI;

/**
 * 头衔数据传输对象
 */
export interface TitleDTO {
  /** 头衔ID */
  id?: number;
  /** 头衔名称 */
  name: string;
  /** 适用角色类型 */
  type?: string;
  /** 说明 */
  description?: string;
  /** 排序值 */
  sort?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 头衔视图对象
 */
export interface TitleVO extends TitleDTO {}
