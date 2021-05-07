import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import Home from '../views/Home.vue'
import Kabinet from "@/views/Kabinet"
import Landing from "@/views/Landing"
import UserActivation from "@/views/UserActivation"
import PasswordChange from "@/views/PasswordChange"
import SocialRedirector from "@/views/SocialRedirector"
import ThrottleRestrictor from "@/views/ThrottleRestrictor"
// import Chavo from "@/views/Chavo"
// import About from "@/views/About"
const About = () => import('@/views/About')
const Chavo = () => import('@/views/Chavo')

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Landing,
    // props: {need_footer: true},
    children:
    [
      {
        path: '',
        name: 'Home',
        component: Home,
      },
      {
        path: 'login',
        name: 'HomeLogin',
        component: Home,
        props: {login_show: true},
      },
      {
        path: 'logout',
        name: 'HomeLogout',
        component: Home,
        props: {need_logout: true},
      },
      {
        path: 'chavo',
        name: 'Chavo',
        component: Chavo,
        // component: () => import(/* webpackChunkName: "about" */ '../views/Chavo.vue')
        meta: {
          title: 'ЧАсто задаваемые ВОпросы',
        },
      },
      {
        path: 'about',
        name: 'About',
        component: About,
        meta: {
          title: 'О сайте',
        },
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
      },
      {
        path: 'user_activation/:uid/:token',
        name: 'user_activation',
        // component: () => import('@/views/UserActivation.vue'),
        component: UserActivation,
        props: true,
        meta: {
          title: 'Активация пользователя'
        },
      },
      {
        path: 'password/reset/confirm/:uid/:token',
        name: 'password_reset_confirm',
        // component: () => import('@/views/PasswordChange.vue'),
        component: PasswordChange,
        props: true,
        meta: {
          title: 'Изменение пароля'
        },
      },
    ]
  },

  {
    path: '/social_redirector',
    name: 'social_redirector',
    component: SocialRedirector,
    props: (route) => ({code: route.query.code, state: route.query.state, access_token: route.query.access_token}),
    meta: {
      title: 'Вход через другую учетную запись'
    },
  },
  {
    path: '/throttle_restrictor',
    name: 'ThrottleRestrictor',
    component: ThrottleRestrictor,
    meta: {
      title: 'Превышение числа запросов к серверу.'
    },
  },

  {
    path: '/kabinet',
    component: Kabinet,
    meta: {requiresAuth: true,},
    children:[
      {
        path: '',
        name: 'Platejki',
        component: () => import('../views/Platejki.vue'),
        meta: {
          title: 'Все платежки',
        },
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/Stats.vue'),
        meta: {
          title: 'Статистика',
        },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Setts.vue'),
        meta: {
          title: 'Настройки',
        },
      },
      {
        path: 'printer',
        name: 'Printer',
        component: () => import('../views/Printer.vue'),
        props: true,
        meta: {
          title: 'Распечатка',
        },
      },
    ]
  },
  {
    path: "/*",
    component: { render: (h) => h("div", ["404! Page Not Found!"]) },
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((route) => route.meta?.requiresAuth)) { // Если есть meta и в ней requiresAuth = true
    if (store.getters.isLoggedIn) {
      next()
    } else {
      next({name: 'HomeLogin'})
    }
  } else { // Если нет meta или в meta requiresAuth = false
    next()
  }
})

export default router