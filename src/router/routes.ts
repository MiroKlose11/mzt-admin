// 内容管理相关路由
export const contentRoutes = [
  {
    path: "/article",
    component: () => import("@/views/article/index.vue"),
    name: "Article",
    meta: {
      title: "文章内容管理",
      icon: "document",
    },
  },
  {
    path: "/article/edit/:id?",
    component: () => import("@/views/article/edit.vue"),
    name: "ArticleEdit",
    meta: {
      title: "编辑文章",
      icon: "document",
      hidden: true,
    },
  },
  {
    path: "/article/preview/:id",
    component: () => import("@/views/article/preview.vue"),
    name: "ArticlePreview",
    meta: {
      title: "预览文章",
      icon: "document",
      hidden: true,
    },
  },
  // 添加成员管理路由
  {
    path: "/member",
    component: () => import("@/views/member/index.vue"),
    name: "Member",
    meta: {
      title: "成员管理",
      icon: "user",
    },
  },
  {
    path: "/member/edit/:id?",
    component: () => import("@/views/member/edit.vue"),
    name: "MemberEdit",
    meta: {
      title: "编辑成员",
      icon: "user",
      hidden: true,
    },
  },
  {
    path: "/member/detail/:id",
    component: () => import("@/views/member/detail.vue"),
    name: "MemberDetail",
    meta: {
      title: "成员详情",
      icon: "user",
      hidden: true,
    },
  },
  // 添加学员管理路由
  {
    path: "/student",
    component: () => import("@/views/student/index.vue"),
    name: "Student",
    meta: {
      title: "学员管理",
      icon: "user-filled",
    },
  },
  {
    path: "/student/detail/:id",
    component: () => import("@/views/student/detail.vue"),
    name: "StudentDetail",
    meta: {
      title: "学员详情",
      icon: "user-filled",
      hidden: true,
    },
  },
  // 添加课程管理路由
  {
    path: "/course",
    component: () => import("@/views/course/index.vue"),
    name: "Course",
    meta: {
      title: "课程管理",
      icon: "reading",
    },
  },
  {
    path: "/course/detail/:id",
    component: () => import("@/views/course/detail.vue"),
    name: "CourseDetail",
    meta: {
      title: "课程详情",
      icon: "reading",
      hidden: true,
    },
  },
];
