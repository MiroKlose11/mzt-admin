import request from "@/utils/request";

// 城市基础URL
const CITY_BASE_URL = "/city";

const CityAPI = {
  /**
   * 获取城市列表
   *
   * @returns 城市列表
   */
  getList() {
    return request<any, CityVO[]>({
      url: `${CITY_BASE_URL}/list`,
      method: "get",
    });
  },

  /**
   * 获取城市详情
   *
   * @param id 城市ID
   * @returns 城市详情
   */
  getDetail(id: number) {
    return request<any, CityVO>({
      url: `${CITY_BASE_URL}/${id}`,
      method: "get",
    });
  },
};

export default CityAPI;

/**
 * 城市视图对象
 */
export interface CityVO {
  /** 城市ID */
  id: number;
  /** 城市名称 */
  name: string;
  /** 城市编码 */
  code?: string;
  /** 省份ID */
  provinceId?: number;
  /** 省份名称 */
  provinceName?: string;
  /** 父级ID */
  parentId?: number;
}
