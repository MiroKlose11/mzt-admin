<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-suffix=":"
        label-width="auto"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="轮播图标题"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>

        <el-form-item label="位置" prop="position">
          <el-select
            v-model="queryParams.position"
            clearable
            placeholder="全部"
            style="width: 180px"
          >
            <el-option :value="1" label="顶部Banner" />
            <el-option :value="2" label="平台介绍Banner" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" clearable placeholder="全部" style="width: 100px">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery()">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button
            v-hasPerm="['homepage:banner:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            新增轮播图
          </el-button>
          <el-button
            v-hasPerm="['homepage:banner:delete']"
            type="danger"
            :disabled="selectIds.length === 0"
            icon="delete"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="sortedPageData"
        highlight-current-row
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="标题" prop="title" min-width="150" />
        <el-table-column label="图片" align="center" width="120">
          <template #default="scope">
            <div style="width: 100px; height: 60px; position: relative; overflow: hidden">
              <div
                v-if="scope.row.imageUrl"
                :ref="
                  (el) => {
                    if (el) showImage(el, scope.row.imageUrl);
                  }
                "
                style="width: 100%; height: 100%"
              ></div>
              <div v-else class="image-error">
                <el-icon><Picture /></el-icon>
                <span>暂无图片</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="链接" prop="link" min-width="180" />
        <el-table-column align="center" label="位置" width="150" prop="position">
          <template #default="scope">
            <el-tag v-if="scope.row.position === 1" type="primary">顶部Banner</el-tag>
            <el-tag v-else-if="scope.row.position === 2" type="success">平台介绍Banner</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="排序" prop="sort" width="80" />
        <el-table-column align="center" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" prop="createTime" width="160" />
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button
              v-hasPerm="['homepage:banner:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['homepage:banner:delete']"
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery()"
      />
    </el-card>

    <!-- 轮播图表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      top="5vh"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="轮播图标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入轮播图标题" clearable />
        </el-form-item>

        <el-form-item label="轮播图位置" prop="position">
          <el-select v-model="formData.position" placeholder="请选择轮播图位置" style="width: 100%">
            <el-option :value="1" label="顶部Banner" />
            <el-option :value="2" label="平台介绍Banner" />
          </el-select>
        </el-form-item>

        <el-form-item label="图片上传" prop="imageUrl">
          <SingleImageUpload v-model="formData.imageUrl" />
        </el-form-item>

        <el-form-item label="链接地址" prop="link">
          <el-input v-model="formData.link" placeholder="请输入链接地址" clearable />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" controls-position="right" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">确定</el-button>
          <el-button @click="handleCloseDialog()">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Banner",
  inheritAttrs: false,
});

import BannerAPI, { Banner, BannerForm, BannerPageQuery } from "@/api/index/banner.api";
import type { FormInstance } from "element-plus";
import SingleImageUpload from "@/components/Upload/SingleImageUpload.vue";

const queryFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();

const loading = ref(false);
const selectIds = ref<(number | string)[]>([]);
const total = ref(0);

const queryParams = reactive<BannerPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 轮播图表格数据
const pageData = ref<Banner[]>([]);

// 按位置和排序字段排序后的数据
const sortedPageData = computed(() => {
  return [...pageData.value].sort((a, b) => {
    // 首先按position排序
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    // 然后在相同position内按sort排序
    return a.sort - b.sort;
  });
});

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 轮播图表单数据
const formData = reactive<BannerForm>({
  status: 1, // 默认启用
  sort: 0, // 默认排序为0
  position: 1, // 默认位置为顶部Banner
});

// 轮播图表单校验规则
const rules = reactive({
  title: [{ required: true, message: "请输入轮播图标题", trigger: "blur" }],
  position: [{ required: true, message: "请选择轮播图位置", trigger: "change" }],
  imageUrl: [{ required: true, message: "请上传轮播图图片", trigger: "change" }],
});

// 查询轮播图列表
function handleQuery() {
  loading.value = true;
  BannerAPI.getPage(queryParams)
    .then((res) => {
      // 使用新接口返回格式，res就是PageResultBanner对象
      pageData.value = res.records || [];
      total.value = res.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

// 行复选框选中项变化
function handleSelectionChange(selection: Banner[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 打开轮播图弹窗
function handleOpenDialog(id?: string | number) {
  dialog.visible = true;

  if (id) {
    dialog.title = "修改轮播图";
    BannerAPI.getDetail(id).then((res) => {
      // res直接是Banner对象
      Object.assign(formData, res);
    });
  } else {
    dialog.title = "新增轮播图";
    // 重置表单为默认值
    Object.assign(formData, {
      status: 1,
      sort: 0,
      position: 1,
      title: "",
      imageUrl: "",
      link: "",
    });
  }
}

// 更新轮播图状态
function handleStatusChange(row: Banner) {
  const { id, status } = row;
  BannerAPI.updateStatus(id, status)
    .then(() => {
      ElMessage.success(`${status === 1 ? "启用" : "停用"}成功`);
    })
    .catch((error) => {
      // 状态更新失败，回滚UI状态
      row.status = status === 1 ? 0 : 1;
      ElMessage.error(error.message || "操作失败");
    });
}

// 轮播图表单提交
function handleSubmit() {
  dataFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      if (formData.id) {
        BannerAPI.update(formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .catch((error) => {
            ElMessage.error(error.message || "修改失败");
          })
          .finally(() => (loading.value = false));
      } else {
        BannerAPI.create(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleQuery();
          })
          .catch((error) => {
            ElMessage.error(error.message || "新增失败");
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 重置表单
function resetForm() {
  dataFormRef.value?.resetFields();
  dataFormRef.value?.clearValidate();
  formData.id = undefined;
}

// 关闭轮播图弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// 删除轮播图
function handleDelete(id?: number | string) {
  if (!id && (!selectIds.value || selectIds.value.length === 0)) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  // 目前后端接口只支持单个删除
  const deleteId = id || selectIds.value[0];

  ElMessageBox.confirm("确认删除选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    loading.value = true;
    BannerAPI.deleteById(deleteId)
      .then(() => {
        ElMessage.success("删除成功");
        handleQuery();
      })
      .catch((error) => {
        ElMessage.error(error.message || "删除失败");
      })
      .finally(() => (loading.value = false));
  });
}

// 显示图片
function showImage(el: HTMLElement, url: string) {
  if (!url) return;

  el.innerHTML = "";

  const img = document.createElement("img");
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  img.setAttribute("referrerpolicy", "no-referrer");

  img.onerror = () => {
    console.warn("图片加载失败:", url);
    el.innerHTML = `
      <div class="image-error">
        <svg viewBox="0 0 1024 1024" width="24" height="24">
          <path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32z m-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792z m0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2z" fill="currentColor"></path>
          <path d="M304 456c48.6 0 88-39.4 88-88s-39.4-88-88-88-88 39.4-88 88 39.4 88 88 88z m0-128c22.1 0 40 17.9 40 40s-17.9 40-40 40-40-17.9-40-40 17.9-40 40-40z" fill="currentColor"></path>
        </svg>
        <span style="font-size:12px;color:#999;margin-top:4px;">加载失败</span>
      </div>
    `;
  };

  img.onload = () => {
    console.log("图片加载成功:", url);
  };

  img.src = url;
  el.appendChild(img);
}

// 初始化
onMounted(() => {
  handleQuery();
});
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;

  .el-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
}
</style>
