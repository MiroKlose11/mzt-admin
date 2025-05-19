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
        <el-form-item label="分类类型" prop="type">
          <el-select v-model="queryParams.type" clearable placeholder="全部" style="width: 180px">
            <el-option
              v-for="(label, value) in categoryTypeMap"
              :key="value"
              :value="value"
              :label="label"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" clearable placeholder="全部" style="width: 100px">
            <el-option :value="1" label="启用" />
            <el-option :value="0" label="禁用" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleSearch()">搜索</el-button>
          <el-button icon="refresh" @click="handleResetSearch()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button
            v-hasPerm="['homepage:category:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            新增分类
          </el-button>
          <el-button
            v-hasPerm="['homepage:category:delete']"
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
        :data="currentPageData"
        highlight-current-row
        class="data-table__content"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="分类名称" prop="name" min-width="150" />
        <el-table-column label="图片" align="center" width="100">
          <template #default="scope">
            <div style="width: 60px; height: 60px; position: relative; overflow: hidden">
              <el-image
                v-if="scope.row.icon"
                :src="scope.row.icon"
                style="width: 100%; height: 100%"
                fit="cover"
              />
              <div v-else class="image-error">
                <el-icon><Picture /></el-icon>
                <span>暂无图片</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="分类类型" min-width="150">
          <template #default="scope">
            {{ categoryTypeMap[scope.row.categoryType] || scope.row.categoryType }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="描述" prop="description" min-width="180" />
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
              v-hasPerm="['homepage:category:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['homepage:category:delete']"
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
        v-model:page="currentPage"
        v-model:limit="pageSize"
        :total="total"
        @pagination="handlePageChange"
      />
    </el-card>

    <!-- 分类表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      top="5vh"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" clearable />
        </el-form-item>

        <el-form-item label="分类类型" prop="categoryType">
          <el-select
            v-model="formData.categoryType"
            placeholder="请选择分类类型"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="(label, value) in categoryTypeMap"
              :key="value"
              :value="value"
              :label="label"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="图片上传" prop="icon">
          <SingleImageUpload v-model="formData.icon" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请输入分类描述"
            type="textarea"
            :rows="3"
          />
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
  name: "Category",
  inheritAttrs: false,
});

import CategoryAPI, {
  CategoryItem,
  CategoryForm,
  categoryTypeMap,
  categoryTypePriority,
} from "@/api/index/category.api";
import type { FormInstance } from "element-plus";
import SingleImageUpload from "@/components/Upload/SingleImageUpload.vue";

const queryFormRef = ref<FormInstance>();
const dataFormRef = ref<FormInstance>();

const loading = ref(false);
const selectIds = ref<(number | string)[]>([]);
const total = ref(0);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 查询参数
const queryParams = reactive({
  type: "",
  status: undefined as number | undefined,
});

// 所有分类数据
const allData = ref<CategoryItem[]>([]);

// 筛选后的数据
const filteredData = computed(() => {
  return allData.value.filter((item) => {
    // 类型筛选
    if (queryParams.type && item.categoryType !== queryParams.type) {
      return false;
    }
    // 状态筛选
    if (queryParams.status !== undefined && item.status !== queryParams.status) {
      return false;
    }
    return true;
  });
});

// 排序后的数据
const sortedData = computed(() => {
  return [...filteredData.value].sort((a, b) => {
    // 首先按categoryType优先级排序
    const typeA = categoryTypePriority[a.categoryType] || 999;
    const typeB = categoryTypePriority[b.categoryType] || 999;

    if (typeA !== typeB) {
      return typeA - typeB;
    }

    // 然后在相同categoryType内按sort排序
    return (a.sort || 0) - (b.sort || 0);
  });
});

// 当前页数据
const currentPageData = computed(() => {
  if (sortedData.value.length === 0) {
    return [];
  }

  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;

  // 确保start不会小于0
  const validStart = Math.max(0, start);

  return sortedData.value.slice(validStart, end);
});

// 监听分页大小变化，调整当前页
watch(pageSize, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    // 当每页条数变化时，重新计算当前页，保持数据位置
    const currentIndex = (currentPage.value - 1) * oldVal;
    currentPage.value = Math.floor(currentIndex / newVal) + 1;
  }
});

// 更新筛选后的数据总数
watch(
  filteredData,
  (newVal) => {
    total.value = newVal.length;

    // 如果当前页超出最大页数，重置为第一页
    const maxPage = Math.ceil(total.value / pageSize.value) || 1;
    if (currentPage.value > maxPage) {
      currentPage.value = 1;
    }
  },
  { immediate: true }
);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 分类表单数据
const formData = reactive<CategoryForm>({
  status: 1, // 默认启用
  sort: 0, // 默认排序为0
});

// 分类表单校验规则
const rules = reactive({
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  categoryType: [{ required: true, message: "请选择分类类型", trigger: "change" }],
  icon: [{ required: true, message: "请上传分类图片", trigger: "change" }],
});

// 初始化加载数据
onMounted(() => {
  loadData();
});

// 加载所有分类数据
function loadData() {
  loading.value = true;
  CategoryAPI.getList()
    .then((res) => {
      allData.value = res || [];
      // 计算总数
      total.value = filteredData.value.length;
      // 如果当前页超出了总页数，重置为第一页
      const maxPage = Math.ceil(total.value / pageSize.value) || 1;
      if (currentPage.value > maxPage) {
        currentPage.value = 1;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

// 监听筛选条件变化，重新计算总数和当前页
watch(
  [() => queryParams.type, () => queryParams.status],
  () => {
    // 重置为第一页
    currentPage.value = 1;
  },
  { deep: true }
);

// 搜索
function handleSearch() {
  // 重置为第一页
  currentPage.value = 1;
}

// 重置搜索
function handleResetSearch() {
  queryFormRef.value?.resetFields();
  queryParams.type = "";
  queryParams.status = undefined;
  currentPage.value = 1;
}

// 页码变化
function handlePageChange(val: { page: number; limit: number }) {
  // 当分页变化时，更新当前页数据
  console.log("分页变化:", val);
}

// 行复选框选中项变化
function handleSelectionChange(selection: CategoryItem[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 打开分类弹窗
function handleOpenDialog(id?: string | number) {
  dialog.visible = true;

  if (id) {
    dialog.title = "修改分类";
    const item = allData.value.find((item) => item.id === id);
    if (item) {
      Object.assign(formData, item);
    } else {
      CategoryAPI.getDetail(id).then((res) => {
        Object.assign(formData, res);
      });
    }
  } else {
    dialog.title = "新增分类";
    // 重置表单为默认值
    Object.assign(formData, {
      status: 1,
      sort: 0,
      name: "",
      icon: "",
      categoryType: "",
      description: "",
    });
  }
}

// 更新分类状态
function handleStatusChange(row: CategoryItem) {
  const { id, status } = row;
  CategoryAPI.updateStatus(id, status)
    .then(() => {
      ElMessage.success(`${status === 1 ? "启用" : "停用"}成功`);
      // 更新本地数据
      const index = allData.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        allData.value[index].status = status;
      }
    })
    .catch((error) => {
      // 状态更新失败，回滚UI状态
      row.status = status === 1 ? 0 : 1;
      ElMessage.error(error.message || "操作失败");
    });
}

// 分类表单提交
function handleSubmit() {
  dataFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true;
      if (formData.id) {
        CategoryAPI.update(formData)
          .then((res) => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            // 更新本地数据
            const index = allData.value.findIndex((item) => item.id === formData.id);
            if (index !== -1) {
              allData.value[index] = { ...allData.value[index], ...res };
            } else {
              loadData(); // 如果找不到，重新加载所有数据
            }
          })
          .catch((error) => {
            ElMessage.error(error.message || "修改失败");
          })
          .finally(() => (loading.value = false));
      } else {
        CategoryAPI.create(formData)
          .then((res) => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            // 添加到本地数据
            allData.value.push(res);
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

// 关闭分类弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

// 删除分类
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
    CategoryAPI.deleteById(deleteId)
      .then(() => {
        ElMessage.success("删除成功");
        // 更新本地数据
        allData.value = allData.value.filter((item) => item.id !== deleteId);
        selectIds.value = selectIds.value.filter((item) => item !== deleteId);
      })
      .catch((error) => {
        ElMessage.error(error.message || "删除失败");
      })
      .finally(() => (loading.value = false));
  });
}
</script>

<style lang="scss" scoped>
.search-container {
  margin-bottom: 20px;
  padding: 18px 20px 0;
  background-color: var(--el-fill-color-blank);
  border-radius: 4px;
}

.search-buttons {
  margin-right: 0;
}

.data-table {
  &__toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__content {
    width: 100%;
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color-light);
  border-radius: 4px;

  .el-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  span {
    font-size: 12px;
  }
}
</style>
