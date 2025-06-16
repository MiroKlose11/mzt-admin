<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" label-width="80px" inline>
          <el-form-item label="标题">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入课程标题"
              clearable
              style="width: 240px"
              @keyup.enter="getCourseList"
            />
          </el-form-item>
          <el-form-item label="课程类型">
            <el-select
              v-model="queryParams.courseType"
              placeholder="请选择课程类型"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in courseTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="getCourseList">查询</el-button>
            <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
        </div>
      </div>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="courseList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="封面" width="120" align="center">
          <template #default="scope">
            <el-image
              v-if="scope.row.coverUrl"
              :src="scope.row.coverUrl"
              :preview-src-list="[scope.row.coverUrl]"
              fit="cover"
              style="width: 80px; height: 45px; border-radius: 4px"
            />
            <div v-else class="no-image">暂无封面</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="课程标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="instructorName" label="讲师" width="120" show-overflow-tooltip />
        <el-table-column
          prop="organizationName"
          label="所属机构"
          width="150"
          show-overflow-tooltip
        />
        <el-table-column prop="courseType" label="课程类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getCourseTypeTagType(scope.row.courseType)" size="small">
              {{ getCourseTypeLabel(scope.row.courseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120" align="center">
          <template #default="scope">
            <span v-if="scope.row.isPaid">￥{{ scope.row.price || 0 }}</span>
            <el-tag v-else type="success" size="small">免费</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'" size="small">
              {{ scope.row.status ? "上架" : "下架" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="150" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 课程表单对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="700px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-height: 500px; overflow-y: auto"
      >
        <el-form-item label="课程标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入课程标题" />
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
            class="cover-uploader"
            action="/dev-api/file/upload"
            :headers="{ Authorization: `Bearer ${getAccessToken()}` }"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
          >
            <el-image v-if="form.coverUrl" :src="form.coverUrl" fit="cover" class="course-cover" />
            <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：16:9，图片大小不超过 2MB</div>
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="form.courseType" placeholder="请选择课程类型" style="width: 100%">
            <el-option
              v-for="item in courseTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="讲师">
          <el-select
            v-model="form.instructorId"
            filterable
            remote
            clearable
            placeholder="请选择讲师"
            style="width: 100%"
            :remote-method="searchInstructors"
            :loading="instructorLoading"
            @change="onInstructorChange"
          >
            <el-option
              v-for="instructor in filteredInstructorList"
              :key="instructor.id"
              :label="instructor.name"
              :value="instructor.id"
            >
              <div style="display: flex; align-items: center">
                <el-avatar
                  v-if="instructor.avatar"
                  :size="30"
                  :src="instructor.avatar"
                  style="margin-right: 10px"
                />
                <div
                  v-else
                  style="
                    width: 30px;
                    height: 30px;
                    margin-right: 10px;
                    background-color: #f0f0f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  {{ instructor.name ? instructor.name.substring(0, 1) : "?" }}
                </div>
                <span>{{ instructor.name }}</span>
              </div>
            </el-option>
            <el-option :label="'手动输入'" :value="0">
              <div style="display: flex; align-items: center">
                <i class="el-icon-edit" style="margin-right: 10px"></i>
                <span>手动输入</span>
              </div>
            </el-option>
          </el-select>
          <el-input
            v-if="form.instructorId === 0"
            v-model="form.instructorName"
            placeholder="请输入讲师姓名"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="所属机构">
          <el-select
            v-model="form.organizationId"
            filterable
            remote
            clearable
            placeholder="请选择机构"
            style="width: 100%"
            :remote-method="searchOrganizations"
            :loading="organizationLoading"
            @change="onOrganizationChange"
          >
            <el-option
              v-for="org in filteredOrganizationList"
              :key="org.id"
              :label="org.name"
              :value="org.id"
            />
            <el-option :label="'手动输入'" :value="0">
              <div style="display: flex; align-items: center">
                <i class="el-icon-edit" style="margin-right: 10px"></i>
                <span>手动输入</span>
              </div>
            </el-option>
          </el-select>
          <el-input
            v-if="form.organizationId === 0"
            v-model="form.organizationName"
            placeholder="请输入机构名称"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="课程简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入课程简介"
          />
        </el-form-item>
        <el-form-item v-if="form.courseType === 'video'" label="视频地址">
          <div class="video-upload-container">
            <el-input v-model="form.videoUrl" placeholder="请输入视频播放地址" />
            <div class="video-upload-divider">或</div>
            <el-upload
              class="video-uploader"
              action="/dev-api/file/upload"
              :headers="{ Authorization: `Bearer ${getAccessToken()}` }"
              :show-file-list="false"
              :on-success="handleVideoSuccess"
              :before-upload="beforeVideoUpload"
              :accept="'video/*'"
            >
              <el-button type="primary">上传视频</el-button>
            </el-upload>
          </div>
          <div v-if="form.videoUrl" class="video-preview">
            <video
              :src="form.videoUrl"
              controls
              style="max-width: 100%; max-height: 200px; margin-top: 10px"
            ></video>
          </div>
        </el-form-item>
        <el-form-item v-if="form.courseType === 'video'" label="视频时长">
          <el-input-number
            v-model="form.videoDuration"
            :min="0"
            :step="1"
            placeholder="请输入视频时长（秒）"
          />
          <span v-if="form.videoDuration" class="duration-tip">
            约 {{ formatDuration(form.videoDuration) }}
          </span>
        </el-form-item>
        <el-form-item label="付费设置">
          <el-switch v-model="form.isPaid" active-text="付费" inactive-text="免费" />
        </el-form-item>
        <el-form-item v-if="form.isPaid" label="价格" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :step="0.01"
            placeholder="请输入价格"
          />
          <span class="price-unit">元</span>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="true">上架</el-radio>
            <el-radio :value="false">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CourseAPI, { type CourseDTO, type CourseVO, CourseTypeEnum } from "@/api/course.api";
import OrganizationAPI from "@/api/organization.api";
import MemberAPI, { MemberStatusEnum } from "@/api/member.api";
import { getAccessToken } from "@/utils/auth";
import { formatDateTime } from "@/utils/date";

// 课程类型选项
const courseTypeOptions = [
  { label: "视频课程", value: CourseTypeEnum.VIDEO },
  { label: "文章课程", value: CourseTypeEnum.ARTICLE },
  { label: "直播课程", value: CourseTypeEnum.LIVE },
  { label: "其他", value: CourseTypeEnum.OTHER },
];

// 状态选项
const statusOptions = [
  { label: "上架", value: "true" },
  { label: "下架", value: "false" },
];

// 状态
const loading = ref(false);
const courseList = ref<CourseVO[]>([]);
const router = useRouter();

// 查询参数
const queryParams = ref({
  title: "",
  courseType: "",
  status: undefined as string | undefined,
});

// 表单对话框
const dialog = reactive({
  visible: false,
  title: "",
  type: "add", // add: 新增, edit: 编辑
});

// 表单对象
const formRef = ref();
const form = ref<CourseDTO>({
  id: undefined,
  title: "",
  description: "",
  courseType: "video", // 默认选择视频课程类型
  price: 0,
  status: false,
  videoUrl: "",
  coverUrl: "",
  organizationId: undefined,
  organizationName: "",
  instructorId: undefined,
  instructorName: "",
  videoDuration: 0,
  isPaid: false,
});

// 表单验证规则
const rules = {
  title: [{ required: true, message: "请输入课程标题", trigger: "blur" }],
  description: [{ required: true, message: "请输入课程描述", trigger: "blur" }],
  courseType: [{ required: true, message: "请选择课程类型", trigger: "change" }],
  price: [
    { required: true, message: "请输入课程价格", trigger: "blur" },
    { type: "number" as const, message: "价格必须为数字", trigger: "blur" },
  ],
  status: [{ required: true, message: "请选择课程状态", trigger: "change" }],
};

// 机构列表
const organizationList = ref<{ id: number; name: string }[]>([]);
const filteredOrganizationList = ref<{ id: number; name: string }[]>([]);
const organizationLoading = ref(false);

// 搜索机构
const searchOrganizations = (query: string) => {
  if (query) {
    filteredOrganizationList.value = organizationList.value.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    filteredOrganizationList.value = organizationList.value;
  }
};

// 机构选择变化时
const onOrganizationChange = (val: number) => {
  if (val !== 0) {
    form.value.organizationName = "";
  }
};

// 获取所有机构列表
const getOrganizationList = async () => {
  organizationLoading.value = true;
  try {
    const result = await OrganizationAPI.getList();
    if (result && result.length > 0) {
      organizationList.value = result.map((org) => ({
        id: org.id!,
        name: org.name,
      }));
      filteredOrganizationList.value = [...organizationList.value];
    }
  } catch (error) {
    console.error("获取机构列表失败", error);
    ElMessage.error("获取机构列表失败");
  } finally {
    organizationLoading.value = false;
  }
};

// 讲师列表
const instructorList = ref<{ id: number; name: string; avatar?: string }[]>([]);
const filteredInstructorList = ref<{ id: number; name: string; avatar?: string }[]>([]);
const instructorLoading = ref(false);

// 搜索讲师
const searchInstructors = (query: string) => {
  if (query) {
    filteredInstructorList.value = instructorList.value.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    filteredInstructorList.value = instructorList.value;
  }
};

// 讲师选择变化时
const onInstructorChange = (val: number) => {
  if (val !== 0) {
    form.value.instructorName = "";
  }
};

// 获取课程列表
const getCourseList = async () => {
  loading.value = true;
  try {
    const result = await CourseAPI.getList();
    // 如果有查询条件，进行过滤
    courseList.value = result.filter((course) => {
      let match = true;
      if (queryParams.value.title && !course.title.includes(queryParams.value.title)) {
        match = false;
      }
      if (queryParams.value.courseType && course.courseType !== queryParams.value.courseType) {
        match = false;
      }
      if (queryParams.value.status !== undefined) {
        // 将字符串转换为布尔值进行比较
        const statusBoolean = queryParams.value.status === "true";
        if (course.status !== statusBoolean) {
          match = false;
        }
      }
      return match;
    });
  } catch {
    ElMessage.error("获取课程列表失败");
  } finally {
    loading.value = false;
  }
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    title: "",
    courseType: "",
    status: undefined,
  };
  getCourseList();
};

// 重置表单
const resetForm = () => {
  form.value = {
    id: undefined,
    title: "",
    description: "",
    courseType: "video", // 默认选择视频课程类型
    price: 0,
    status: false,
    videoUrl: "",
    coverUrl: "",
    organizationId: undefined,
    organizationName: "",
    instructorId: undefined,
    instructorName: "",
    videoDuration: 0,
    isPaid: false,
  };
};

// 打开新增对话框
const handleAdd = () => {
  resetForm();
  dialog.type = "add";
  dialog.title = "新增课程";
  dialog.visible = true;
};

// 打开编辑对话框
const handleEdit = (row: CourseVO) => {
  resetForm(); // 先重置表单

  // 然后将行数据赋值给表单
  form.value = {
    ...form.value, // 保留默认值
    ...row, // 覆盖行数据
    // 确保状态是布尔类型
    status: typeof row.status === "string" ? row.status === "true" : Boolean(row.status),
  };

  dialog.type = "edit";
  dialog.title = "编辑课程";
  dialog.visible = true;
};

// 查看课程详情
const handleView = (row: CourseVO) => {
  router.push(`/course/detail/${row.id}`);
};

// 删除课程
const handleDelete = (row: CourseVO) => {
  ElMessageBox.confirm(`确定要删除课程 ${row.title} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await CourseAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getCourseList();
    } catch (error) {
      console.error("删除课程失败", error);
      ElMessage.error("删除课程失败");
    }
  });
};

// 封面上传成功回调
const handleCoverSuccess = (response: any) => {
  if (response.code === "00000") {
    form.value.coverUrl = response.data;
    ElMessage.success("封面上传成功");
  } else {
    ElMessage.error(response.msg || "封面上传失败");
  }
};

// 封面上传前的校验
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("上传封面只能是图片格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("上传封面大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 视频上传成功回调
const handleVideoSuccess = (response: any) => {
  if (response.code === "00000") {
    form.value.videoUrl = response.data;
    ElMessage.success("视频上传成功");

    // 尝试获取视频时长
    setTimeout(() => {
      const videoElement = document.querySelector("video");
      if (videoElement) {
        videoElement.onloadedmetadata = () => {
          form.value.videoDuration = Math.round(videoElement.duration);
        };
      }
    }, 500);
  } else {
    ElMessage.error(response.msg || "视频上传失败");
  }
};

// 视频上传前的校验
const beforeVideoUpload = (file: File) => {
  const isVideo = file.type.startsWith("video/");
  const isLt100M = file.size / 1024 / 1024 < 100;

  if (!isVideo) {
    ElMessage.error("上传文件只能是视频格式!");
    return false;
  }
  if (!isLt100M) {
    ElMessage.error("上传视频大小不能超过 100MB!");
    return false;
  }

  // 显示上传中提示
  ElMessage.info("视频上传中，请耐心等待...");
  return true;
};

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      // 确保状态是布尔值类型
      if (typeof form.value.status === "string") {
        form.value.status = form.value.status === "true";
      }

      // 新增/更新逻辑
      if (dialog.type === "add") {
        await CourseAPI.create(form.value);
        ElMessage.success("新增成功");
      } else {
        await CourseAPI.update(form.value);
        ElMessage.success("更新成功");
      }
      dialog.visible = false;
      getCourseList();
    } catch (error) {
      console.error("保存课程失败", error);
      ElMessage.error("保存课程失败");
    }
  });
};

// 获取所有讲师列表
const getInstructorList = async () => {
  instructorLoading.value = true;
  try {
    // 使用成员API获取讲师列表
    const result = await MemberAPI.getPage({
      current: 1,
      size: 100, // 获取较多数据
      status: MemberStatusEnum.ENABLED, // 只获取启用状态的成员
    });

    if (result && result.records && result.records.length > 0) {
      instructorList.value = result.records.map((member) => ({
        id: member.id!,
        name: member.name,
        avatar: member.avatar,
      }));
      filteredInstructorList.value = [...instructorList.value];
    }
  } catch (error) {
    console.error("获取讲师列表失败", error);
    ElMessage.error("获取讲师列表失败");
  } finally {
    instructorLoading.value = false;
  }
};

// 获取课程类型标签类型
const getCourseTypeTagType = (type: string) => {
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
const getCourseTypeLabel = (type: string) => {
  const option = courseTypeOptions.find((item) => item.value === type);
  return option ? option.label : "未知";
};

// 格式化时长
const formatDuration = (seconds: number) => {
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

// 初始化
onMounted(() => {
  getCourseList();
  getOrganizationList();
  getInstructorList();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-wrapper {
  margin-bottom: 20px;
}

.data-table__toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.no-image {
  width: 80px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
}

.cover-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cover-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-cover {
  width: 178px;
  height: 100px;
  object-fit: cover;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.duration-tip {
  margin-left: 10px;
  color: #606266;
  font-size: 14px;
}

.price-unit {
  margin-left: 10px;
  color: #606266;
  font-size: 14px;
}

.video-upload-container {
  display: flex;
  align-items: center;
}

.video-upload-divider {
  margin: 0 10px;
  color: #606266;
  font-size: 14px;
}

.video-uploader {
  margin-top: 10px;
}

.video-preview {
  margin-top: 10px;
}
</style>
