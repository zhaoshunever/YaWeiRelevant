import Vue from 'vue'
import App from './App.vue'
import Storage from 'vue-ls'
import router from './router'
import store from './store/'
// 基于 promise 的 HTTP 库的axios封住哪个，用于发送请求
import { VueAxios } from "@/utils/request"
// 组件库
import Antd from 'ant-design-vue'
// Viser 一个基于 G2 实现的，为数据可视化工程师量身定制的工具
import Viser from 'viser-vue'
// 组件库样式
import 'ant-design-vue/dist/antd.less';  // or 'ant-design-vue/dist/antd.less'
// 路由权限控制
import '@/permission' // permission control
import '@/utils/filter' // base filter
// vue 打印插件
import Print from 'vue-print-nb-jeecg'
/*import '@babel/polyfill'*/
// chart图插件
import VueApexCharts from 'vue-apexcharts'
// vue图片预览插件
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
// 常量
import {
  ACCESS_TOKEN,
  DEFAULT_COLOR,
  DEFAULT_THEME,
  DEFAULT_LAYOUT_MODE,
  DEFAULT_COLOR_WEAK,
  SIDEBAR_TYPE,
  DEFAULT_FIXED_HEADER,
  DEFAULT_FIXED_HEADER_HIDDEN,
  DEFAULT_FIXED_SIDEMENU,
  DEFAULT_CONTENT_WIDTH_TYPE,
  DEFAULT_MULTI_PAGE
} from "@/store/mutation-types"
import config from '@/defaultSettings'
// 字典选择公共组件（自定义插件）
import JDictSelectTag from './components/dict/index.js'
// 权限判断
import hasPermission from '@/utils/hasPermission'
// vue别名？
import vueBus from '@/utils/vueBus';
// 表单容器？
import JeecgComponents from '@/components/jeecg/index'
//正则表达式
import RegExpValidate from '@/utils/regExp'
import { message } from 'ant-design-vue'
Vue.prototype.$message = message;
message.config({
  //top: `100px`,
  duration: 3,
  maxCount: 1
});

// 为主业务数据请求设置属性以便代码中直接使用
Vue.prototype.$http = VueAxios
Vue.prototype.$RegExpValidate=RegExpValidate
// 阻止启动生产消息。
Vue.config.productionTip = false
Vue.use(Storage, config.storageOptions)
Vue.use(Antd)
Vue.use(VueAxios, router)
Vue.use(Viser)
Vue.use(hasPermission)
Vue.use(JDictSelectTag)
Vue.use(Print)
Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)
Vue.use(preview)
Vue.use(vueBus);
Vue.use(JeecgComponents);

new Vue({
  router,
  store,
  mounted () {
    store.commit('SET_SIDEBAR_TYPE', Vue.ls.get(SIDEBAR_TYPE, true))
    store.commit('TOGGLE_THEME', Vue.ls.get(DEFAULT_THEME, config.navTheme))
    store.commit('TOGGLE_LAYOUT_MODE', Vue.ls.get(DEFAULT_LAYOUT_MODE, config.layout))
    store.commit('TOGGLE_FIXED_HEADER', Vue.ls.get(DEFAULT_FIXED_HEADER, config.fixedHeader))
    store.commit('TOGGLE_FIXED_SIDERBAR', Vue.ls.get(DEFAULT_FIXED_SIDEMENU, config.fixSiderbar))
    store.commit('TOGGLE_CONTENT_WIDTH', Vue.ls.get(DEFAULT_CONTENT_WIDTH_TYPE, config.contentWidth))
    store.commit('TOGGLE_FIXED_HEADER_HIDDEN', Vue.ls.get(DEFAULT_FIXED_HEADER_HIDDEN, config.autoHideHeader))
    store.commit('TOGGLE_WEAK', Vue.ls.get(DEFAULT_COLOR_WEAK, config.colorWeak))
    store.commit('TOGGLE_COLOR', Vue.ls.get(DEFAULT_COLOR, config.primaryColor))
    store.commit('SET_TOKEN', Vue.ls.get(ACCESS_TOKEN))
    store.commit('SET_MULTI_PAGE',Vue.ls.get(DEFAULT_MULTI_PAGE,false))
  },
  render: h => h(App)
}).$mount('#app')
