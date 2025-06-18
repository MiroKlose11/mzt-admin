import request from "@/utils/request";

// 学生基础URL
const STUDENT_BASE_URL = "/student";

// 性别枚举
export enum GenderEnum {
  UNKNOWN = 0, // 未知
  MALE = 1, // 男
  FEMALE = 2, // 女
}

// 状态枚举
export enum StudentStatusEnum {
  DISABLED = 0, // 禁用
  ENABLED = 1, // 启用
}

const StudentAPI = {
  /**
   * 分页获取学生列表
   *
   * @param params 查询参数
   * @returns 分页学生列表
   */
  getPage(params: StudentQuery) {
    return request<any, PageResult<StudentVO>>({
      url: `${STUDENT_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /**
   * 获取学生列表
   *
   * @returns 学生列表
   */
  getList() {
    return request<any, StudentVO[]>({
      url: `${STUDENT_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取学生详情
   *
   * @param id 学生ID
   * @returns 学生详情
   */
  getDetail(id: number) {
    return request<any, StudentVO>({
      url: `${STUDENT_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建学生
   *
   * @param data 学生数据
   * @returns 创建结果
   */
  create(data: StudentDTO) {
    return request<any, boolean>({
      url: STUDENT_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新学生
   *
   * @param data 学生数据
   * @returns 更新结果
   */
  update(data: StudentDTO) {
    return request<any, boolean>({
      url: STUDENT_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除学生
   *
   * @param id 学生ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${STUDENT_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default StudentAPI;

/**
 * 学生查询参数
 */
export interface StudentQuery {
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
  /** 学生姓名 */
  name?: string;
  /** 状态 */
  status?: StudentStatusEnum;
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
 * 学生数据传输对象
 */
export interface StudentDTO {
  /** 学生ID */
  id?: number;
  /** 姓名 */
  name: string;
  /** 头像URL */
  avatar?: string;
  /** 性别 */
  gender?: GenderEnum;
  /** 个性签名 */
  signature?: string;
  /** 所属机构ID */
  organizationId?: number;
  /** 所属机构名称 */
  organizationName?: string;
  /** 状态 */
  status?: StudentStatusEnum;
  /** 用户ID */
  userId?: number;
}

/**
 * 学生视图对象
 */
export interface StudentVO extends StudentDTO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
