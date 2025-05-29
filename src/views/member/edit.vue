<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? "编辑成员" : "新增成员" }}</span>
          <el-button :icon="Back" @click="goBack">返回</el-button>
        </div>
      </template>

      <div v-loading="loading">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="member-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别">
                <el-radio-group v-model="form.gender">
                  <el-radio :label="GenderEnum.MALE">男</el-radio>
                  <el-radio :label="GenderEnum.FEMALE">女</el-radio>
                  <el-radio :label="GenderEnum.UNKNOWN">未知</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="显示头衔">
                <el-input v-model="form.titleText" placeholder="请输入显示头衔" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属机构">
                <el-input v-model="form.organization" placeholder="请输入所属单位/机构" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio :label="MemberStatusEnum.ENABLED">启用</el-radio>
                  <el-radio :label="MemberStatusEnum.DISABLED">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="头像">
            <div class="avatar-upload-container">
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
              <div class="avatar-tip">点击上传头像，建议尺寸 200x200 像素</div>
            </div>
          </el-form-item>

          <el-form-item label="个人简介">
            <el-input
              v-model="form.introduction"
              type="textarea"
              :rows="4"
              placeholder="请输入个人简介"
            />
          </el-form-item>

          <el-form-item label="角色">
            <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
              <el-option
                v-for="role in roleOptions"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="头衔">
            <el-select
              v-model="form.titleIds"
              multiple
              placeholder="请选择头衔"
              style="width: 100%"
            >
              <el-option
                v-for="title in titleOptions"
                :key="title.value"
                :label="title.label"
                :value="title.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button @click="goBack">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Back, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import MemberAPI, { type MemberDTO, GenderEnum, MemberStatusEnum } from "@/api/member.api";
import TitleAPI from "@/api/title.api";
import RoleAPI from "@/api/role.api";
import { getAccessToken } from "@/utils/auth";

// 状态
const loading = ref(false);
const route = useRoute();
const router = useRouter();
const formRef = ref();

// 判断是编辑还是新增
const memberId = computed(() => (route.params.id ? Number(route.params.id) : undefined));
const isEdit = computed(() => !!memberId.value);

// 表单对象
const form = reactive<MemberDTO>({
  name: "",
  gender: GenderEnum.UNKNOWN,
  status: MemberStatusEnum.ENABLED,
  roleIds: [],
  titleIds: [],
});

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
};

// 角色选项
const roleOptions = ref<{ label: string; value: number }[]>([]);

// 头衔选项
const titleOptions = ref<{ label: string; value: number }[]>([]);

// 获取头衔列表
const getTitleOptions = async () => {
  try {
    const titles = await TitleAPI.getList();
    titleOptions.value = titles.map((title) => ({
      label: title.name,
      value: title.id!,
    }));
  } catch (error) {
    console.error("获取头衔列表失败", error);
    ElMessage.error("获取头衔列表失败");
  }
};

// 获取角色列表
const getRoleOptions = async () => {
  try {
    const roles = await RoleAPI.getList();
    roleOptions.value = roles.map((role) => ({
      label: role.name,
      value: role.id!,
    }));
  } catch (error) {
    console.error("获取角色列表失败", error);
    ElMessage.error("获取角色列表失败");
  }
};

// 获取成员详情
const getMemberDetail = async () => {
  if (!isEdit.value) return;

  loading.value = true;
  try {
    const memberData = await MemberAPI.getDetail(memberId.value!);

    // 填充表单数据
    Object.assign(form, memberData);

    // 处理角色和头衔ID列表
    form.roleIds = memberData.roles?.map((role) => role.id!) || [];
    form.titleIds = memberData.titles?.map((title) => title.id!) || [];
  } catch (error) {
    console.error("获取成员详情失败", error);
    ElMessage.error("获取成员详情失败");
  } finally {
    loading.value = false;
  }
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
      loading.value = true;

      if (isEdit.value) {
        await MemberAPI.update(form);
        ElMessage.success("更新成功");
      } else {
        await MemberAPI.create(form);
        ElMessage.success("新增成功");
      }

      goBack();
    } catch (error) {
      console.error("保存成员失败", error);
      ElMessage.error("保存成员失败");
    } finally {
      loading.value = false;
    }
  });
};

// 返回列表
const goBack = () => {
  router.push("/member");
};

// 初始化
onMounted(() => {
  getMemberDetail();
  getTitleOptions();
  getRoleOptions();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0;
}

.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-uploader {
  margin-bottom: 10px;
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

.avatar-tip {
  font-size: 12px;
  color: #999;
}
</style>
