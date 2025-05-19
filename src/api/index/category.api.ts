import request from "@/utils/request";

const CATEGORY_BASE_URL = "/homepage/category-item";

/** 接口通用响应结构 */
export interface ApiResponse<T> {
  code: string;
  data: T;
  msg: string;
}

/** 分类页面结果接口 */
export interface PageResultCategory {
  /** 数据列表 */
  records: CategoryItem[];
  /** 总数 */
  total: number;
  /** 每页条数 */
  size: number;
  /** 当前页码 */
  current: number;
  /** 总页数 */
  pages: number;
}

// 分类类型映射
export const categoryTypeMap: Record<string, string> = {
  service: "服务项目",
  platform: "平台",
  course: "课程",
  job: "岗位",
};

// 分类类型排序优先级
export const categoryTypePriority: Record<string, number> = {
  service: 1,
  platform: 2,
  course: 3,
  job: 4,
};

const CategoryAPI = {
  /**
   * 获取分类列表，一次性获取所有数据
   * @returns 分类列表
   */
  getList() {
    return request<any, CategoryItem[]>({
      url: `${CATEGORY_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取分类分页数据
   * @param queryParams 查询参数
   * @returns 分类分页数据
   */
  getPage(queryParams?: CategoryPageQuery) {
    return request<any, PageResultCategory>({
      url: `${CATEGORY_BASE_URL}/page`,
      method: "get",
      params: {
        current: queryParams?.pageNum,
        size: queryParams?.pageSize,
        type: queryParams?.type,
      },
    });
  },

  /**
   * 获取分类详情
   * @param id 分类ID
   * @returns 分类详情
   */
  getDetail(id: string | number) {
    return request<any, CategoryItem>({
      url: `${CATEGORY_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 添加分类
   * @param data 分类表单数据
   * @returns
   */
  create(data: CategoryForm) {
    return request<any, CategoryItem>({
      url: `${CATEGORY_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 更新分类
   * @param data 分类表单数据（需包含id）
   */
  update(data: CategoryForm) {
    return request<any, CategoryItem>({
      url: `${CATEGORY_BASE_URL}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 删除分类
   * @param id 分类ID
   */
  deleteById(id: string | number) {
    return request<any, any>({
      url: `${CATEGORY_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /**
   * 更新分类状态
   * @param id 分类ID
   * @param status 状态(0:禁用，1:启用)
   */
  updateStatus(id: string | number, status: number) {
    const data = { id, status };
    return request<any, CategoryItem>({
      url: `${CATEGORY_BASE_URL}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 获取所有分类类型
   * @returns 分类类型列表
   */
  getTypes() {
    return request<any, string[]>({
      url: `${CATEGORY_BASE_URL}/types`,
      method: "get",
    });
  },
};

export default CategoryAPI;

/** 分类分页查询参数 */
export interface CategoryPageQuery {
  /** 分类类型 */
  type?: string;
  /** 页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
  /** 状态(0:禁用，1:启用) */
  status?: number;
}

/** 分类表单对象 */
export interface CategoryForm {
  id?: string | number;
  /** 分类类型 */
  categoryType?: string;
  /** 分类名称 */
  name?: string;
  /** 图标/图片URL */
  icon?: string;
  /** 排序 */
  sort?: number;
  /** 描述 */
  description?: string;
  /** 状态(0:禁用，1:启用) */
  status?: number;
}

/** 分类对象 */
export interface CategoryItem {
  /** 分类ID */
  id: number | string;
  /** 分类类型 */
  categoryType: string;
  /** 分类名称 */
  name: string;
  /** 图标/图片URL */
  icon: string;
  /** 排序 */
  sort: number;
  /** 描述 */
  description: string;
  /** 状态(0:禁用，1:启用) */
  status: number;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}
