<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成员列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" label-width="80px" inline>
          <el-form-item label="姓名">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入成员姓名"
              clearable
              style="width: 240px"
              @keyup.enter="getMemberList"
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
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="getMemberList">查询</el-button>
            <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 工具栏 -->
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button type="success" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button type="primary" :icon="Management" @click="handleTitleManagement">
            头衔管理
          </el-button>
          <el-button type="warning" :icon="Management" @click="handleRoleManagement">
            角色管理
          </el-button>
        </div>
      </div>

      <!-- 列表 -->
      <el-table v-loading="loading" :data="memberList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="头像" width="170" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar">
              {{ scope.row.name ? scope.row.name.substring(0, 1) : "?" }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" show-overflow-tooltip />
        <el-table-column prop="gender" label="性别" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.gender === GenderEnum.MALE" type="primary" size="small">
              男
            </el-tag>
            <el-tag v-else-if="scope.row.gender === GenderEnum.FEMALE" type="danger" size="small">
              女
            </el-tag>
            <el-tag v-else type="info" size="small">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="160" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              v-for="role in scope.row.roles"
              :key="role.id"
              type="warning"
              size="small"
              class="mr-5"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ role.name }}
            </el-tag>
            <span v-if="!scope.row.roles || scope.row.roles.length === 0">-</span>
          </template>
        </el-table-column>
        <el-table-column label="头衔" width="260" show-overflow-tooltip>
          <template #default="scope">
            <el-tag
              v-for="title in scope.row.titles"
              :key="title.id"
              type="success"
              size="small"
              class="mr-5"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ title.name }}
            </el-tag>
            <span v-if="!scope.row.titles || scope.row.titles.length === 0">
              {{ scope.row.titleText || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="organization"
          label="所属机构"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="status" label="状态" width="70" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === MemberStatusEnum.ENABLED ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status === MemberStatusEnum.ENABLED ? "启用" : "禁用" }}
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
            <el-button link type="primary" size="small" @click="handleView(scope.row)">
              查看
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

    <!-- 成员表单对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="700px"
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
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/file/upload"
            :headers="{ Authorization: `Bearer ${getAccessToken()}` }"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <el-avatar v-if="form.avatar" :size="100" :src="form.avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio :label="GenderEnum.MALE">男</el-radio>
            <el-radio :label="GenderEnum.FEMALE">女</el-radio>
            <el-radio :label="GenderEnum.UNKNOWN">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="显示头衔">
          <el-input v-model="form.titleText" placeholder="请输入显示头衔" />
        </el-form-item>
        <el-form-item label="所属机构">
          <el-input v-model="form.organization" placeholder="请输入所属单位/机构" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input
            v-model="form.introduction"
            type="textarea"
            :rows="3"
            placeholder="请输入个人简介"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="MemberStatusEnum.ENABLED">启用</el-radio>
            <el-radio :label="MemberStatusEnum.DISABLED">禁用</el-radio>
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

    <!-- 角色管理对话框 -->
    <el-dialog
      v-model="roleDialog.visible"
      :title="'角色管理'"
      width="1000px"
      append-to-body
      destroy-on-close
    >
      <div class="role-management">
        <!-- 角色管理工具栏 -->
        <div class="role-management__toolbar">
          <el-button type="success" :icon="Plus" @click="handleAddRole">新增角色</el-button>
        </div>

        <!-- 角色列表 -->
        <el-table v-loading="roleLoading" :data="roleList" style="width: 100%" class="mt-10">
          <el-table-column prop="id" label="ID" width="60" align="center" />
          <el-table-column prop="code" label="角色标识" width="120" show-overflow-tooltip />
          <el-table-column prop="name" label="角色名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="description" label="说明" min-width="180" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="createdAt" label="创建时间" width="150" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleEditRole(scope.row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteRole(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="roleFormDialog.visible"
      :title="roleFormDialog.title"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-width="100px">
        <el-form-item label="角色标识" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色标识，如 doctor、lecturer" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入说明"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="roleForm.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleFormDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitRoleForm">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 头衔管理对话框 -->
    <el-dialog
      v-model="titleDialog.visible"
      :title="'头衔管理'"
      width="1000px"
      append-to-body
      destroy-on-close
    >
      <div class="title-management">
        <!-- 头衔管理工具栏 -->
        <div class="title-management__toolbar">
          <el-button type="success" :icon="Plus" @click="handleAddTitle">新增头衔</el-button>
        </div>

        <!-- 头衔列表 -->
        <el-table v-loading="titleLoading" :data="titleList" style="width: 100%" class="mt-10">
          <el-table-column prop="id" label="ID" width="60" align="center" />
          <el-table-column prop="name" label="头衔名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="description" label="说明" min-width="180" show-overflow-tooltip />
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column prop="createdAt" label="创建时间" width="150" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="handleEditTitle(scope.row)">
                编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteTitle(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 头衔表单对话框 -->
    <el-dialog
      v-model="titleFormDialog.visible"
      :title="titleFormDialog.title"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form
        ref="titleFormRef"
        :model="titleForm"
        :rules="{ name: [{ required: true, message: '请输入头衔名称', trigger: 'blur' }] }"
        label-width="100px"
      >
        <el-form-item label="头衔名称" prop="name">
          <el-input v-model="titleForm.name" placeholder="请输入头衔名称" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input
            v-model="titleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入说明"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="titleForm.sort" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="titleFormDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitTitleForm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Search, Plus, Refresh, Management } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import MemberAPI, {
  type MemberQuery,
  type MemberDTO,
  type MemberVO,
  GenderEnum,
  MemberStatusEnum,
} from "@/api/member.api";
import TitleAPI, { type TitleVO } from "@/api/title.api";
import RoleAPI, { type RoleDTO, type RoleVO } from "@/api/role.api";
import { getAccessToken } from "@/utils/auth";
import { formatDateTime } from "@/utils/date";

// 状态选项
const statusOptions = [
  { label: "启用", value: MemberStatusEnum.ENABLED },
  { label: "禁用", value: MemberStatusEnum.DISABLED },
];

// 状态
const loading = ref(false);
const memberList = ref<MemberVO[]>([]);
const total = ref(0);
const router = useRouter();

// 查询参数
const queryParams = ref<MemberQuery>({
  current: 1,
  size: 10,
});

// 表单对话框
const dialog = reactive({
  visible: false,
  title: "",
  type: "add", // add: 新增, edit: 编辑
});

// 表单对象
const formRef = ref();
const form = reactive<MemberDTO>({
  name: "",
  gender: GenderEnum.UNKNOWN,
  status: MemberStatusEnum.ENABLED,
});

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
};

// 获取成员列表
const getMemberList = async () => {
  loading.value = true;
  try {
    const result = await MemberAPI.getPage(queryParams.value);
    memberList.value = result.records || [];
    total.value = result.total || 0;
  } catch (error) {
    console.error("获取成员列表失败", error);
    ElMessage.error("获取成员列表失败");
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
  getMemberList();
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.value.size = size;
  getMemberList();
};

// 处理页码变化
const handleCurrentChange = (current: number) => {
  queryParams.value.current = current;
  getMemberList();
};

// 新增成员
const handleAdd = () => {
  resetForm();
  dialog.title = "新增成员";
  dialog.type = "add";
  dialog.visible = true;
};

// 编辑成员
const handleEdit = async (row: MemberVO) => {
  resetForm();
  dialog.title = "编辑成员";
  dialog.type = "edit";

  try {
    const memberDetail = await MemberAPI.getDetail(row.id!);
    Object.assign(form, memberDetail);
    dialog.visible = true;
  } catch (error) {
    console.error("获取成员详情失败", error);
    ElMessage.error("获取成员详情失败");
  }
};

// 查看成员详情
const handleView = (row: MemberVO) => {
  router.push(`/member/detail/${row.id}`);
};

// 删除成员
const handleDelete = (row: MemberVO) => {
  ElMessageBox.confirm(`确定要删除成员 ${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await MemberAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getMemberList();
    } catch (error) {
      console.error("删除成员失败", error);
      ElMessage.error("删除成员失败");
    }
  });
};

// 重置表单
const resetForm = () => {
  form.id = undefined;
  form.name = "";
  form.avatar = "";
  form.gender = GenderEnum.UNKNOWN;
  form.titleText = "";
  form.organization = "";
  form.cityId = undefined;
  form.introduction = "";
  form.status = MemberStatusEnum.ENABLED;
  form.roleIds = [];
  form.titleIds = [];
};

// 头像上传成功回调
const handleAvatarSuccess = (response: any) => {
  if (response.code === "00000") {
    form.avatar = response.data;
    ElMessage.success("头像上传成功");
  } else {
    ElMessage.error(response.msg || "头像上传失败");
  }
};

// 头像上传前的校验
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("上传头像图片只能是图片格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
    return false;
  }
  return true;
};

// 提交表单
const submitForm = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      if (dialog.type === "add") {
        await MemberAPI.create(form);
        ElMessage.success("新增成功");
      } else {
        await MemberAPI.update(form);
        ElMessage.success("更新成功");
      }
      dialog.visible = false;
      getMemberList();
    } catch (error) {
      console.error("保存成员失败", error);
      ElMessage.error("保存成员失败");
    }
  });
};

// 角色管理
const roleDialog = reactive({
  visible: false,
});

const roleLoading = ref(false);
const roleList = ref<RoleVO[]>([]);
const roleFormRef = ref();
const roleFormDialog = reactive({
  visible: false,
  title: "",
});
const roleForm = reactive<RoleDTO>({
  code: "",
  name: "",
  description: "",
  sort: 0,
});
const roleRules = {
  code: [{ required: true, message: "请输入角色标识", trigger: "blur" }],
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
};

// 头衔管理
const titleDialog = reactive({
  visible: false,
});
const titleLoading = ref(false);
const titleList = ref<TitleVO[]>([]);
const titleFormRef = ref();
const titleFormDialog = reactive({
  visible: false,
  title: "",
});
const titleForm = reactive({
  id: undefined as number | undefined,
  name: "",
  description: "",
  sort: 0,
});

// 打开头衔管理对话框
const handleTitleManagement = () => {
  titleDialog.visible = true;
  getTitleList();
};

// 新增头衔
const handleAddTitle = () => {
  titleForm.id = undefined;
  titleForm.name = "";
  titleForm.description = "";
  titleForm.sort = 0;
  titleFormDialog.title = "新增头衔";
  titleFormDialog.visible = true;
};

// 编辑头衔
const handleEditTitle = (row: TitleVO) => {
  titleForm.id = row.id;
  titleForm.name = row.name;
  titleForm.description = row.description || "";
  titleForm.sort = row.sort || 0;
  titleFormDialog.title = "编辑头衔";
  titleFormDialog.visible = true;
};

// 删除头衔
const handleDeleteTitle = (row: TitleVO) => {
  ElMessageBox.confirm(`确定要删除头衔 ${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await TitleAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getTitleList();
    } catch (error) {
      console.error("删除头衔失败", error);
      ElMessage.error("删除头衔失败");
    }
  });
};

// 提交头衔表单
const submitTitleForm = async () => {
  titleFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      if (titleFormDialog.title === "新增头衔") {
        await TitleAPI.create(titleForm);
        ElMessage.success("新增成功");
      } else {
        await TitleAPI.update(titleForm);
        ElMessage.success("更新成功");
      }
      titleFormDialog.visible = false;
      getTitleList();
    } catch (error) {
      console.error("保存头衔失败", error);
      ElMessage.error("保存头衔失败");
    }
  });
};

// 获取头衔列表
const getTitleList = async () => {
  titleLoading.value = true;
  try {
    const result = await TitleAPI.getList();
    titleList.value = result || [];
  } catch (error) {
    console.error("获取头衔列表失败", error);
    ElMessage.error("获取头衔列表失败");
  } finally {
    titleLoading.value = false;
  }
};

// 打开角色管理对话框
const handleRoleManagement = () => {
  roleDialog.visible = true;
  getRoleList();
};

const handleAddRole = () => {
  roleForm.id = undefined;
  roleForm.code = "";
  roleForm.name = "";
  roleForm.description = "";
  roleForm.sort = 0;
  roleFormDialog.title = "新增角色";
  roleFormDialog.visible = true;
};

const handleEditRole = (row: RoleVO) => {
  roleForm.id = row.id;
  roleForm.code = row.code;
  roleForm.name = row.name;
  roleForm.description = row.description || "";
  roleForm.sort = row.sort || 0;
  roleFormDialog.title = "编辑角色";
  roleFormDialog.visible = true;
};

const handleDeleteRole = (row: RoleVO) => {
  ElMessageBox.confirm(`确定要删除角色 ${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await RoleAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getRoleList();
    } catch (error) {
      console.error("删除角色失败", error);
      ElMessage.error("删除角色失败");
    }
  });
};

const submitRoleForm = async () => {
  roleFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return;

    try {
      if (roleFormDialog.title === "新增角色") {
        await RoleAPI.create(roleForm);
        ElMessage.success("新增成功");
      } else {
        await RoleAPI.update(roleForm);
        ElMessage.success("更新成功");
      }
      roleFormDialog.visible = false;
      getRoleList();
    } catch (error) {
      console.error("保存角色失败", error);
      ElMessage.error("保存角色失败");
    }
  });
};

const getRoleList = async () => {
  roleLoading.value = true;
  try {
    const result = await RoleAPI.getList();
    roleList.value = result || [];
  } catch (error) {
    console.error("获取角色列表失败", error);
    ElMessage.error("获取角色列表失败");
  } finally {
    roleLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  getMemberList();
  getTitleList();
  getRoleList();
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-management {
  padding: 20px;
}

.role-management__toolbar {
  margin-bottom: 20px;
}

.title-management {
  padding: 20px;
}

.title-management__toolbar {
  margin-bottom: 20px;
}

.mt-10 {
  margin-top: 10px;
}
</style>
