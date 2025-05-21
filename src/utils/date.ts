/**
 * 格式化日期时间
 * 将日期格式化为标准的北京时间格式： YYYY-MM-DD HH:mm:ss
 * @param dateStr 日期字符串或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(dateStr?: string | number): string {
  if (!dateStr) return "-";

  try {
    const date = new Date(dateStr);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return "-";
    }

    // 调整到北京时间 (UTC+8)
    const beijingDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);

    // 格式化为 YYYY-MM-DD HH:mm:ss
    const year = beijingDate.getUTCFullYear();
    const month = String(beijingDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(beijingDate.getUTCDate()).padStart(2, "0");
    const hours = String(beijingDate.getUTCHours()).padStart(2, "0");
    const minutes = String(beijingDate.getUTCMinutes()).padStart(2, "0");
    const seconds = String(beijingDate.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("日期格式化错误:", error);
    return "-";
  }
}

/**
 * 格式化日期
 * 将日期格式化为标准的日期格式： YYYY-MM-DD
 * @param dateStr 日期字符串或时间戳
 * @returns 格式化后的日期字符串
 */
export function formatDate(dateStr?: string | number): string {
  if (!dateStr) return "-";

  try {
    const date = new Date(dateStr);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return "-";
    }

    // 调整到北京时间 (UTC+8)
    const beijingDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);

    // 格式化为 YYYY-MM-DD
    const year = beijingDate.getUTCFullYear();
    const month = String(beijingDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(beijingDate.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("日期格式化错误:", error);
    return "-";
  }
}
