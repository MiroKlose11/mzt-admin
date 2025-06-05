<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>机构列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" label-width="80px" inline>
          <el-form-item label="名称">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入机构名称"
              clearable
              style="width: 240px"
              @keyup.enter="getOrganizationList"
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select
              v-model="queryParams.typeId"
              placeholder="请选择机构类型"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in typeOptions"
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
            <el-button type="primary" :icon="Search" @click="getOrganizationList">查询</el-button>
            <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增机构</el-button>
          <el-button type="primary" :icon="Menu" @click="handleTypeManagement">
            机构类型管理
          </el-button>
        </div>
      </div>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="organizationList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="机构名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="typeName" label="机构类型" width="120" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="cityName" label="所在城市" width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === OrganizationStatusEnum.ENABLED ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status === OrganizationStatusEnum.ENABLED ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
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

    <!-- 机构表单对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
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
        <el-form-item label="机构名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入机构名称" />
        </el-form-item>
        <el-form-item label="机构类型" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择机构类型" style="width: 100%">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所在城市">
          <el-cascader
            v-model="selectedRegion"
            :options="regionOptions"
            :props="cascaderProps"
            placeholder="请选择省/市/区"
            style="width: 100%"
            :loading="regionLoading"
            clearable
            @change="handleRegionChange"
          />
          <div v-if="form.cityName" style="margin-top: 5px; color: #666; font-size: 12px">
            已选择: {{ form.cityName }} (ID: {{ form.cityId }})
          </div>
        </el-form-item>
        <el-form-item label="机构地址">
          <el-input v-model="form.address" placeholder="请输入机构地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="OrganizationStatusEnum.ENABLED">启用</el-radio>
            <el-radio :value="OrganizationStatusEnum.DISABLED">禁用</el-radio>
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

    <!-- 机构类型管理对话框 -->
    <el-dialog
      v-model="typeDialog.visible"
      title="机构类型管理"
      width="1000px"
      append-to-body
      destroy-on-close
    >
      <div class="type-management">
        <!-- 类型管理工具栏 -->
        <div class="type-management__toolbar">
          <el-button type="success" :icon="Plus" @click="handleAddType">新增类型</el-button>
        </div>

        <!-- 类型列表 -->
        <el-table v-loading="typeLoading" :data="typeList" style="width: 100%" class="mt-10">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="code" label="类型编码" width="120" show-overflow-tooltip />
          <el-table-column prop="name" label="类型名称" min-width="150" show-overflow-tooltip />
          <el-table-column
            prop="description"
            label="类型说明"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleEditType(scope.row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteType(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 机构类型表单对话框 -->
    <el-dialog
      v-model="typeFormDialog.visible"
      :title="typeFormDialog.title"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="typeFormRef"
        :model="typeForm"
        :rules="typeRules"
        label-width="100px"
        style="max-height: 500px; overflow-y: auto"
      >
        <el-form-item label="类型编码" prop="code">
          <el-input v-model="typeForm.code" placeholder="请输入类型编码" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="typeForm.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="类型说明">
          <el-input v-model="typeForm.description" type="textarea" placeholder="请输入类型说明" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="typeForm.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="typeFormDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitTypeForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Search, Plus, Refresh, Menu } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import OrganizationAPI, {
  type OrganizationQuery,
  type OrganizationDTO,
  type OrganizationVO,
  OrganizationStatusEnum,
} from "@/api/organization.api";
import OrganizationTypeAPI, {
  type OrganizationTypeDTO,
  type OrganizationTypeVO,
} from "@/api/organizationType.api";
import CityAPI from "@/api/city.api";
import { formatDateTime } from "@/utils/date";

// 机构类型选项
const typeOptions = ref<{ label: string; value: number }[]>([]);

// 省市区数据
const regionOptions = ref<any[]>([]);
const regionLoading = ref(false);

// 选中的省市区
const selectedRegion = ref<any[]>([]);

// 省市区级联选择器配置
const cascaderProps = {
  expandTrigger: "click" as const,
  checkStrictly: false,
  multiple: false,
  emitPath: true,
  lazy: false,
  value: "id",
  label: "name",
  children: "children",
};

// 状态选项
const statusOptions = [
  { label: "启用", value: OrganizationStatusEnum.ENABLED },
  { label: "禁用", value: OrganizationStatusEnum.DISABLED },
];

// 状态
const loading = ref(false);
const organizationList = ref<OrganizationVO[]>([]);

// 查询参数
const queryParams = reactive<OrganizationQuery>({
  name: "",
  typeId: undefined,
  status: undefined,
});

// 表单对话框
const dialog = reactive({
  visible: false,
  title: "",
  type: "add", // add: 新增, edit: 编辑
});

// 表单对象
const formRef = ref();
const form = reactive<OrganizationDTO>({
  name: "",
  typeId: 0,
  status: OrganizationStatusEnum.ENABLED,
  cityId: undefined,
});

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入机构名称", trigger: "blur" }],
  typeId: [{ required: true, message: "请选择机构类型", trigger: "change" }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入11位有效手机号码", trigger: "blur" }],
};

// 获取机构类型列表
const getOrganizationTypeList = async () => {
  try {
    const result = await OrganizationTypeAPI.getList();
    if (result && result.length > 0) {
      typeOptions.value = result.map((item) => ({
        label: item.name,
        value: item.id as number,
      }));
      console.log("机构类型列表:", typeOptions.value);
    }
  } catch (error) {
    console.error("获取机构类型列表失败", error);
    ElMessage.error("获取机构类型列表失败");
  }
};

// 获取省市区数据
const getRegionData = async () => {
  regionLoading.value = true;
  try {
    const result = await CityAPI.getList();
    if (result && result.length > 0) {
      console.log("后端返回的树状城市数据:", result);

      // 直接使用后端返回的树状结构
      regionOptions.value = result;
    }
  } catch (error) {
    console.error("获取省市区数据失败", error);
    ElMessage.error("获取省市区数据失败");
  } finally {
    regionLoading.value = false;
  }
};

// 获取机构列表
const getOrganizationList = async () => {
  loading.value = true;
  try {
    const result = await OrganizationAPI.getList(queryParams);
    organizationList.value = result || [];
    console.log("机构列表:", organizationList.value);
  } catch (error) {
    console.error("获取机构列表失败", error);
    ElMessage.error("获取机构列表失败");
  } finally {
    loading.value = false;
  }
};

// 重置查询
const resetQuery = () => {
  queryParams.name = "";
  queryParams.typeId = undefined;
  queryParams.status = undefined;
  getOrganizationList();
};

// 新增机构
const handleAdd = () => {
  resetForm();
  dialog.title = "新增机构";
  dialog.type = "add";
  dialog.visible = true;
};

// 编辑机构
const handleEdit = async (row: OrganizationVO) => {
  resetForm();
  dialog.title = "编辑机构";
  dialog.type = "edit";

  try {
    const organizationDetail = await OrganizationAPI.getDetail(row.id!);
    Object.assign(form, organizationDetail);

    // 清空已选择的省市区
    selectedRegion.value = [];

    // 如果有城市ID，尝试匹配省市区
    if (form.cityId && regionOptions.value.length > 0) {
      matchRegionById(form.cityId);
    }

    dialog.visible = true;
  } catch (error) {
    console.error("获取机构详情失败", error);
    ElMessage.error("获取机构详情失败");
  }
};

// 根据城市ID匹配省市区
const matchRegionById = (cityId: number) => {
  if (!cityId) return;

  // 找到城市ID对应的完整路径
  const findPath = (
    nodes: any[],
    targetId: number,
    currentPath: number[] = []
  ): number[] | null => {
    for (const node of nodes) {
      // 尝试当前节点
      const path = [...currentPath, node.id];

      // 找到目标
      if (node.id === targetId) {
        return path;
      }

      // 递归查找子节点
      if (node.children && node.children.length > 0) {
        const foundPath = findPath(node.children, targetId, path);
        if (foundPath) {
          return foundPath;
        }
      }
    }

    return null;
  };

  const path = findPath(regionOptions.value, cityId);
  if (path) {
    selectedRegion.value = path;
  }
};

// 删除机构
const handleDelete = (row: OrganizationVO) => {
  ElMessageBox.confirm(`确定要删除机构 ${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await OrganizationAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getOrganizationList();
    } catch (error) {
      console.error("删除机构失败", error);
      ElMessage.error("删除机构失败");
    }
  });
};

// 重置表单
const resetForm = () => {
  form.id = undefined;
  form.name = "";
  form.typeId = 0;
  form.address = "";
  form.cityName = "";
  form.cityId = undefined;
  form.phone = "";
  form.status = OrganizationStatusEnum.ENABLED;
  selectedRegion.value = [];
};

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      if (dialog.type === "add") {
        await OrganizationAPI.create(form);
        ElMessage.success("新增成功");
      } else {
        await OrganizationAPI.update(form);
        ElMessage.success("更新成功");
      }
      dialog.visible = false;
      getOrganizationList();
    } catch (error) {
      console.error("保存机构失败", error);
      ElMessage.error("保存机构失败");
    }
  });
};

// 机构类型管理
const typeDialog = reactive({
  visible: false,
});

const typeLoading = ref(false);
const typeList = ref<OrganizationTypeVO[]>([]);
const typeFormRef = ref();
const typeFormDialog = reactive({
  visible: false,
  title: "",
});
const typeForm = reactive<OrganizationTypeDTO>({
  code: "",
  name: "",
  description: "",
  sort: 0,
});
const typeRules = {
  code: [{ required: true, message: "请输入类型编码", trigger: "blur" }],
  name: [{ required: true, message: "请输入类型名称", trigger: "blur" }],
};

// 打开机构类型管理对话框
const handleTypeManagement = () => {
  typeDialog.visible = true;
  getTypeList();
};

// 新增机构类型
const handleAddType = () => {
  typeForm.id = undefined;
  typeForm.code = "";
  typeForm.name = "";
  typeForm.description = "";
  typeForm.sort = 0;
  typeFormDialog.title = "新增机构类型";
  typeFormDialog.visible = true;
};

// 编辑机构类型
const handleEditType = async (row: OrganizationTypeVO) => {
  try {
    const typeDetail = await OrganizationTypeAPI.getDetail(row.id!);
    typeForm.id = typeDetail.id;
    typeForm.code = typeDetail.code;
    typeForm.name = typeDetail.name;
    typeForm.description = typeDetail.description || "";
    typeForm.sort = typeDetail.sort || 0;
    typeFormDialog.title = "编辑机构类型";
    typeFormDialog.visible = true;
  } catch (error) {
    console.error("获取机构类型详情失败", error);
    ElMessage.error("获取机构类型详情失败");
  }
};

// 删除机构类型
const handleDeleteType = (row: OrganizationTypeVO) => {
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

// 提交机构类型表单
const submitTypeForm = async () => {
  typeFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      if (typeForm.id) {
        await OrganizationTypeAPI.update(typeForm);
        ElMessage.success("更新成功");
      } else {
        await OrganizationTypeAPI.create(typeForm);
        ElMessage.success("新增成功");
      }
      typeFormDialog.visible = false;
      getTypeList();
      // 更新机构类型选项
      getOrganizationTypeList();
    } catch (error) {
      console.error("保存机构类型失败", error);
      ElMessage.error("保存机构类型失败");
    }
  });
};

// 获取机构类型列表
const getTypeList = async () => {
  typeLoading.value = true;
  try {
    const result = await OrganizationTypeAPI.getList();
    typeList.value = result || [];
  } catch (error) {
    console.error("获取机构类型列表失败", error);
    ElMessage.error("获取机构类型列表失败");
  } finally {
    typeLoading.value = false;
  }
};

// 处理省市区选择变化
const handleRegionChange = (val: any) => {
  console.log("级联选择器值变化:", val);

  // 清空之前的值
  form.cityName = "";
  form.cityId = undefined;

  // 检查值是否有效
  if (!val || !Array.isArray(val) || val.length === 0) {
    return;
  }

  try {
    // 获取省市区的完整路径名称
    const labels: string[] = [];
    const ids: number[] = [];

    // 递归查找节点
    const findNodePath = (id: number, nodes: any[]): boolean => {
      for (const node of nodes) {
        if (node.id === id) {
          labels.push(node.name);
          ids.push(node.id);
          return true;
        }

        if (node.children && node.children.length > 0) {
          if (findNodePath(id, node.children)) {
            labels.unshift(node.name);
            ids.unshift(node.id);
            return true;
          }
        }
      }
      return false;
    };

    // 查找最后一级的完整路径
    const lastId = Number(val[val.length - 1]);
    if (!isNaN(lastId)) {
      findNodePath(lastId, regionOptions.value);

      // 设置城市名称和ID
      if (labels.length > 0) {
        form.cityName = labels.join("-");
        form.cityId = lastId;
      }

      console.log("选择的区域:", {
        cityId: form.cityId,
        cityName: form.cityName,
        path: ids,
      });
    }
  } catch (error) {
    console.error("处理区域选择出错:", error);
  }
};

// 初始化
onMounted(() => {
  getOrganizationList();
  getOrganizationTypeList();
  getRegionData();
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

.type-management {
  padding: 20px;
}

.type-management__toolbar {
  margin-bottom: 20px;
}

.mt-10 {
  margin-top: 10px;
}
</style>
