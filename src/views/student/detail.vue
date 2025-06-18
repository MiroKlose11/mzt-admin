<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学员详情</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-descriptions v-loading="loading" title="学员信息" :column="2" border>
        <el-descriptions-item label="头像">
          <el-avatar :size="80" :src="studentInfo.avatar">
            {{ studentInfo.name ? studentInfo.name.substring(0, 1) : "?" }}
          </el-avatar>
        </el-descriptions-item>
        <el-descriptions-item label="姓名">{{ studentInfo.name || "-" }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <el-tag v-if="studentInfo.gender === GenderEnum.MALE" type="primary" size="small">
            男
          </el-tag>
          <el-tag v-else-if="studentInfo.gender === GenderEnum.FEMALE" type="danger" size="small">
            女
          </el-tag>
          <el-tag v-else type="info" size="small">未知</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="所属机构">
          {{ studentInfo.organizationName || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            :type="studentInfo.status === StudentStatusEnum.ENABLED ? 'success' : 'danger'"
            size="small"
          >
            {{ studentInfo.status === StudentStatusEnum.ENABLED ? "启用" : "禁用" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDateTime(studentInfo.createdAt) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ formatDateTime(studentInfo.updatedAt) || "-" }}
        </el-descriptions-item>
        <el-descriptions-item label="用户ID">
          {{ studentInfo.userId || "未绑定" }}
        </el-descriptions-item>
        <el-descriptions-item label="个性签名" :span="2">
          {{ studentInfo.signature || "-" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import StudentAPI, { type StudentVO, GenderEnum, StudentStatusEnum } from "@/api/student.api";
import { formatDateTime } from "@/utils/date";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const studentInfo = ref<StudentVO>({
  name: "",
});

// 获取学生详情
const getStudentDetail = async () => {
  const id = Number(route.params.id);
  if (!id) {
    ElMessage.error("学员ID不能为空");
    return;
  }

  loading.value = true;
  try {
    const result = await StudentAPI.getDetail(id);
    studentInfo.value = result;
  } catch (error) {
    console.error("获取学员详情失败", error);
    ElMessage.error("获取学员详情失败");
  } finally {
    loading.value = false;
  }
};

// 返回列表
const goBack = () => {
  router.push("/student");
};

onMounted(() => {
  getStudentDetail();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
