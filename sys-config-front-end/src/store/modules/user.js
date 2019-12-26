import Vue from 'vue'
import { login, logout } from "@/api/login"
import { ACCESS_TOKEN, USER_NAME,USER_INFO,USER_AUTH,SYS_BUTTON_AUTH } from "@/store/mutation-types"
import { welcome } from "@/utils/util"
import { queryPermissionsByUser } from '@/api/api'
// demo用menu菜单
import { testMenu } from '@/api/test-data'

const user = {
  state: {
    token: '',
    username: '',
    realname: '',
    welcome: '',
    avatar: '',
    permissionList: [],
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, { username, realname, welcome }) => {
      state.username = username
      state.realname = realname
      state.welcome = welcome
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_PERMISSIONLIST: (state, permissionList) => {
      state.permissionList = permissionList
    },
    SET_INFO: (state, info) => {
      state.info = info
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        var response ={
          "success": true,
          "message": "登录成功",
          "code": 200,
          "result": {
            "userInfo": {
              "birthday": null,
              "ext": {
                "a": "1",
                "b": 2
              },
              "delegateUserId": null,
              "creator": "1",
              "staffCode": null,
              "modifyDate": "2019-08-02 19:54:55",
              "workEmail": null,
              "idCard": null,
              "modifier": "1",
              "genderId": null,
              "photo": null,
              "dn": null,
              "userName": "admin",
              "delegateEndDate": null,
              "personPhone": null,
              "buildin": true,
              "realName": "超级管理员",
              "delegateStartDate": null,
              "enable": true,
              "appId": "2",
              "workPhone": null,
              "id": "1",
              "createDate": "2019-06-04 00:00:00"
            },
            "orgInfo": [{
              "ext": null,
              "creator": "1",
              "masterPostId": null,
              "modifyDate": "2019-09-03 00:00:00",
              "organizationCategoryId": 4,
              "modifier": "1",
              "description": null,
              "pid": "0",
              "adress": null,
              "dn": null,
              "isPost": false,
              "areaId": null,
              "organizationCode": null,
              "portalUrl": null,
              "name": "市中区七里山街道办事处12345",
              "workPhone": null,
              "postCode": null,
              "id": "1168875282240253954",
              "lft": 1,
              "fax": null,
              "rgt": 2,
              "createDate": "2019-09-03 00:00:00"
            }, {
              "ext": null,
              "creator": "1",
              "masterPostId": null,
              "modifyDate": "2019-09-15 00:00:00",
              "organizationCategoryId": 4,
              "modifier": "1",
              "description": null,
              "pid": "0",
              "adress": null,
              "dn": null,
              "isPost": false,
              "areaId": null,
              "organizationCode": null,
              "portalUrl": null,
              "name": "历下区办事处",
              "workPhone": null,
              "postCode": null,
              "id": "1173082099283570690",
              "lft": 3,
              "fax": null,
              "rgt": 4,
              "createDate": "2019-09-15 00:00:00"
            }],
            "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBpZCI6MiwiZXhwIjoxNTY5MDM5NTMxLCJ1c2VybmFtZSI6ImFkbWluIn0.6xdL9b6uRs8UjNGj1AzmM-8YU-Gwpx27lXrqA9VPYSU"
          },
          "timestamp": "1569037731656"
        }
        if(response.code =='200'){
          const result = response.result
          const userInfo = result.userInfo
          Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
          Vue.ls.set(USER_NAME, userInfo.userName, 7 * 24 * 60 * 60 * 1000)
          Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
          commit('SET_TOKEN', result.token)
          commit('SET_INFO', userInfo)
          commit('SET_NAME', { username: userInfo.userName,realname: userInfo.realName, welcome: welcome() })
          commit('SET_AVATAR', userInfo.avatar)
          resolve(response)
        }else{
          reject(response)
        }
        // login(userInfo).then(response => {
        //   if(response.code =='200'){
        //     const result = response.result
        //     const userInfo = result.userInfo
        //     Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
        //     Vue.ls.set(USER_NAME, userInfo.userName, 7 * 24 * 60 * 60 * 1000)
        //     Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
        //     commit('SET_TOKEN', result.token)
        //     commit('SET_INFO', userInfo)
        //     commit('SET_NAME', { username: userInfo.userName,realname: userInfo.realName, welcome: welcome() })
        //     commit('SET_AVATAR', userInfo.avatar)
        //     resolve(response)
        //   }else{
        //     reject(response)
        //   }
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },
    //手机号登录
    // PhoneLogin({ commit }, userInfo) {
    //   return new Promise((resolve, reject) => {
    //       phoneLogin(userInfo).then(response => {
    //       if(response.code =='200'){
    //     const result = response.result
    //     const userInfo = result.userInfo
    //     Vue.ls.set(ACCESS_TOKEN, result.token, 7 * 24 * 60 * 60 * 1000)
    //     Vue.ls.set(USER_NAME, userInfo.username, 7 * 24 * 60 * 60 * 1000)
    //     Vue.ls.set(USER_INFO, userInfo, 7 * 24 * 60 * 60 * 1000)
    //     commit('SET_TOKEN', result.token)
    //     commit('SET_INFO', userInfo)
    //     commit('SET_NAME', { username: userInfo.username,realname: userInfo.realname, welcome: welcome() })
    //     commit('SET_AVATAR', userInfo.avatar)
    //     resolve(response)
    //   }else{
    //     reject(response)
    //   }
    // }).catch(error => {
    //     reject(error)
    //   })
    // })
    // },
    // 获取用户信息
    GetPermissionList({ commit }) {
      return new Promise((resolve, reject) => {
        let v_token = Vue.ls.get(ACCESS_TOKEN);
        let params = {token:v_token};
        // 获取用户拥有的权限
        // 增加demo用的静态menu 
        var response = testMenu
        var menuData = response.result.menu;
        const authData = response.result.auth;
        const allAuthData = response.result.allAuth;
        //Vue.ls.set(USER_AUTH,authData);
        sessionStorage.setItem(USER_AUTH,JSON.stringify(authData));
        sessionStorage.setItem(SYS_BUTTON_AUTH,JSON.stringify(allAuthData));
        if (menuData && menuData.length > 0) {
          commit('SET_PERMISSIONLIST', menuData)
        } else {
          reject('getPermissionList: permissions must be a non-null array !')
        }
        resolve(response)
        // queryPermissionsByUser(params).then(response => {
        //   // 增加demo用的静态menu 
        //   response.result.menu = testMenu
              
        //   var menuData = response.result.menu;
           
         
        //   const authData = response.result.auth;
        //   const allAuthData = response.result.allAuth;
        //   //Vue.ls.set(USER_AUTH,authData);
        //   sessionStorage.setItem(USER_AUTH,JSON.stringify(authData));
        //   sessionStorage.setItem(SYS_BUTTON_AUTH,JSON.stringify(allAuthData));
        //   if (menuData && menuData.length > 0) {
        //     commit('SET_PERMISSIONLIST', menuData)
        //   } else {
        //     reject('getPermissionList: permissions must be a non-null array !')
        //   }
        //   resolve(response)
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise((resolve) => {
        let logoutToken = state.token;
        commit('SET_TOKEN', '')
        commit('SET_PERMISSIONLIST', [])
        Vue.ls.remove(ACCESS_TOKEN)
        logout(logoutToken).then(() => {
          resolve()
        }).catch(() => {
          resolve()
        })
      })
    },

  }
}

export default user