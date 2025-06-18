import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";
// import { contentRoutes } from "./routes";

export const Layout = () => import("@/layout/index.vue");

/** 前端定义的固定路由 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },
  {
    path: "/personal",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "",
        component: () => import("@/views/profile/index.vue"),
        name: "Profile",
        meta: {
          title: "个人中心",
          icon: "profile",
        },
      },
    ],
  },
  {
    path: "/member",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "",
        component: () => import("@/views/member/index.vue"),
        name: "MemberList",
        meta: {
          title: "成员管理",
          icon: "user",
          keepAlive: true,
        },
      },
      {
        path: "detail/:id",
        component: () => import("@/views/member/detail.vue"),
        name: "MemberDetail",
        meta: {
          title: "成员详情",
          icon: "user",
          hidden: true,
          activeMenu: "/member",
        },
      },
      {
        path: "edit/:id?",
        component: () => import("@/views/member/edit.vue"),
        name: "MemberEdit",
        meta: {
          title: "编辑成员",
          icon: "edit",
          hidden: true,
          activeMenu: "/member",
        },
      },
    ],
  },
  {
    path: "/student",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "",
        component: () => import("@/views/student/index.vue"),
        name: "StudentList",
        meta: {
          title: "学员管理",
          icon: "user-filled",
          keepAlive: true,
        },
      },
      {
        path: "detail/:id",
        component: () => import("@/views/student/detail.vue"),
        name: "StudentDetail",
        meta: {
          title: "学员详情",
          icon: "user-filled",
          hidden: true,
          activeMenu: "/student",
        },
      },
    ],
  },
  {
    path: "/course",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "",
        component: () => import("@/views/course/index.vue"),
        name: "CourseList",
        meta: {
          title: "课程管理",
          icon: "reading",
          keepAlive: true,
        },
      },
      {
        path: "detail/:id",
        component: () => import("@/views/course/detail.vue"),
        name: "CourseDetail",
        meta: {
          title: "课程详情",
          icon: "reading",
          hidden: true,
          activeMenu: "/course",
        },
      },
    ],
  },
  {
    path: "/article",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "",
        component: () => import("@/views/article/index.vue"),
        name: "ArticleList",
        meta: {
          title: "文章管理",
          icon: "document",
          keepAlive: true,
        },
      },
      {
        path: "edit/:id?",
        component: () => import("@/views/article/edit.vue"),
        name: "ArticleEdit",
        meta: {
          title: "编辑文章",
          icon: "edit",
          hidden: true,
          activeMenu: "/article",
        },
      },
      {
        path: "preview/:id",
        component: () => import("@/views/article/preview.vue"),
        name: "ArticlePreview",
        meta: {
          title: "文章预览",
          icon: "view",
          hidden: true,
          activeMenu: "/article",
        },
      },
    ],
  },
  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "Dashboard",
        meta: {
          title: "dashboard",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
