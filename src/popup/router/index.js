import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '@/popup/views/login/login.vue'
import Home from '@/popup/views/home/home.vue'
import Test from '@/popup/views/test/test.vue'
import Entry from '@/popup/views/entry/entry.vue'
import Bookmark from '@/popup/views/bookmark/bookmark.vue'
import Tool from '@/popup/views/tool/tool.vue'

const routes = [
    // // URL未包含路由hash，则跳转至Home页面
    // { path: '/', redirect: '/home', exact: true },
    // 匹配 #/，指向Entry页面
    {
        path: '/',
        component: Entry,
        // 这里是Entry的二级路由配置
        children: [
            // 精确匹配 #/home，指向Home页面
            {
                path: 'home',
                component: Home,
                exact: true,
            },
            {
                path: 'test',
                component: Test,
                exact: true,
            },
            {
                path: 'bookmark',
                component: Bookmark,
                exact: true,
            },
            {
                path: '/login', component: Login, exact: true
            },
            {
                path: 'tool',
                component: Tool,
                exact: true,
            },
            // 空hash，则跳转至Home页面
            { path: '', redirect: 'home' },
            // 未匹配，则跳转至Home页面
            { path: '/:pathMatch(.*)', redirect: 'home' },
        ],
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router