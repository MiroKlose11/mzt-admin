<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>岗位列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" label-width="80px" inline>
          <el-form-item label="岗位名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入岗位名称"
              clearable
              style="width: 240px"
              @keyup.enter="getPositionList"
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
                :key="String(item.value)"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="getPositionList">查询</el-button>
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
      <el-table v-loading="loading" :data="positionList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="岗位名称" min-width="150" show-overflow-tooltip />
        <el-table-column
          prop="description"
          label="岗位描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'" size="small">
              {{ scope.row.status ? "启用" : "禁用" }}
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
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 岗位表单对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入岗位描述"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :step="1" />
          <span class="form-tip">数值越小越靠前</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="true">启用</el-radio>
            <el-radio :value="false">禁用</el-radio>
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
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import PositionAPI, {
  type PositionDTO,
  type PositionVO,
  PositionStatusEnum,
} from "@/api/position.api";
import { formatDateTime } from "@/utils/date";

// 状态选项
const statusOptions = [
  { label: "启用", value: PositionStatusEnum.ENABLED },
  { label: "禁用", value: PositionStatusEnum.DISABLED },
];

// 状态
const loading = ref(false);
const positionList = ref<PositionVO[]>([]);

// 查询参数
const queryParams = ref({
  name: "",
  status: undefined as boolean | undefined,
});

// 表单对话框
const dialog = reactive({
  visible: false,
  title: "",
  type: "add", // add: 新增, edit: 编辑
});

// 表单对象
const formRef = ref();
const form = ref<PositionDTO>({
  name: "",
  description: "",
  sort: 0,
  status: true,
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入岗位名称", trigger: "blur" }],
};

// 获取岗位列表
const getPositionList = async () => {
  loading.value = true;
  try {
    const result = await PositionAPI.getList();
    // 如果有查询条件，进行过滤
    positionList.value = result.filter((position) => {
      let match = true;
      if (queryParams.value.name && !position.name.includes(queryParams.value.name)) {
        match = false;
      }
      if (queryParams.value.status !== undefined && position.status !== queryParams.value.status) {
        match = false;
      }
      return match;
    });
  } catch {
    ElMessage.error("获取岗位列表失败");
  } finally {
    loading.value = false;
  }
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    name: "",
    status: undefined,
  };
  getPositionList();
};

// 重置表单
const resetForm = () => {
  form.value = {
    name: "",
    description: "",
    sort: 0,
    status: true,
  };
};

// 打开新增对话框
const handleAdd = () => {
  resetForm();
  dialog.type = "add";
  dialog.title = "新增岗位";
  dialog.visible = true;
};

// 打开编辑对话框
const handleEdit = (row: PositionVO) => {
  resetForm(); // 先重置表单

  // 然后将行数据赋值给表单
  form.value = {
    ...form.value, // 保留默认值
    ...row, // 覆盖行数据
  };

  dialog.type = "edit";
  dialog.title = "编辑岗位";
  dialog.visible = true;
};

// 删除岗位
const handleDelete = (row: PositionVO) => {
  ElMessageBox.confirm(`确定要删除岗位 ${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await PositionAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getPositionList();
    } catch (error) {
      console.error("删除岗位失败", error);
      ElMessage.error("删除岗位失败");
    }
  });
};

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      // 新增/更新逻辑
      if (dialog.type === "add") {
        await PositionAPI.create(form.value);
        ElMessage.success("新增成功");
      } else {
        await PositionAPI.update(form.value);
        ElMessage.success("更新成功");
      }
      dialog.visible = false;
      getPositionList();
    } catch (error) {
      console.error("保存岗位失败", error);
      ElMessage.error("保存岗位失败");
    }
  });
};

// 初始化
onMounted(() => {
  getPositionList();
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

.form-tip {
  margin-left: 10px;
  color: #606266;
  font-size: 14px;
}
</style>
