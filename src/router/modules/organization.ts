import { RouteRecordRaw } from "vue-router";
import Layout from "@/layout/index.vue";

// 机构管理相关路由
export const organizationRoutes: RouteRecordRaw[] = [
  {
    path: "/organization",
    component: Layout,
    redirect: "/organization/list",
    name: "Organization",
    meta: {
      title: "机构管理",
      icon: "office-building",
    },
    children: [
      {
        path: "list",
        component: () => import("@/views/organization/index.vue"),
        name: "OrganizationList",
        meta: {
          title: "机构列表",
          icon: "list",
          keepAlive: true,
        },
      },
      {
        path: "type",
        component: () => import("@/views/organization/type.vue"),
        name: "OrganizationType",
        meta: {
          title: "机构类型",
          icon: "menu",
          keepAlive: true,
        },
      },
    ],
  },
];

export default organizationRoutes;
