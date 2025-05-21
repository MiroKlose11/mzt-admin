<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <el-link @click="goBack">
              <el-icon><Back /></el-icon>
              返回列表
            </el-link>
          </div>
          <div>
            <el-button type="primary" @click="editArticle">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-wrapper">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="h1" style="width: 50%" />
            <div style="display: flex; align-items: center; margin: 20px 0">
              <el-skeleton-item variant="text" style="margin-right: 16px" />
              <el-skeleton-item variant="text" style="width: 30%" />
            </div>
            <el-skeleton-item variant="h3" />
            <el-skeleton-item variant="text" style="width: 100%" />
            <el-skeleton-item variant="text" style="width: 100%" />
            <el-skeleton-item variant="text" style="width: 100%" />
          </template>
        </el-skeleton>
      </div>

      <div v-else class="article-preview">
        <h1 class="article-title">{{ article.title }}</h1>

        <div class="article-meta">
          <span>
            <el-tag size="small">{{ getChannelName(article.channelId) }}</el-tag>
          </span>
          <span>发布时间：{{ formatDate(article.publishtime || article.createtime) }}</span>
          <span>浏览：{{ article.views || 0 }}</span>
          <span>
            <el-tag :type="getStatusTagType(article.status)" size="small">
              {{ getStatusText(article.status) }}
            </el-tag>
          </span>
        </div>

        <div v-if="article.coverImage" class="article-cover">
          <el-image
            :src="article.coverImage"
            fit="cover"
            :preview-src-list="[article.coverImage]"
          />
        </div>

        <div class="article-description">
          <blockquote>{{ article.description }}</blockquote>
        </div>

        <div class="article-content">
          <div v-html="articleContent"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Back, Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import ArticleAPI, { type ArticleVO, ArticleStatusEnum } from "@/api/article.api";

// 状态
const loading = ref(true);
const article = ref<ArticleVO>({
  title: "",
  description: "",
  weight: 0,
  status: ArticleStatusEnum.DRAFT,
  isGuestVisible: 1,
});
const articleContent = ref("");
const route = useRoute();
const router = useRouter();
const articleId = computed(() => (route.params.id ? Number(route.params.id) : undefined));

// 栏目选项（实际项目中应该从后端获取）
const channelOptions = [
  { label: "公司新闻", value: 1 },
  { label: "行业动态", value: 2 },
  { label: "技术分享", value: 3 },
];

// 获取栏目名称
const getChannelName = (channelId?: number) => {
  if (!channelId) return "-";
  const channel = channelOptions.find((item) => item.value === channelId);
  return channel ? channel.label : "-";
};

// 获取状态文本
const getStatusText = (status: number) => {
  switch (status) {
    case ArticleStatusEnum.DRAFT:
      return "草稿";
    case ArticleStatusEnum.PENDING:
      return "待审核";
    case ArticleStatusEnum.PUBLISHED:
      return "已发布";
    case ArticleStatusEnum.REJECTED:
      return "已驳回";
    default:
      return "未知";
  }
};

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  switch (status) {
    case ArticleStatusEnum.DRAFT:
      return "info";
    case ArticleStatusEnum.PENDING:
      return "warning";
    case ArticleStatusEnum.PUBLISHED:
      return "success";
    case ArticleStatusEnum.REJECTED:
      return "danger";
    default:
      return "info";
  }
};

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString();
  } catch (_e) {
    void _e;
    return dateStr;
  }
};

// 获取文章详情
const getArticleDetail = async () => {
  if (!articleId.value) {
    ElMessage.error("文章ID不能为空");
    goBack();
    return;
  }

  loading.value = true;
  try {
    // 获取文章详情
    const articleData = await ArticleAPI.getDetail(articleId.value);
    article.value = articleData;
    // 获取文章内容
    getArticleContent();
  } catch (error) {
    console.error("获取文章详情失败", error);
    ElMessage.error("获取文章详情失败");

    // 仅在开发环境下使用模拟数据
    if (import.meta.env.DEV && articleId.value === 1) {
      article.value = {
        id: 1,
        title: "这是一篇测试文章标题，内容非常丰富多彩",
        coverImage: "https://placeholder.pics/svg/800x400",
        description:
          "这是文章的简介，简要说明文章的内容和重点。读者可以通过文章简介快速了解文章大意，决定是否继续阅读。本文将详细介绍相关技术和应用场景，适合对该领域感兴趣的读者阅读。",
        weight: 10,
        status: ArticleStatusEnum.PUBLISHED,
        isGuestVisible: 1,
        channelId: 1,
        views: 156,
        createtime: "2023-08-01T12:00:00",
        updatetime: "2023-08-01T15:30:00",
        publishtime: "2023-08-01T16:00:00",
      };
      articleContent.value = `
        <p>这是文章的正文内容，支持富文本编辑。</p>
        <p>你可以添加<strong>粗体</strong>、<em>斜体</em>等格式。</p>
        <h2>这是二级标题</h2>
        <p>这里是正文内容，可以包含多种格式和样式。</p>
        <blockquote>这是一段引用文字，可以用来突出重要内容。</blockquote>
        <p>下面是一张图片：</p>
        <p><img src="https://placeholder.pics/svg/640x360" alt="示例图片"></p>
        <h3>这是三级标题</h3>
        <ul>
          <li>列表项目1</li>
          <li>列表项目2</li>
          <li>列表项目3</li>
        </ul>
        <p>以上就是富文本编辑器的基本使用示例。</p>
      `;
    }
  } finally {
    loading.value = false;
  }
};

// 获取文章内容
const getArticleContent = async () => {
  if (!articleId.value) return;

  try {
    const contentData = await ArticleAPI.getContent(articleId.value);
    articleContent.value = contentData.content || "";
  } catch (error) {
    console.error("获取文章内容失败", error);
    ElMessage.error("获取文章内容失败");
  }
};

// 返回列表
const goBack = () => {
  router.push("/article");
};

// 编辑文章
const editArticle = () => {
  if (!articleId.value) return;
  router.push(`/article/edit/${articleId.value}`);
};

// 初始化
onMounted(() => {
  getArticleDetail();
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
.article-preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.article-title {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
}
.article-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}
.article-cover {
  margin-bottom: 20px;
  text-align: center;
}
.article-cover img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}
.article-description {
  margin-bottom: 30px;
}
.article-description blockquote {
  margin: 0;
  padding: 10px 20px;
  background-color: #f5f7fa;
  border-left: 4px solid #dcdfe6;
  color: #666;
}
.article-content {
  line-height: 1.8;
}
/* 使富文本内容样式生效 */
:deep(img) {
  max-width: 100%;
  height: auto;
}
:deep(h1, h2, h3, h4, h5, h6) {
  margin-top: 24px;
  margin-bottom: 16px;
}
:deep(blockquote) {
  padding: 10px 20px;
  margin: 0 0 20px;
  border-left: 4px solid #dcdfe6;
  background-color: #f5f7fa;
}
:deep(pre) {
  background-color: #f5f7fa;
  padding: 16px;
  overflow: auto;
  border-radius: 4px;
}
:deep(table) {
  border-collapse: collapse;
  margin-bottom: 16px;
  width: 100%;
}
:deep(table, th, td) {
  border: 1px solid #dcdfe6;
  padding: 8px;
}
</style>
