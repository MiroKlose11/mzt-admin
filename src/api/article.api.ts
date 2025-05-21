import request from "@/utils/request";

// 文章基础URL
const ARTICLE_BASE_URL = "/article";

// 文章状态枚举
export enum ArticleStatusEnum {
  DRAFT = 0, // 草稿
  PENDING = 1, // 待审核
  PUBLISHED = 2, // 已发布
  REJECTED = 3, // 已驳回
}

// 访客可见性枚举
export enum GuestVisibleEnum {
  INVISIBLE = 0, // 不允许未登录用户查看
  VISIBLE = 1, // 允许未登录用户查看
}

// 作者类型枚举
export enum AuthorTypeEnum {
  ADMIN = 0, // 管理员
  USER = 1, // 用户
}

const ArticleAPI = {
  /**
   * 分页获取文章列表
   *
   * @param params 查询参数
   * @returns 分页文章列表
   */
  getPage(params: ArticleQuery) {
    return request<any, PageResult<ArticleVO>>({
      url: `${ARTICLE_BASE_URL}/page`,
      method: "get",
      params,
    });
  },

  /**
   * 获取文章详情
   *
   * @param id 文章ID
   * @returns 文章详情
   */
  getDetail(id: number) {
    return request<any, ArticleVO>({
      url: `${ARTICLE_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 获取文章内容
   *
   * @param id 文章ID
   * @returns 文章内容
   */
  getContent(id: number) {
    return request<any, ArticleContent>({
      url: `${ARTICLE_BASE_URL}/${id}/content`,
      method: "get",
    });
  },

  /**
   * 创建文章
   *
   * @param data 文章数据
   * @returns 创建结果
   */
  create(data: ArticleForm) {
    return request<any, ArticleVO>({
      url: ARTICLE_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新文章
   *
   * @param data 文章数据
   * @returns 更新结果
   */
  update(data: ArticleForm) {
    return request<any, boolean>({
      url: ARTICLE_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除文章
   *
   * @param id 文章ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${ARTICLE_BASE_URL}/${id}`,
      method: "delete",
    });
  },

  /**
   * 保存文章内容
   *
   * @param id 文章ID
   * @param content 文章内容
   * @returns 保存结果
   */
  saveContent(id: number, content: string) {
    return request<any, boolean>({
      url: `${ARTICLE_BASE_URL}/${id}/content`,
      method: "post",
      data: { content },
    });
  },
};

export default ArticleAPI;

/**
 * 文章查询参数
 */
export interface ArticleQuery {
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
  /** 文章标题 */
  title?: string;
  /** 文章状态 */
  status?: ArticleStatusEnum;
  /** 栏目ID */
  channelId?: number;
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
 * 文章表单对象
 */
export interface ArticleForm {
  /** 文章ID，新增时不需要 */
  id?: number;
  /** 文章标题 */
  title: string;
  /** 文章封面图 */
  coverImage?: string;
  /** 文章简介 */
  description: string;
  /** 排序权重 */
  weight: number;
  /** 文章状态 */
  status: ArticleStatusEnum;
  /** 访客可见性 */
  isGuestVisible: GuestVisibleEnum;
  /** 栏目ID */
  channelId?: number;
  /** 作者ID */
  authorId?: number;
  /** 作者类型 */
  authorType?: AuthorTypeEnum;
}

/**
 * 文章视图对象
 */
export interface ArticleVO extends ArticleForm {
  /** 浏览量 */
  views?: number;
  /** 点赞数 */
  likes?: number;
  /** 评论数 */
  comments?: number;
  /** 创建时间 */
  createtime?: string;
  /** 更新时间 */
  updatetime?: string;
  /** 发布时间 */
  publishtime?: string;
}

/**
 * 文章内容对象
 */
export interface ArticleContent {
  /** 文章ID */
  articleId: number;
  /** 文章内容 */
  content: string;
}
