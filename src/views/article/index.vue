<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文章列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" label-width="80px" inline>
          <el-form-item label="文章标题">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入文章标题"
              clearable
              style="width: 240px"
              @keyup.enter="getArticleList"
            />
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
          <el-form-item label="栏目">
            <el-select
              v-model="queryParams.channelId"
              placeholder="请选择栏目"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in channelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="getArticleList">查询</el-button>
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
      <el-table v-loading="loading" :data="articleList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="channelId" label="栏目" width="120" align="center">
          <template #default="scope">
            {{ getChannelName(scope.row.channelId || 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="scope">
            <el-tag
              :type="
                scope.row.status === ArticleStatusEnum.PUBLISHED
                  ? 'success'
                  : scope.row.status === ArticleStatusEnum.PENDING
                    ? 'warning'
                    : scope.row.status === ArticleStatusEnum.REJECTED
                      ? 'danger'
                      : 'info'
              "
            >
              {{
                scope.row.status === ArticleStatusEnum.PUBLISHED
                  ? "已发布"
                  : scope.row.status === ArticleStatusEnum.PENDING
                    ? "待审核"
                    : scope.row.status === ArticleStatusEnum.REJECTED
                      ? "已驳回"
                      : "草稿"
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="权重" width="80" align="center" />
        <el-table-column prop="views" label="浏览量" width="80" align="center" />
        <el-table-column label="创建时间" width="180" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createtime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button link type="primary" size="small" @click="handlePreview(scope.row)">
              预览
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import ArticleAPI, { type ArticleQuery, ArticleStatusEnum } from "@/api/article.api";
import { formatDateTime } from "@/utils/date";

// 定义接口
interface ArticleData {
  id?: number;
  title: string;
  coverImage?: string;
  description?: string;
  weight?: number;
  status: number;
  isGuestVisible?: number;
  channelId?: number;
  authorId?: number;
  authorType?: number;
  views?: number;
  likes?: number;
  comments?: number;
  createtime?: string;
  updatetime?: string;
}

// 状态选项
const statusOptions = [
  { label: "草稿", value: ArticleStatusEnum.DRAFT },
  { label: "待审核", value: ArticleStatusEnum.PENDING },
  { label: "已发布", value: ArticleStatusEnum.PUBLISHED },
  { label: "已驳回", value: ArticleStatusEnum.REJECTED },
];

// 栏目选项（实际项目中应该从后端获取）
const channelOptions = [
  { label: "公司新闻", value: 1 },
  { label: "行业动态", value: 2 },
  { label: "技术分享", value: 3 },
];

// 获取栏目名称
const getChannelName = (channelId: number) => {
  const channel = channelOptions.find((item) => item.value === channelId);
  return channel ? channel.label : "-";
};

// 状态
const router = useRouter();
const loading = ref(false);
const articleList = ref<ArticleData[]>([]);
const total = ref(0);

// 查询参数
const queryParams = ref<ArticleQuery>({
  current: 1,
  size: 10,
});

// 获取文章列表
const getArticleList = async () => {
  loading.value = true;
  try {
    const result = await ArticleAPI.getPage(queryParams.value);
    articleList.value = result.records || [];
    total.value = result.total || 0;
  } catch (error) {
    console.error("获取文章列表失败", error);
    ElMessage.error("获取文章列表失败");
  } finally {
    loading.value = false;
  }
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    current: 1,
    size: 10,
  };
  getArticleList();
};

// 新增文章
const handleAdd = () => {
  router.push("/article/edit");
};

// 编辑文章
const handleEdit = (row: ArticleData) => {
  router.push(`/article/edit/${row.id}`);
};

// 预览文章
const handlePreview = (row: ArticleData) => {
  router.push(`/article/preview/${row.id}`);
};

// 删除文章
const handleDelete = (row: ArticleData) => {
  ElMessageBox.confirm(`确认删除文章"${row.title}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      if (row.id) {
        try {
          await ArticleAPI.delete(row.id);
          ElMessage.success("删除成功");
          getArticleList();
        } catch (error) {
          console.error("删除失败", error);
          ElMessage.error("删除失败");

          // 开发环境模拟成功
          if (import.meta.env.DEV) {
            ElMessage.success("删除成功");
            getArticleList();
          }
        }
      }
    })
    .catch(() => {});
};

// 分页事件
const handleSizeChange = (size: number) => {
  queryParams.value.size = size;
  getArticleList();
};

const handleCurrentChange = (current: number) => {
  queryParams.value.current = current;
  getArticleList();
};

onMounted(() => {
  getArticleList();
});
</script>

<style scoped>
.app-container {
  padding: 20px;
}

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

.data-table__toolbar--actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
