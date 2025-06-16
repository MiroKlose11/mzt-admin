import request from "@/utils/request";

// 课程基础URL
const COURSE_BASE_URL = "/course";

// 课程类型枚举
export enum CourseTypeEnum {
  VIDEO = "video", // 视频课程
  ARTICLE = "article", // 文章课程
  LIVE = "live", // 直播课程
  OTHER = "other", // 其他
}

const CourseAPI = {
  /**
   * 获取课程列表
   *
   * @returns 课程列表
   */
  getList() {
    return request<any, CourseVO[]>({
      url: `${COURSE_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取课程详情
   *
   * @param id 课程ID
   * @returns 课程详情
   */
  getDetail(id: number) {
    return request<any, CourseVO>({
      url: `${COURSE_BASE_URL}/${id}`,
      method: "get",
    });
  },

  /**
   * 创建课程
   *
   * @param data 课程数据
   * @returns 创建结果
   */
  create(data: CourseDTO) {
    return request<any, boolean>({
      url: COURSE_BASE_URL,
      method: "post",
      data,
    });
  },

  /**
   * 更新课程
   *
   * @param data 课程数据
   * @returns 更新结果
   */
  update(data: CourseDTO) {
    return request<any, boolean>({
      url: COURSE_BASE_URL,
      method: "put",
      data,
    });
  },

  /**
   * 删除课程
   *
   * @param id 课程ID
   * @returns 删除结果
   */
  delete(id: number) {
    return request<any, boolean>({
      url: `${COURSE_BASE_URL}/${id}`,
      method: "delete",
    });
  },
};

export default CourseAPI;

/**
 * 课程数据传输对象
 */
export interface CourseDTO {
  /** 课程ID */
  id?: number;
  /** 课程标题 */
  title: string;
  /** 课程简介 */
  description?: string;
  /** 封面图片URL */
  coverUrl?: string;
  /** 讲师ID */
  instructorId?: number;
  /** 讲师姓名 */
  instructorName?: string;
  /** 所属机构ID */
  organizationId?: number;
  /** 所属机构名称 */
  organizationName?: string;
  /** 课程类型 */
  courseType?: string;
  /** 视频播放地址 */
  videoUrl?: string;
  /** 视频时长（秒） */
  videoDuration?: number;
  /** 价格 */
  price?: number;
  /** 是否付费课程 */
  isPaid?: boolean;
  /** 状态：true=上架，false=下架 */
  status?: boolean;
}

/**
 * 课程视图对象
 */
export interface CourseVO extends CourseDTO {
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
