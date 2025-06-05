<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>机构类型列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" label-width="80px" inline>
          <el-form-item label="名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入类型名称"
              clearable
              style="width: 240px"
              @keyup.enter="getTypeList"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="getTypeList">查询</el-button>
            <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增类型</el-button>
        </div>
      </div>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="typeList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="类型编码" width="120" show-overflow-tooltip />
        <el-table-column prop="name" label="类型名称" min-width="150" show-overflow-tooltip />
        <el-table-column
          prop="description"
          label="类型说明"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="createdAt" label="创建时间" width="150" align="center">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 机构类型表单对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
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
        <el-form-item label="类型编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入类型编码" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型说明">
          <el-input v-model="form.description" type="textarea" placeholder="请输入类型说明" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
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
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import OrganizationTypeAPI, {
  type OrganizationTypeDTO,
  type OrganizationTypeVO,
} from "@/api/organizationType.api";
import { formatDateTime } from "@/utils/date";

// 状态
const loading = ref(false);
const typeList = ref<OrganizationTypeVO[]>([]);

// 查询参数
const queryParams = reactive({
  name: "",
});

// 表单对话框
const dialog = reactive({
  visible: false,
  title: "",
  type: "add", // add: 新增, edit: 编辑
});

// 表单对象
const formRef = ref();
const form = reactive<OrganizationTypeDTO>({
  code: "",
  name: "",
  description: "",
  sort: 0,
});

// 表单校验规则
const rules = {
  code: [{ required: true, message: "请输入类型编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入类型名称", trigger: "blur" }],
};

// 获取机构类型列表
const getTypeList = async () => {
  loading.value = true;
  try {
    const result = await OrganizationTypeAPI.getList();
    typeList.value = result || [];
    console.log("机构类型列表:", typeList.value);
  } catch (error) {
    console.error("获取机构类型列表失败", error);
    ElMessage.error("获取机构类型列表失败");
  } finally {
    loading.value = false;
  }
};

// 重置查询
const resetQuery = () => {
  queryParams.name = "";
  getTypeList();
};

// 新增机构类型
const handleAdd = () => {
  resetForm();
  dialog.title = "新增机构类型";
  dialog.type = "add";
  dialog.visible = true;
};

// 编辑机构类型
const handleEdit = async (row: OrganizationTypeVO) => {
  resetForm();
  dialog.title = "编辑机构类型";
  dialog.type = "edit";

  try {
    const typeDetail = await OrganizationTypeAPI.getDetail(row.id!);
    Object.assign(form, typeDetail);
    dialog.visible = true;
  } catch (error) {
    console.error("获取机构类型详情失败", error);
    ElMessage.error("获取机构类型详情失败");
  }
};

// 删除机构类型
const handleDelete = (row: OrganizationTypeVO) => {
  ElMessageBox.confirm(`确定要删除机构类型 ${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await OrganizationTypeAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getTypeList();
    } catch (error) {
      console.error("删除机构类型失败", error);
      ElMessage.error("删除机构类型失败");
    }
  });
};

// 重置表单
const resetForm = () => {
  form.id = undefined;
  form.code = "";
  form.name = "";
  form.description = "";
  form.sort = 0;
};

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      if (dialog.type === "add") {
        await OrganizationTypeAPI.create(form);
        ElMessage.success("新增成功");
      } else {
        await OrganizationTypeAPI.update(form);
        ElMessage.success("更新成功");
      }
      dialog.visible = false;
      getTypeList();
    } catch (error) {
      console.error("保存机构类型失败", error);
      ElMessage.error("保存机构类型失败");
    }
  });
};

// 初始化
onMounted(() => {
  getTypeList();
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
</style>
