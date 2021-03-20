import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import(/* webpackChunkName: "about" */ '../views/home.vue')
    },
    {
        path: '/home2',
        name: 'home2',
        component: () => import(/* webpackChunkName: "about" */ '../views/home2.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router
