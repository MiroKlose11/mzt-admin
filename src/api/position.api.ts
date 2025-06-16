import request from "@/utils/request";

// 岗位基础URL
const POSITION_BASE_URL = "/position";

// 岗位状态枚举
export const PositionStatusEnum = {
  DISABLED: false, // 禁用
  ENABLED: true, // 启用
} as const;

const PositionAPI = {
  /**
   * 获取岗位列表
   *
   * @returns 岗位列表
   */
  getList() {
    return request<any, PositionVO[]>({
      url: `${POSITION_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取岗位详情
   *
   * @param id 岗位ID
   * @returns 岗位详情
   */
  getDetail(id: number) {
    return request<any, PositionVO>({
      url: `${POSITION_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建岗位
   *
   * @param data 岗位数据
   * @returns 创建结果
   */
  create(data: PositionDTO) {
    return request<any, boolean>({
      url: POSITION_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新岗位
   *
   * @param data 岗位数据
   * @returns 更新结果
   */
  update(data: PositionDTO) {
    return request<any, boolean>({
      url: POSITION_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除岗位
   *
   * @param id 岗位ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${POSITION_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default PositionAPI;

/**
 * 岗位数据传输对象
 */
export interface PositionDTO {
  /** 岗位ID */
  id?: number;
  /** 岗位名称 */
  name: string;
  /** 岗位描述 */
  description?: string;
  /** 排序值，越小越靠前 */
  sort?: number;
  /** 状态：true=启用，false=禁用 */
  status?: boolean;
}

/**
 * 岗位视图对象
 */
export interface PositionVO extends PositionDTO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
