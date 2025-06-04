import request from "@/utils/request";

// 机构类型基础URL
const ORGANIZATION_TYPE_BASE_URL = "/organization";

const OrganizationTypeAPI = {
  /**
   * 获取机构类型列表
   *
   * @returns 机构类型列表
   */
  getList() {
    return request<any, OrganizationTypeVO[]>({
      url: `${ORGANIZATION_TYPE_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取机构类型详情
   *
   * @param id 机构类型ID
   * @returns 机构类型详情
   */
  getDetail(id: number) {
    return request<any, OrganizationTypeVO>({
      url: `${ORGANIZATION_TYPE_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建机构类型
   *
   * @param data 机构类型数据
   * @returns 创建结果
   */
  create(data: OrganizationTypeDTO) {
    return request<any, boolean>({
      url: ORGANIZATION_TYPE_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新机构类型
   *
   * @param data 机构类型数据
   * @returns 更新结果
   */
  update(data: OrganizationTypeDTO) {
    return request<any, boolean>({
      url: ORGANIZATION_TYPE_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除机构类型
   *
   * @param id 机构类型ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${ORGANIZATION_TYPE_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default OrganizationTypeAPI;

/**
 * 机构类型数据传输对象
 */
export interface OrganizationTypeDTO {
  /** 机构类型ID */
  id?: number;
  /** 机构类型名称 */
  name: string;
  /** 机构类型描述 */
  description?: string;
  /** 排序 */
  sort?: number;
}

/**
 * 机构类型视图对象
 */
export interface OrganizationTypeVO extends OrganizationTypeDTO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
