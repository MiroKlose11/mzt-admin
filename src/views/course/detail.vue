<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程详情</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-descriptions v-loading="loading" title="课程信息" :column="2" border>
        <el-descriptions-item label="课程封面" :span="2">
          <el-image
            v-if="courseInfo.coverUrl"
            :src="courseInfo.coverUrl"
            :preview-src-list="[courseInfo.coverUrl]"
            fit="cover"
            style="width: 240px; height: 135px; border-radius: 4px"
          />
          <div v-else class="no-image">暂无封面</div>
        </el-descriptions-item>
        <el-descriptions-item label="课程标题">{{ courseInfo.title || "-" }}</el-descriptions-item>
        <el-descriptions-item label="课程类型">
          <el-tag :type="getCourseTypeTagType(courseInfo.courseType)">
            {{ getCourseTypeLabel(courseInfo.courseType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="讲师">
          {{ courseInfo.instructorName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="所属机构">
          {{ courseInfo.organizationName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="价格">
          <span v-if="courseInfo.isPaid">￥{{ courseInfo.price || 0 }}</span>
          <el-tag v-else type="success">免费</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="courseInfo.status ? 'success' : 'danger'">
            {{ courseInfo.status ? "上架" : "下架" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="courseInfo.courseType === CourseTypeEnum.VIDEO"
          label="视频地址"
        >
          {{ courseInfo.videoUrl || "-" }}
        </el-descriptions-item>
        <el-descriptions-item
          v-if="courseInfo.courseType === CourseTypeEnum.VIDEO"
          label="视频时长"
        >
          {{ formatDuration(courseInfo.videoDuration) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(courseInfo.createdAt) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(courseInfo.updatedAt) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="课程简介" :span="2">
          {{ courseInfo.description || "-" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import CourseAPI, { type CourseVO, CourseTypeEnum } from "@/api/course.api";
import { formatDateTime } from "@/utils/date";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const courseInfo = ref<CourseVO>({
  title: "",
});

// 课程类型选项
const courseTypeOptions = [
  { label: "视频课程", value: CourseTypeEnum.VIDEO },
  { label: "文章课程", value: CourseTypeEnum.ARTICLE },
  { label: "直播课程", value: CourseTypeEnum.LIVE },
  { label: "其他", value: CourseTypeEnum.OTHER },
];

// 获取课程详情
const getCourseDetail = async () => {
  const id = Number(route.params.id);
  if (!id) {
    ElMessage.error("课程ID不能为空");
    return;
  }

  loading.value = true;
  try {
    const result = await CourseAPI.getDetail(id);
    courseInfo.value = result;
  } catch (error) {
    console.error("获取课程详情失败", error);
    ElMessage.error("获取课程详情失败");
  } finally {
    loading.value = false;
  }
};

// 返回列表
const goBack = () => {
  router.push("/course");
};

// 获取课程类型标签类型
const getCourseTypeTagType = (type?: string) => {
  if (!type) return "info";

  switch (type) {
    case CourseTypeEnum.VIDEO:
      return "success";
    case CourseTypeEnum.ARTICLE:
      return "info";
    case CourseTypeEnum.LIVE:
      return "danger";
    default:
      return "warning";
  }
};

// 获取课程类型标签文本
const getCourseTypeLabel = (type?: string) => {
  if (!type) return "未知";

  const option = courseTypeOptions.find((item) => item.value === type);
  return option ? option.label : "未知";
};

// 格式化时长
const formatDuration = (seconds?: number) => {
  if (!seconds) return "0秒";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let result = "";
  if (hours > 0) {
    result += `${hours}小时`;
  }
  if (minutes > 0) {
    result += `${minutes}分钟`;
  }
  if (remainingSeconds > 0) {
    result += `${remainingSeconds}秒`;
  }

  return result;
};

onMounted(() => {
  getCourseDetail();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-image {
  width: 240px;
  height: 135px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 14px;
  border-radius: 4px;
}
</style>
