import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TaskView from '../views/TaskView.vue';
import TaskDetailView from '../views/TaskDetailView.vue';
import NewTaskView from '../views/NewTaskView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TaskView
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetail',
    component: TaskDetailView
  },
  {
    path: '/new-task',
    name: 'NewTask',
    component: NewTaskView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
