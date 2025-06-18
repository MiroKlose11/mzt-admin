import request from "@/utils/request";

// 成员基础URL
const MEMBER_BASE_URL = "/member";

// 性别枚举
export enum GenderEnum {
  UNKNOWN = 0, // 未知
  MALE = 1, // 男
  FEMALE = 2, // 女
}

// 状态枚举
export enum MemberStatusEnum {
  DISABLED = 0, // 禁用
  ENABLED = 1, // 启用
}

const MemberAPI = {
  /**
   * 分页获取成员列表
   *
   * @param params 查询参数
   * @returns 分页成员列表
   */
  getPage(params: MemberQuery) {
    return request<any, PageResult<MemberVO>>({
      url: `${MEMBER_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /**
   * 获取成员详情
   *
   * @param id 成员ID
   * @returns 成员详情
   */
  getDetail(id: number) {
    return request<any, MemberVO>({
      url: `${MEMBER_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建成员
   *
   * @param data 成员数据
   * @returns 创建结果
   */
  create(data: MemberDTO) {
    return request<any, boolean>({
      url: MEMBER_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新成员
   *
   * @param data 成员数据
   * @returns 更新结果
   */
  update(data: MemberDTO) {
    return request<any, boolean>({
      url: MEMBER_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除成员
   *
   * @param id 成员ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${MEMBER_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default MemberAPI;

/**
 * 成员查询参数
 */
export interface MemberQuery {
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
  /** 成员姓名 */
  name?: string;
  /** 状态 */
  status?: MemberStatusEnum;
  /** 用户ID */
  userId?: number;
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
 * 角色信息
 */
export interface Role {
  /** 角色ID */
  id?: number;
  /** 角色编码 */
  code?: string;
  /** 角色名称 */
  name?: string;
  /** 角色描述 */
  description?: string;
  /** 排序 */
  sort?: number;
  /** 创建时间 */
  createdAt?: string;
}

/**
 * 头衔信息
 */
export interface Title {
  /** 头衔ID */
  id?: number;
  /** 头衔名称 */
  name?: string;
  /** 头衔类型 */
  type?: string;
  /** 头衔描述 */
  description?: string;
  /** 排序 */
  sort?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 成员数据传输对象
 */
export interface MemberDTO {
  /** 成员ID */
  id?: number;
  /** 姓名 */
  name: string;
  /** 头像URL */
  avatar?: string;
  /** 性别 */
  gender?: GenderEnum;
  /** 显示头衔 */
  titleText?: string;
  /** 所属单位/机构ID */
  organizationId?: number;
  /** 所属单位/机构 */
  organization?: string;
  /** 职业所在地ID */
  cityId?: number;
  /** 职业所在地名称 */
  cityName?: string;
  /** 个人简介 */
  introduction?: string;
  /** 状态 */
  status?: MemberStatusEnum;
  /** 角色ID列表 */
  roleIds?: number[];
  /** 头衔ID列表 */
  titleIds?: number[];
  /** 用户ID */
  userId?: number;
}

/**
 * 成员视图对象
 */
export interface MemberVO extends MemberDTO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 角色信息列表 */
  roles?: Role[];
  /** 头衔信息列表 */
  titles?: Title[];
}
