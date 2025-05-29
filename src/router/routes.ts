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
];
