<template>
  <div class="app-container">
    <el-card class="article-card">
      <!-- 导航标签 -->
      <el-tabs v-model="activeTab" class="article-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="100px"
            class="article-form"
          >
            <div class="form-layout">
              <!-- 左侧基本信息 -->
              <div class="left-panel">
                <el-form-item label="文章标题" prop="title" class="form-item-spacing">
                  <el-input
                    v-model="formData.title"
                    placeholder="请输入文章标题"
                    maxlength="100"
                    show-word-limit
                    class="title-input"
                  />
                </el-form-item>

                <el-form-item label="所属栏目" prop="channelId" class="form-item-spacing">
                  <el-select
                    v-model="formData.channelId"
                    placeholder="请选择栏目"
                    class="full-width"
                    @change="handleChannelChange"
                  >
                    <el-option
                      v-for="item in channelOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="文章简介" class="form-item-spacing">
                  <el-input
                    v-model="formData.description"
                    type="textarea"
                    placeholder="请输入文章简介"
                    :rows="4"
                    maxlength="500"
                    show-word-limit
                    class="description-input"
                  />
                </el-form-item>

                <el-form-item label="封面图片" class="form-item-spacing">
                  <div class="cover-uploader" @click="handleCoverClick">
                    <div v-if="!formData.coverImage" class="upload-container">
                      <div class="upload-placeholder">
                        <el-icon class="cover-uploader-icon"><Plus /></el-icon>
                        <div class="upload-text">点击上传封面图片</div>
                      </div>
                    </div>
                    <img v-else :src="formData.coverImage" class="cover-image" />
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/*"
                      style="display: none"
                      @change="handleCoverChange"
                    />
                  </div>
                  <div class="el-upload__tip">支持 JPG、PNG 格式，建议尺寸 16:9，不超过 2MB</div>
                </el-form-item>
              </div>

              <!-- 右侧相关信息 -->
              <div class="right-panel">
                <div class="side-panel-title">相关信息</div>

                <el-form-item label="浏览" class="form-item-spacing">
                  <div class="stat-item">
                    <el-input v-model.number="formData.views" type="number" class="stat-value" />
                    <el-icon class="stat-icon"><View /></el-icon>
                  </div>
                </el-form-item>

                <el-form-item label="评论" class="form-item-spacing">
                  <div class="stat-item">
                    <el-input v-model.number="formData.comments" type="number" class="stat-value" />
                    <el-icon class="stat-icon"><ChatDotRound /></el-icon>
                  </div>
                </el-form-item>

                <el-form-item label="点赞" class="form-item-spacing">
                  <div class="stat-item">
                    <el-input v-model.number="formData.likes" type="number" class="stat-value" />
                    <el-icon class="stat-icon"><Pointer /></el-icon>
                  </div>
                </el-form-item>

                <el-form-item label="权重" class="form-item-spacing">
                  <el-input-number
                    v-model="formData.weight"
                    :min="0"
                    :max="100"
                    class="full-width"
                  />
                  <div class="form-tip">数值越大，排序越靠前</div>
                </el-form-item>

                <div class="side-panel-title">文章状态</div>

                <el-form-item label="状态" class="form-item-spacing">
                  <el-radio-group v-model="formData.status">
                    <el-radio :value="0">草稿</el-radio>
                    <el-radio :value="1">待审核</el-radio>
                    <el-radio :value="2">已发布</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="访客访问" class="form-item-spacing">
                  <el-switch
                    v-model="formData.isGuestVisible"
                    :active-value="1"
                    :inactive-value="0"
                    active-text="允许"
                    inactive-text="不允许"
                  />
                  <div class="form-tip">是否允许未登录用户查看该文章</div>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </el-tab-pane>

        <!-- 文章内容 -->
        <el-tab-pane label="文章内容" name="content">
          <div class="rich-editor-container">
            <WangEditor v-model="articleContent" :height="editorHeight" />
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部按钮 -->
      <div class="form-footer">
        <el-button plain @click="cancel">返回</el-button>
        <el-button type="primary" @click="submitAndReturn">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
        <el-button type="success" @click="publishAndReturn">
          <el-icon><Upload /></el-icon>
          发布并返回
        </el-button>
        <el-button type="info" @click="saveDraftAndReturn">
          <el-icon><Document /></el-icon>
          保存为草稿
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElForm } from "element-plus";
import ArticleAPI, {
  type ArticleForm,
  ArticleStatusEnum,
  GuestVisibleEnum,
  AuthorTypeEnum,
} from "@/api/article.api";
import FileAPI from "@/api/file.api";
import {
  Plus,
  Document,
  Check,
  Upload,
  View,
  ChatDotRound,
  Pointer,
} from "@element-plus/icons-vue";
import WangEditor from "@/components/WangEditor/index.vue";
import { useUserStore } from "@/store/modules/user.store";

const BASE_API = import.meta.env.VITE_BASE_API || "";
const fileInputRef = ref<HTMLInputElement | null>(null);

const formRef = ref<InstanceType<typeof ElForm>>();
const activeTab = ref("basic");
const articleContent = ref("");
const route = useRoute();
const router = useRouter();
const articleId = computed(() => (route.params.id ? Number(route.params.id) : undefined));
const editorHeight = ref("500px");

const userStore = useUserStore();
const currentUserId = computed(() => {
  const userId = userStore.userInfo?.userId;
  return userId ? Number(userId) : undefined;
});

const formData = ref<
  ArticleForm & {
    views?: number;
    likes?: number;
    comments?: number;
  }
>({
  title: "",
  coverImage: "",
  description: "",
  weight: 0,
  status: ArticleStatusEnum.DRAFT,
  isGuestVisible: GuestVisibleEnum.VISIBLE,
  channelId: undefined,
  authorId: undefined,
  authorType: AuthorTypeEnum.ADMIN,
  views: 0,
  likes: 0,
  comments: 0,
});

const channelOptions = [
  { label: "公司新闻", value: 1 },
  { label: "行业动态", value: 2 },
  { label: "技术分享", value: 3 },
];

const rules = {
  title: [
    { required: true, message: "请输入文章标题", trigger: "blur" },
    { min: 2, max: 100, message: "标题长度在 2 到 100 个字符之间", trigger: "blur" },
  ],
  channelId: [{ required: true, message: "请选择所属栏目", trigger: "change" }],
};

const getArticleDetail = async () => {
  if (!articleId.value) return;

  try {
    const articleData = await ArticleAPI.getDetail(articleId.value);
    formData.value = {
      id: articleData.id,
      title: articleData.title,
      coverImage: articleData.coverImage || "",
      description: articleData.description || "",
      weight: articleData.weight || 0,
      status: articleData.status,
      isGuestVisible: articleData.isGuestVisible,
      channelId: articleData.channelId,
      authorId: articleData.authorId,
      authorType: articleData.authorType,
      views: articleData.views || 0,
      likes: articleData.likes || 0,
      comments: articleData.comments || 0,
    };

    getArticleContent();
  } catch (error) {
    console.error("获取文章详情失败", error);
    ElMessage.error("获取文章详情失败");

    if (import.meta.env.DEV && articleId.value === 1) {
      formData.value = {
        id: 1,
        title: "这是一篇测试文章标题，内容非常丰富多彩",
        coverImage: "https://placeholder.pics/svg/300x200",
        description: "这是文章的简介，简要说明文章的内容和重点",
        weight: 10,
        status: ArticleStatusEnum.PUBLISHED,
        isGuestVisible: GuestVisibleEnum.VISIBLE,
        channelId: 1,
        authorId: currentUserId.value,
        authorType: AuthorTypeEnum.ADMIN,
        views: 0,
        likes: 0,
        comments: 0,
      };
      articleContent.value =
        "<p>这是文章的正文内容，支持富文本编辑。</p><p>你可以添加<strong>粗体</strong>、<em>斜体</em>等格式。</p><p>还可以插入图片、表格等内容。</p>";
    }
  }
};

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

const setAuthorInfo = () => {
  if (!formData.value.authorId) {
    formData.value.authorId = currentUserId.value;
    formData.value.authorType = AuthorTypeEnum.ADMIN;
  }
};

const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!articleContent.value.trim()) {
        activeTab.value = "content";
        ElMessage.warning("请填写文章内容");
        return;
      }

      setAuthorInfo();

      try {
        let articleId;
        if (formData.value.id) {
          await ArticleAPI.update(formData.value);
          articleId = formData.value.id;
        } else {
          const result = await ArticleAPI.create(formData.value);
          articleId = result.id;
        }

        if (articleId) {
          await ArticleAPI.saveContent(articleId, articleContent.value);
          ElMessage.success("保存成功");

          if (!formData.value.id) {
            router.replace(`/article/edit/${articleId}`);
          }
        }
      } catch (error) {
        console.error("保存失败", error);
        ElMessage.error("保存失败");

        if (import.meta.env.DEV) {
          ElMessage.success("保存成功");
          if (!articleId.value) {
            router.replace("/article/edit/999");
          }
        }
      }
    } else {
      activeTab.value = "basic";
    }
  });
};

const submitAndReturn = async () => {
  await submitForm();
  router.push("/article");
};

const publishAndReturn = async () => {
  if (!articleId.value) {
    ElMessage.warning("请先保存文章");
    return;
  }

  formData.value.status = ArticleStatusEnum.PUBLISHED;
  setAuthorInfo();
  await submitForm();
  router.push("/article");
};

const saveDraftAndReturn = async () => {
  formData.value.status = ArticleStatusEnum.DRAFT;
  await submitForm();
  router.push("/article");
};

const cancel = () => {
  router.push("/article");
};

// 点击封面图区域触发文件选择
function handleCoverClick() {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
}

// 处理封面图片变更
function handleCoverChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      ElMessage.error("只支持 JPG、PNG 格式的图片");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      ElMessage.error("图片大小不能超过 2MB");
      return;
    }

    // 显示上传中提示
    const loadingMsg = ElMessage({
      message: "上传中...",
      duration: 0,
      type: "info",
    });

    // 使用FileAPI上传文件
    FileAPI.uploadFile(file)
      .then((result) => {
        formData.value.coverImage = result.url;
        ElMessage.success("上传成功");
      })
      .catch((error) => {
        console.error("上传失败", error);
        ElMessage.error("上传失败");
      })
      .finally(() => {
        loadingMsg.close();
        if (fileInputRef.value) {
          fileInputRef.value.value = "";
        }
      });
  }
}

// 处理栏目变更
function handleChannelChange() {
  // 实现栏目变更后的逻辑
}

// 计算编辑器高度，使其动态适应窗口大小
const updateEditorHeight = () => {
  // 减去顶部和底部的空间，留出足够位置显示底部按钮
  const availableHeight = window.innerHeight - 350;
  editorHeight.value = `${Math.max(300, availableHeight)}px`;
};

onMounted(() => {
  if (articleId.value) {
    getArticleDetail();
  }

  // 初始化编辑器高度
  updateEditorHeight();
  // 监听窗口大小变化，动态调整编辑器高度
  window.addEventListener("resize", updateEditorHeight);
});

onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener("resize", updateEditorHeight);
});
</script>

<style scoped>
.app-container {
  padding-top: 0;
}

.article-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.title-area {
  display: flex;
  align-items: center;
}

.icon-doc {
  font-size: 22px;
  margin-right: 8px;
  color: var(--el-color-primary);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.article-tabs {
  margin-top: 0;
}

.form-layout {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.left-panel {
  flex: 2;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.right-panel {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.side-panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.form-item-spacing {
  margin-bottom: 22px;
}

.title-input,
.description-input,
.full-width {
  width: 100%;
}

.rich-editor-container {
  max-width: 900px;
  margin: 0 auto;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background-color: #fff;
  z-index: 1;
}

.cover-uploader {
  width: 320px;
  height: 180px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.upload-container {
  width: 100%;
  height: 100%;
}

.cover-uploader:hover {
  border-color: var(--el-color-primary);
}

.upload-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
}

.cover-uploader-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  text-align: center;
  width: 100%;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
}

.cover-image:hover::after {
  content: "点击更换图片";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.weight-input {
  width: 120px;
}

.article-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-label {
  width: 80px;
  flex-shrink: 0;
}

.stat-value {
  width: 120px;
}

.stat-icon {
  margin-left: 10px;
  font-size: 20px;
  color: var(--el-color-primary);
}
</style>
