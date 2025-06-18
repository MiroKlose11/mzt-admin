<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程详情</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <div v-loading="loading" class="course-detail-content">
        <!-- 视频播放区域 -->
        <div v-if="courseInfo.courseType === CourseTypeEnum.VIDEO" class="video-player-container">
          <h3>课程视频</h3>
          <div class="video-player">
            <video
              v-if="courseInfo.videoUrl"
              :src="courseInfo.videoUrl"
              controls
              class="video-element"
              style="width: 800px; height: 450px"
            >
              您的浏览器不支持视频播放
            </video>
            <div v-else class="no-video">
              <el-icon><VideoCamera /></el-icon>
              <span>暂无视频</span>
            </div>
          </div>
          <div class="video-info">
            <span>视频时长：{{ formatDuration(courseInfo.videoDuration) || "-" }}</span>
            <span>视频地址：{{ courseInfo.videoUrl || "-" }}</span>
          </div>
        </div>

        <!-- 课程基本信息 -->
        <div class="course-info-container">
          <h3>课程信息</h3>
          <div class="course-info-grid">
            <div class="course-cover">
              <el-image
                v-if="courseInfo.coverUrl"
                :src="courseInfo.coverUrl"
                :preview-src-list="[courseInfo.coverUrl]"
                fit="cover"
                class="cover-image"
              />
              <div v-else class="no-image">暂无封面</div>
            </div>

            <div class="course-info-details">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="课程标题">
                  {{ courseInfo.title || "-" }}
                </el-descriptions-item>
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
              </el-descriptions>
            </div>
          </div>

          <el-divider />

          <div class="course-description">
            <h4>课程简介</h4>
            <p>{{ courseInfo.description || "暂无课程简介" }}</p>
          </div>

          <div class="course-meta">
            <p>创建时间：{{ formatDateTime(courseInfo.createdAt) || "-" }}</p>
            <p>更新时间：{{ formatDateTime(courseInfo.updatedAt) || "-" }}</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { VideoCamera } from "@element-plus/icons-vue";
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

.course-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 视频播放区域 */
.video-player-container {
  width: 100%;
  margin-bottom: 20px;
}

.video-player-container h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.video-player {
  width: 800px;
  height: 450px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16 / 9;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-video {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1c1c1c;
  color: #909399;
}

.no-video .el-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.video-info {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

/* 课程信息区域 */
.course-info-container {
  width: 100%;
}

.course-info-container h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.course-info-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
}

.course-cover {
  width: 100%;
}

.cover-image {
  width: 100%;
  height: 168px;
  border-radius: 8px;
}

.no-image {
  width: 100%;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 14px;
  border-radius: 8px;
}

.course-description {
  margin-top: 20px;
}

.course-description h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
}

.course-description p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.course-meta {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .course-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
