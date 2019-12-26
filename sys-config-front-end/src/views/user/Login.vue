<template>
  <div class="main">
    <a-form :form="form" class="user-layout-login" ref="formLogin" id="formLogin">
      <a-tabs :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }">
        <a-tab-pane tab="账号密码登陆">
          <a-form-item>
            <a-input
              size="large"
              v-decorator="['username',validatorRules.username,{ validator: this.handleUsernameOrEmail }]"
              type="text"
              placeholder="请输入帐户名"
            >
              <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input
              v-decorator="['password',validatorRules.password]"
              size="large"
              type="password"
              autocomplete="false"
              placeholder="请输入密码"
            >
              <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-row :gutter="0">
            <a-col :span="14">
              <a-form-item>
                <a-input
                  v-decorator="['inputCode',validatorRules.inputCode]"
                  size="large"
                  type="text"
                  @change="inputCodeChange"
                  placeholder="请输入验证码"
                >
                  <a-icon
                    slot="prefix"
                    v-if=" inputCodeContent==verifiedCode "
                    type="smile"
                    :style="{ color: 'rgba(0,0,0,.25)' }"
                  />
                  <a-icon slot="prefix" v-else type="frown" :style="{ color: 'rgba(0,0,0,.25)' }" />
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <j-graphic-code @success="generateCode" style="float: right"></j-graphic-code>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>

      <a-form-item>
        <a-checkbox v-model="formLogin.rememberMe">自动登陆</a-checkbox>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="loginBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="loginBtn"
        >确定</a-button>
      </a-form-item>
    </a-form>

    <two-step-captcha
      v-if="requiredTwoStepCaptcha"
      :visible="stepCaptchaVisible"
      @success="stepCaptchaSuccess"
      @cancel="stepCaptchaCancel"
    ></two-step-captcha>

    <a-modal
      title="登录部门选择"
      :width="450"
      :visible="departVisible"
      :closable="false"
      :maskClosable="false"
    >
      <template slot="footer">
        <a-button type="primary" @click="departOk">确认</a-button>
      </template>

      <a-form>
        <a-form-item
          :labelCol="{span:4}"
          :wrapperCol="{span:20}"
          style="margin-bottom:10px"
          :validate-status="validate_status"
        >
          <a-tooltip placement="topLeft">
            <template slot="title">
              <span>您隶属于多部门，请选择登录部门</span>
            </template>
            <a-avatar style="backgroundColor:#87d068" icon="gold" />
          </a-tooltip>
          <a-select
            @change="departChange"
            :class="{'valid-error':validate_status=='error'}"
            placeholder="请选择登录部门"
            style="margin-left:10px;width: 80%"
          >
            <a-icon slot="suffixIcon" type="gold" />
            <a-select-option
              v-for="d in departList"
              :key="d.id"
              :value="d.orgCode"
            >{{ d.departName }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
//import md5 from "md5"
import api from '@/api'
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import Vue from 'vue'
import { ACCESS_TOKEN, ENCRYPTED_STRING } from '@/store/mutation-types'
import JGraphicCode from '@/components/jeecg/JGraphicCode'
import { putAction } from '@/api/manage'
import { postAction } from '@/api/manage'
import { encryption, getEncryptedString } from '@/utils/encryption/aesEncrypt'

export default {
  components: {
    TwoStepCaptcha,
    JGraphicCode
  },
  data() {
    return {
      // customActiveKey: "tab1",
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      requiredTwoStepCaptcha: false,
      stepCaptchaVisible: false,
      form: this.$form.createForm(this),
      encryptedString: {
        key: '',
        iv: ''
      },
      state: {
        time: 60,
        smsSendBtn: false
      },
      formLogin: {
        username: '',
        password: '',
        captcha: '',
        //mobile: "",
        rememberMe: true
      },
      validatorRules: {
        username: { rules: [{ required: true, message: '请输入用户名!', validator: 'click' }] },
        password: { rules: [{ required: true, message: '请输入密码!', validator: 'click' }] },
        captcha: { rule: [{ required: true, message: '请输入验证码!' }] },
        inputCode: { rules: [{ required: true, message: '请输入验证码!' }, { validator: this.validateInputCode }] }
      },
      verifiedCode: '',
      inputCodeContent: '',
      inputCodeNull: true,

      departList: [],
      departVisible: false,
      departSelected: '',
      currentUsername: '',
      validate_status: ''
    }
  },
  created() {
    Vue.ls.remove(ACCESS_TOKEN)
    this.getRouterData()
    this.getEncrypte()
  },
  methods: {
    // vuex 方法映射
    ...mapActions(['Login', 'Logout']),
    // handler
    handleUsernameOrEmail(rule, value, callback) {
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        this.loginType = 0
      } else {
        this.loginType = 1
      }
      callback()
    },

    handleSubmit() {
      let that = this
      let loginParams = {
        remember_me: that.formLogin.rememberMe,
        appid: 2
      }
      that.loginBtn = true
      // 使用账户密码登陆
      //if (that.customActiveKey === 'tab1') {
      that.form.validateFields(['username', 'password', 'inputCode'], { force: true }, (err, values) => {
        if (!err) {
          loginParams.username = values.username
          //loginParams.password = md5(values.password)
          loginParams.password = encryption(values.password, that.encryptedString.key, that.encryptedString.iv).replace(
            /\+/g,
            '%2B'
          )
          that
            .Login(loginParams)
            .then(res => {
              this.departConfirm(res)
              console.log(1111)
            })
            .catch(err => {
              that.requestFailed(err)
              
            })
        } else {
          that.loginBtn = false
        }
      })
    },

    stepCaptchaSuccess() {
      this.loginSuccess()
    },
    stepCaptchaCancel() {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    loginSuccess() {
      this.loginBtn = false
      debugger
      this.$router.push({ name: 'issue' })
    
      this.$notification.success({
        message: '欢迎',
        description: `${timeFix()}，欢迎回来`
      })
    },
    cmsFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: err,
        duration: 4
      })
    },
    requestFailed(err) {
      this.$notification['error']({
        message: '登录失败',
        description: ((err.response || {}).data || {}).message || err.message || '请求出现错误，请稍后再试',
        duration: 4
      })
      this.loginBtn = false
    },

    validateInputCode(rule, value, callback) {
      if (!value || this.verifiedCode == this.inputCodeContent) {
        callback()
      } else {
        callback('您输入的验证码不正确!')
      }
    },
    generateCode(value) {
      this.verifiedCode = value.toLowerCase()
    },
    inputCodeChange(e) {
      this.inputCodeContent = e.target.value
      if (!e.target.value || 0 == e.target.value) {
        this.inputCodeNull = true
      } else {
        this.inputCodeContent = this.inputCodeContent.toLowerCase()
        this.inputCodeNull = false
      }
    },
    departConfirm(res) {
      if (res.success) {
        let multi_depart = res.result.multi_depart
        //0:无部门 1:一个部门 2:多个部门
        if (multi_depart == 0) {
          this.loginSuccess()
          this.$notification.warn({
            message: '提示',
            description: `您尚未归属部门,请确认账号信息`,
            duration: 3
          })
          console.log(555)
        } else if (multi_depart == 2) {
          this.departVisible = true
          this.currentUsername = this.form.getFieldValue('username')
          this.departList = res.result.departs
          console.log(666)

        } else {
          this.loginSuccess()
          console.log(2222)
        }
      } else {
        this.requestFailed(res)
          console.log(333)
        this.Logout()
      }
    },
    departOk() {
      if (!this.departSelected) {
        this.validate_status = 'error'
        return false
      }
      let obj = {
        orgCode: this.departSelected,
        username: this.form.getFieldValue('username')
      }
      putAction('/sys/selectDepart', obj).then(res => {
        if (res.success) {
          this.departClear()
          this.loginSuccess()
        } else {
          this.requestFailed(res)
          this.Logout().then(() => {
            this.departClear()
          })
        }
      })
    },
    departClear() {
      this.departList = []
      this.departSelected = ''
      this.currentUsername = ''
      this.departVisible = false
      this.validate_status = ''
    },
    departChange(value) {
      this.validate_status = 'success'
      this.departSelected = value
    },
    getRouterData() {
      this.$nextTick(() => {
        this.form.setFieldsValue({
          username: this.$route.params.username
        })
      })
    },
    //获取密码加密规则
    getEncrypte() {
      var encryptedString = Vue.ls.get(ENCRYPTED_STRING)
      if (encryptedString == null) {
        getEncryptedString().then(data => {
          this.encryptedString = data
        })
      } else {
        this.encryptedString = encryptedString
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }
}
</style>
<style>
.valid-error .ant-select-selection__placeholder {
  color: #f5222d;
}
</style>