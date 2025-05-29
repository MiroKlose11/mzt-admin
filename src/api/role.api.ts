import request from "@/utils/request";

// 角色基础URL
const ROLE_BASE_URL = "/role";

const RoleAPI = {
  /**
   * 获取角色列表
   *
   * @returns 角色列表
   */
  getList() {
    return request<any, RoleVO[]>({
      url: `${ROLE_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取角色详情
   *
   * @param id 角色ID
   * @returns 角色详情
   */
  getDetail(id: number) {
    return request<any, RoleVO>({
      url: `${ROLE_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建角色
   *
   * @param data 角色数据
   * @returns 创建结果
   */
  create(data: RoleDTO) {
    return request<any, boolean>({
      url: ROLE_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新角色
   *
   * @param data 角色数据
   * @returns 更新结果
   */
  update(data: RoleDTO) {
    return request<any, boolean>({
      url: ROLE_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除角色
   *
   * @param id 角色ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${ROLE_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default RoleAPI;

/**
 * 角色数据传输对象
 */
export interface RoleDTO {
  /** 角色ID */
  id?: number;
  /** 唯一标识 */
  code: string;
  /** 角色名称 */
  name: string;
  /** 说明 */
  description?: string;
  /** 排序值 */
  sort?: number;
  /** 创建时间 */
  createdAt?: string;
}

/**
 * 角色视图对象
 */
export interface RoleVO extends RoleDTO {}
