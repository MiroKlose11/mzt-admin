import request from "@/utils/request";

// 机构基础URL
const ORGANIZATION_BASE_URL = "/organization";

// 机构状态枚举
export enum OrganizationStatusEnum {
  DISABLED = 0, // 禁用
  ENABLED = 1, // 启用
}

const OrganizationAPI = {
  /**
   * 获取机构列表
   *
   * @param params 查询参数
   * @returns 机构列表
   */
  getList(params?: OrganizationQuery) {
    return request<any, OrganizationVO[]>({
      url: `${ORGANIZATION_BASE_URL}/list`,
      method: "get",
      params,
    });
  },

  /**
   * 获取机构详情
   *
   * @param id 机构ID
   * @returns 机构详情
   */
  getDetail(id: number) {
    return request<any, OrganizationVO>({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建机构
   *
   * @param data 机构数据
   * @returns 创建结果
   */
  create(data: OrganizationDTO) {
    return request<any, boolean>({
      url: ORGANIZATION_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新机构
   *
   * @param data 机构数据
   * @returns 更新结果
   */
  update(data: OrganizationDTO) {
    return request<any, boolean>({
      url: ORGANIZATION_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除机构
   *
   * @param id 机构ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${ORGANIZATION_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default OrganizationAPI;

/**
 * 机构查询参数
 */
export interface OrganizationQuery {
  /** 当前页码 */
  current?: number;
  /** 每页条数 */
  size?: number;
  /** 机构名称 */
  name?: string;
  /** 机构类型ID */
  typeId?: number;
  /** 状态 */
  status?: OrganizationStatusEnum;
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  /** 记录列表 */
  records: T[];
  /** 总记录数 */
  total: number;
  /** 每页条数 */
  size: number;
  /** 当前页码 */
  current: number;
  /** 总页数 */
  pages: number;
}

/**
 * 机构数据传输对象
 */
export interface OrganizationDTO {
  /** 机构ID */
  id?: number;
  /** 机构名称 */
  name: string;
  /** 机构类型ID */
  typeId: number;
  /** 机构地址 */
  address?: string;
  /** 所在城市ID */
  cityId?: number;
  /** 所在城市名称 */
  cityName?: string;
  /** 联系电话 */
  phone?: string;
  /** 状态 */
  status?: OrganizationStatusEnum;
}

/**
 * 机构视图对象
 */
export interface OrganizationVO extends OrganizationDTO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 机构类型名称 */
  typeName?: string;
  /** 城市名称 */
  cityName?: string;
}
