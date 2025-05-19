/**
 * 响应码枚举
 */
export const enum ResultEnum {
  /**
   * 成功
   */
  SUCCESS = "00000",
  /**
   * 错误
   */
  ERROR = "B0001",

  /**
   * 访问令牌无效或过期
   */
  ACCESS_TOKEN_INVALID = "A0230",

  /**
   * 刷新令牌无效或过期
   */
  REFRESH_TOKEN_INVALID = "A0231",

  /**
   * 参数错误
   */
  PARAM_ERROR = "A0400",

  /**
   * 用户不存在
   */
  USER_NOT_FOUND = "A0002",

  /**
   * 用户名或密码错误
   */
  USERNAME_PASSWORD_ERROR = "A0003",

  /**
   * 验证码错误
   */
  CAPTCHA_ERROR = "A0004",

  /**
   * 账号已被禁用
   */
  ACCOUNT_DISABLED = "A0005",

  /**
   * 无效的令牌
   */
  INVALID_TOKEN = "A0006",

  /**
   * 令牌已过期
   */
  TOKEN_EXPIRED = "A0007",

  /**
   * 没有权限
   */
  NO_PERMISSION = "A0008",

  /**
   * 未授权
   */
  UNAUTHORIZED = "A0401",

  /**
   * 禁止访问
   */
  FORBIDDEN = "A0403",

  /**
   * 资源不存在
   */
  RESOURCE_NOT_FOUND = "A0404",
}
