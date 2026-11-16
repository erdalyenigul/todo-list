import { createRouter, createWebHistory } from "vue-router";
import { initializeAuth, session } from "../stores/auth";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/tasks" },
    {
      path: "/login",
      name: "Login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/tasks",
      name: "Tasks",
      component: () => import("../views/TaskView.vue"),
    },
    {
      path: "/tasks/:id",
      name: "TaskDetail",
      component: () => import("../views/TaskDetailView.vue"),
    },
    {
      path: "/new-task",
      name: "NewTask",
      component: () => import("../views/NewTaskView.vue"),
    },
    { path: "/:pathMatch(.*)*", redirect: "/tasks" },
  ],
});
router.beforeEach(async (to) => {
  await initializeAuth();
  if (!session.value && to.name !== "Login")
    return { name: "Login", query: { next: to.fullPath } };
  if (session.value && to.name === "Login") return "/tasks";
});
export default router;
