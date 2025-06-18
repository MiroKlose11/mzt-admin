<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学员列表</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <el-form :model="queryParams" label-width="80px" inline>
          <el-form-item label="姓名">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入学员姓名"
              clearable
              style="width: 240px"
              @keyup.enter="getStudentList"
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
            <el-button type="primary" :icon="Search" @click="getStudentList">查询</el-button>
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
      <el-table v-loading="loading" :data="studentList" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="头像" width="100" align="center">
          <template #default="scope">
            <el-avatar :size="40" :src="scope.row.avatar">
              {{ scope.row.name ? scope.row.name.substring(0, 1) : "?" }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" show-overflow-tooltip />
        <el-table-column prop="gender" label="性别" width="80" align="center">
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
        <el-table-column
          prop="organizationName"
          label="所属机构"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column prop="signature" label="个性签名" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === StudentStatusEnum.ENABLED ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status === StudentStatusEnum.ENABLED ? "启用" : "禁用" }}
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

    <!-- 学生表单对话框 -->
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
            <el-radio :value="GenderEnum.MALE">男</el-radio>
            <el-radio :value="GenderEnum.FEMALE">女</el-radio>
            <el-radio :value="GenderEnum.UNKNOWN">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属机构">
          <el-select
            v-model="form.organizationId"
            filterable
            clearable
            placeholder="请选择机构"
            style="width: 100%"
            @change="onOrganizationChange"
          >
            <el-option
              v-for="org in organizationList"
              :key="org.id"
              :label="org.name"
              :value="org.id"
            />
            <el-option :label="'手动输入'" :value="0" />
          </el-select>
          <el-input
            v-if="form.organizationId === 0"
            v-model="form.organizationName"
            placeholder="请输入机构名称"
            style="margin-top: 8px"
          />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input
            v-model="form.signature"
            type="textarea"
            :rows="3"
            placeholder="请输入个性签名"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="StudentStatusEnum.ENABLED">启用</el-radio>
            <el-radio :value="StudentStatusEnum.DISABLED">禁用</el-radio>
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
import { useRouter } from "vue-router";
import { Search, Plus, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import StudentAPI, {
  type StudentQuery,
  type StudentDTO,
  type StudentVO,
  GenderEnum,
  StudentStatusEnum,
} from "@/api/student.api";
import OrganizationAPI from "@/api/organization.api";
import { getAccessToken } from "@/utils/auth";
import { formatDateTime } from "@/utils/date";

// 状态选项
const statusOptions = [
  { label: "启用", value: StudentStatusEnum.ENABLED },
  { label: "禁用", value: StudentStatusEnum.DISABLED },
];

// 状态
const loading = ref(false);
const studentList = ref<StudentVO[]>([]);
const total = ref(0);
const router = useRouter();

// 查询参数
const queryParams = ref<StudentQuery>({
  current: 1,
  size: 10,
  name: "",
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
const form = reactive<StudentDTO>({
  name: "",
  gender: GenderEnum.UNKNOWN,
  status: StudentStatusEnum.ENABLED,
});

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
};

// 机构列表
const organizationList = ref<{ id: number; name: string }[]>([]);

// 机构选择变化时
const onOrganizationChange = (val: number) => {
  if (val !== 0) {
    form.organizationName = "";
  }
};

// 获取学生列表
const getStudentList = async () => {
  loading.value = true;
  try {
    const result = await StudentAPI.getPage(queryParams.value);
    studentList.value = result.records || [];
    total.value = result.total || 0;
  } catch {
    ElMessage.error("获取学员列表失败");
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
  getStudentList();
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.value.size = size;
  getStudentList();
};

// 处理页码变化
const handleCurrentChange = (current: number) => {
  queryParams.value.current = current;
  getStudentList();
};

// 新增学生
const handleAdd = () => {
  resetForm();
  dialog.title = "新增学员";
  dialog.type = "add";
  dialog.visible = true;
};

// 编辑学生
const handleEdit = async (row: StudentVO) => {
  resetForm();
  dialog.title = "编辑学员";
  dialog.type = "edit";

  try {
    const studentDetail = await StudentAPI.getDetail(row.id!);
    Object.assign(form, studentDetail);
    dialog.visible = true;
  } catch (error) {
    console.error("获取学员详情失败", error);
    ElMessage.error("获取学员详情失败");
  }
};

// 查看学生详情
const handleView = (row: StudentVO) => {
  router.push(`/student/detail/${row.id}`);
};

// 删除学生
const handleDelete = (row: StudentVO) => {
  ElMessageBox.confirm(`确定要删除学员 ${row.name} 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await StudentAPI.delete(row.id!);
      ElMessage.success("删除成功");
      getStudentList();
    } catch (error) {
      console.error("删除学员失败", error);
      ElMessage.error("删除学员失败");
    }
  });
};

// 重置表单
const resetForm = () => {
  form.id = undefined;
  form.name = "";
  form.avatar = "";
  form.gender = GenderEnum.UNKNOWN;
  form.organizationId = undefined;
  form.organizationName = "";
  form.signature = "";
  form.status = StudentStatusEnum.ENABLED;
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
      // 新增/更新逻辑
      if (dialog.type === "add") {
        await StudentAPI.create(form);
        ElMessage.success("新增成功");
      } else {
        await StudentAPI.update(form);
        ElMessage.success("更新成功");
      }
      dialog.visible = false;
      getStudentList();
    } catch (error) {
      console.error("保存学员失败", error);
      ElMessage.error("保存学员失败");
    }
  });
};

// 获取所有机构列表
const getOrganizationList = async () => {
  try {
    const result = await OrganizationAPI.getList();
    if (result && result.length > 0) {
      organizationList.value = result.map((org) => ({
        id: org.id!,
        name: org.name,
      }));
    }
  } catch (error) {
    console.error("获取机构列表失败", error);
    ElMessage.error("获取机构列表失败");
  }
};

// 初始化
onMounted(() => {
  getStudentList();
  getOrganizationList();
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
</style>
