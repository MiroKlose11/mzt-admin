import request from "@/utils/request";

const BANNER_BASE_URL = "/homepage/banner";

/** 接口通用响应结构 */
export interface ApiResponse<T> {
  code: string;
  data: T;
  msg: string;
}

/** Banner页面结果接口 */
export interface PageResultBanner {
  /** 数据列表 */
  records: Banner[];
  /** 总数 */
  total: number;
  /** 每页条数 */
  size: number;
  /** 当前页码 */
  current: number;
  /** 总页数 */
  pages: number;
}

const BannerAPI = {
  /**
   * 获取轮播图列表（前台）
   * @param position 轮播图位置(1:顶部Banner, 2:平台介绍Banner)
   * @returns 轮播图列表
   */
  getList(position?: number) {
    return request<any, Banner[]>({
      url: `/index/banner/list`,
      method: "get",
      params: { position },
    });
  },

  /**
   * 获取轮播图分页数据（管理端）
   * @param queryParams 查询参数
   * @returns 轮播图分页数据
   */
  getPage(queryParams?: BannerPageQuery) {
    return request<any, PageResultBanner>({
      url: `${BANNER_BASE_URL}/page`,
      method: "get",
      params: {
        current: queryParams?.pageNum,
        size: queryParams?.pageSize,
        position: queryParams?.position,
        title: queryParams?.title,
        status: queryParams?.status,
      },
    });
  },

  /**
   * 获取轮播图详情
   * @param id 轮播图ID
   * @returns 轮播图详情
   */
  getDetail(id: string | number) {
    return request<any, Banner>({
      url: `${BANNER_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 添加轮播图
   * @param data 轮播图表单数据
   * @returns
   */
  create(data: BannerForm) {
    return request<any, Banner>({
      url: `${BANNER_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 更新轮播图
   * @param data 轮播图表单数据（需包含id）
   */
  update(data: BannerForm) {
    return request<any, Banner>({
      url: `${BANNER_BASE_URL}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 删除轮播图
   * @param id 轮播图ID
   */
  deleteById(id: string | number) {
    return request<any, any>({
      url: `${BANNER_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /**
   * 更新轮播图状态
   * @param id 轮播图ID
   * @param status 状态(0:禁用，1:启用)
   */
  updateStatus(id: string | number, status: number) {
    const data = { id, status };
    return request<any, Banner>({
      url: `${BANNER_BASE_URL}`,
      method: "put",
      data: data,
    });
  },
};

export default BannerAPI;

/** 轮播图分页查询参数 */
export interface BannerPageQuery extends PageQuery {
  /** 标题 */
  title?: string;
  /** 位置 */
  position?: number;
  /** 状态(0:禁用，1:启用) */
  status?: number;
}

/** 轮播图表单对象 */
export interface BannerForm {
  id?: string | number;
  /** 轮播图标题 */
  title?: string;
  /** 图片URL */
  imageUrl?: string;
  /** 链接地址 */
  link?: string;
  /** 轮播图位置(1:顶部Banner, 2:平台介绍Banner) */
  position?: number;
  /** 排序 */
  sort?: number;
  /** 状态(0:禁用，1:启用) */
  status?: number;
}

/** 轮播图对象 */
export interface Banner {
  /** 轮播图ID */
  id: number | string;
  /** 轮播图标题 */
  title: string;
  /** 图片URL */
  imageUrl: string;
  /** 链接地址 */
  link: string;
  /** 轮播图位置(1:顶部Banner, 2:平台介绍Banner) */
  position: number;
  /** 排序 */
  sort: number;
  /** 状态(0:禁用，1:启用) */
  status: number;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  /** 是否删除 */
  deleted: number;
}
