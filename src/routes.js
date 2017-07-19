import Login from "./views/Login.vue";
import NotFound from "./views/404.vue";
import Home from "./views/Home.vue";
import Main from "./views/Main.vue";
import Report from "./views/Report.vue";
import User from "./views/User.vue";
import Role from "./views/Role.vue";
import Permission from "./views/Permission.vue";
import Log from "./views/Log.vue";
import Category from "./views/Category.vue";
import Article from "./views/Article.vue";
import Tag from "./views/Tag.vue";
import Comment from "./views/Comment.vue";
import Link from "./views/Link.vue";

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: 'Home',
        leaf: true,//只有一个节点
        iconCls: 'el-icon-menu',//图标样式class
        children: [
            {path: '/home', component: Main, name: '主页', hidden: false},
        ]
    },
    {
        path: '/',
        component: Home,
        name: '内容',
        iconCls: 'fa fa-indent',
        children: [
            {path: '/article', component: Article, name: '文章管理',auth:'view_article'},
            {path: '/category', component: Category, name: '分类管理',auth:'view_category'},
            {path: '/tag', component: Tag, name: '标签管理',auth:'view_tag'},
            {path: '/link', component: Link, name: '链接管理',auth:'view_link'},
            {path: '/comment', component: Comment, name: '评论管理',auth:'view_comment'},
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统',
        iconCls: 'fa el-icon-setting',
        children: [
            {path: '/user', component: User, name: '用户管理',auth:'view_user'},
            {path: '/role', component: Role, name: '角色管理',auth:'view_role'},
            {path: '/permission', component: Permission, name: '权限管理',auth:'view_permission'},
            {path: '/log', component: Log, name: '日志管理',auth:'view_log'},
        ]
    },
    {
        path: '/',
        component: Home,
        name: '报表',
        iconCls: 'fa fa-bar-chart',
        children: [
            {path: '/report', component: Report, name: '数据报表',auth:'view_report'},

        ]
    },

    {
        path: '*',
        hidden: true,
        redirect: {path: '/404'}
    }
];

export default routes;