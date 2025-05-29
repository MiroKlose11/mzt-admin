<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成员详情</span>
          <div>
            <el-button :icon="Back" @click="goBack">返回</el-button>
            <el-button type="primary" :icon="Edit" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading">
        <template v-if="loading">
          <div class="loading-wrapper">
            <el-skeleton :rows="6" animated />
          </div>
        </template>
        <template v-else>
          <div class="member-detail">
            <div class="member-header">
              <div class="member-avatar">
                <el-avatar :size="100" :src="member.avatar">
                  {{ member.name ? member.name.substring(0, 1) : "?" }}
                </el-avatar>
              </div>
              <div class="member-info">
                <h2 class="member-name">{{ member.name }}</h2>
                <div class="member-title">{{ member.titleText || "暂无头衔" }}</div>
                <div class="member-meta">
                  <el-tag v-if="member.gender === GenderEnum.MALE" type="primary" size="small">
                    男
                  </el-tag>
                  <el-tag
                    v-else-if="member.gender === GenderEnum.FEMALE"
                    type="danger"
                    size="small"
                  >
                    女
                  </el-tag>
                  <el-tag v-else type="info" size="small">未知</el-tag>
                  <el-tag
                    :type="member.status === MemberStatusEnum.ENABLED ? 'success' : 'danger'"
                    size="small"
                    class="ml-10"
                  >
                    {{ member.status === MemberStatusEnum.ENABLED ? "启用" : "禁用" }}
                  </el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <el-descriptions :column="2" border>
              <el-descriptions-item label="所属机构">
                {{ member.organization || "暂无" }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDateTime(member.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDateTime(member.updatedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="ID">
                {{ member.id }}
              </el-descriptions-item>
              <el-descriptions-item label="角色" :span="2">
                <el-tag
                  v-for="role in member.roles"
                  :key="role.id"
                  class="mr-5"
                  type="info"
                  size="small"
                >
                  {{ role.name }}
                </el-tag>
                <span v-if="!member.roles || member.roles.length === 0">暂无角色</span>
              </el-descriptions-item>
              <el-descriptions-item label="头衔" :span="2">
                <el-tag
                  v-for="title in member.titles"
                  :key="title.id"
                  class="mr-5"
                  type="warning"
                  size="small"
                >
                  {{ title.name }}
                </el-tag>
                <span v-if="!member.titles || member.titles.length === 0">暂无头衔</span>
              </el-descriptions-item>
              <el-descriptions-item label="个人简介" :span="2">
                <div class="member-introduction">
                  {{ member.introduction || "暂无简介" }}
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Back, Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import MemberAPI, { type MemberVO, GenderEnum, MemberStatusEnum } from "@/api/member.api";
import { formatDateTime } from "@/utils/date";

// 状态
const loading = ref(true);
const member = ref<MemberVO>({
  name: "",
  gender: GenderEnum.UNKNOWN,
  status: MemberStatusEnum.ENABLED,
});

const route = useRoute();
const router = useRouter();
const memberId = computed(() => (route.params.id ? Number(route.params.id) : undefined));

// 获取成员详情
const getMemberDetail = async () => {
  if (!memberId.value) {
    ElMessage.error("成员ID不能为空");
    goBack();
    return;
  }

  loading.value = true;
  try {
    const memberData = await MemberAPI.getDetail(memberId.value);
    member.value = memberData;
  } catch (error) {
    console.error("获取成员详情失败", error);
    ElMessage.error("获取成员详情失败");
  } finally {
    loading.value = false;
  }
};

// 返回列表
const goBack = () => {
  router.push("/member");
};

// 编辑成员
const handleEdit = () => {
  if (!memberId.value) return;
  router.push(`/member/edit/${memberId.value}`);
};

// 初始化
onMounted(() => {
  getMemberDetail();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-wrapper {
  padding: 20px;
}

.member-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.member-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.member-avatar {
  margin-right: 20px;
}

.member-info {
  flex: 1;
}

.member-name {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 600;
}

.member-title {
  margin-bottom: 10px;
  font-size: 16px;
  color: #666;
}

.member-meta {
  display: flex;
  gap: 10px;
}

.member-introduction {
  white-space: pre-line;
  line-height: 1.6;
}

.ml-10 {
  margin-left: 10px;
}

.mr-5 {
  margin-right: 5px;
}
</style>
