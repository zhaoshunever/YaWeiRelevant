<!-- 组织机构首页 -->
<template>
  <div class="eidt-page">
    <a-form :form="form" v-if="is_show_edit">
      <a-form-item label="组织机构层级" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-model="view_data.level" disabled></a-input>
      </a-form-item>
      <a-form-item label="组织机构名称" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-decorator="['name',valueValidator.name]" v-if="view_data.code!=='0'" />
        <a-input v-model="view_data.name" v-else-if="view_data.code==='0'" disabled></a-input>
      </a-form-item>
      <a-form-item label="组织机构代码" :label-col="labelCol" :wrapper-col="wrapperCol">
        <!-- <a-input v-decorator="['code', valueValidator.code]" v-if="view_data.code!=='0'" /> -->
        <div class="input-div" v-if="view_data.code!='0'&&leader!=''">{{leader}}</div>
        <a-input
          v-decorator="['code', valueValidator.code]"
          v-if="view_data.code!='0'"
          autocomplete="off"
          style="width:85%"
        />
        <a-input v-model="view_data.code" v-if="view_data.code==='0'" disabled />
      </a-form-item>
      <a-form-item
        label="管理员"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        v-if="view_data.code!=='0'"
      >
        <a-input v-decorator="['manager', valueValidator.manager]" autocomplete="off" />
      </a-form-item>
      <a-form-item
        label="联系电话"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        v-if="view_data.code!=='0'"
      >
        <a-input v-decorator="['phone', valueValidator.phone]" autocomplete="off" />
      </a-form-item>
      <a-form-item
        label="是否三方通话"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        v-if="view_data.code!=='0'"
      >
        <a-switch
          v-if="view_data.isThreeWayCalling"
          v-decorator="['isThreeWayCalling',valueValidator.isThreeWayCalling]"
          defaultChecked
        >
          <a-icon type="check" slot="checkedChildren" />
          <a-icon type="close" slot="unCheckedChildren" />
        </a-switch>
        <a-switch v-else v-decorator="['isThreeWayCalling',valueValidator.isThreeWayCalling]">
          <a-icon type="check" slot="checkedChildren" />
          <a-icon type="close" slot="unCheckedChildren" />
        </a-switch>
      </a-form-item>
      <a-form-item
        label="责任人"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        v-if="view_data.code!=='0'"
      >
        <a-input v-decorator="['duty', valueValidator.duty]" autocomplete="off" />
      </a-form-item>
      <a-form-item
        label="经度"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        v-if="view_data.code!=='0'"
      >
        <a-input-number
          size="large"
          v-decorator="['longitude',valueValidator.longitude]"
          class="number-input"
          :min="0"
          :max="180"
          :step="0.1"
        />
      </a-form-item>
      <a-form-item
        label="纬度"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        v-if="view_data.code!=='0'"
      >
        <a-input-number
          size="large"
          v-decorator="['latitude',valueValidator.latitude]"
          class="number-input"
          :min="0"
          :max="180"
          :step="0.1"
        />
      </a-form-item>
      <a-form-item class="button-div-right" v-if="view_data.code!=='0'">
        <a-button type="primary" @click="edit_data" :loading="saveLoading">修改</a-button>
        <a-button type="danger" ghost @click="delUnit" :loading="saveLoading">删除</a-button>
      </a-form-item>
    </a-form>
    <a-form :form="form" v-if="is_show_add">
      <a-form-item label="上级组织" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-model="view_data.name" disabled></a-input>
      </a-form-item>
      <a-form-item label="组织名称" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-decorator="['name',valueValidator.name]" autocomplete="off" />
      </a-form-item>
      <a-form-item label="组织代码" :label-col="labelCol" :wrapper-col="wrapperCol">
        <!-- <a-input v-decorator="['code', valueValidator.code]" autocomplete="off" /> -->
        <div class="input-div" v-if="leader!=''">{{leader}}</div>
        <a-input v-decorator="['code', valueValidator.code]" autocomplete="off" style="width:85%" />
      </a-form-item>
      <a-form-item label="管理员" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-decorator="['manager',valueValidator.manager]" autocomplete="off" />
      </a-form-item>
      <a-form-item label="联系电话" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-decorator="['phone',valueValidator.phone]" autocomplete="off" />
      </a-form-item>
      <a-form-item label="是否三方通话" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-switch
          v-decorator="['isThreeWayCalling',valueValidator.isThreeWayCalling,{ valuePropName: 'checked' }]"
        >
          <a-icon type="check" slot="checkedChildren" />
          <a-icon type="close" slot="unCheckedChildren" />
        </a-switch>
      </a-form-item>
      <a-form-item label="责任人" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input v-decorator="['duty',valueValidator.duty]" autocomplete="off" />
      </a-form-item>
      <a-form-item label="经度" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input-number
          size="large"
          v-decorator="['longitude',valueValidator.longitude]"
          class="number-input"
          :min="0"
          :max="180"
          :step="0.1"
        />
      </a-form-item>
      <a-form-item label="纬度" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-input-number
          size="large"
          v-decorator="['latitude',valueValidator.latitude]"
          class="number-input"
          :min="0"
          :max="180"
          :step="0.1"
        />
      </a-form-item>
      <a-form-item class="button-div-right">
        <a-button type="primary" @click="save_sub_unit" :loading="saveLoading">保存</a-button>
        <a-button type="danger" @click="cancleAddForm" ghost :loading="saveLoading">关闭</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  name: 'unit-form',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  props: ['is_show_edit', 'is_show_add', 'view_data', 'add_data', 'tree_data'], //获取父组件传过来的值
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {
    is_show_add: {
      handler(newValue, oldValue) {
        if (newValue) {
          console.log('newValue', newValue)
          if (this.is_show_add) {
            this.leader = ''
            let length = this.view_data.code.length
            if (this.view_data.code === '0') {
              this.valueValidator.code.rules.splice(2, 1, { max: 2, message: '一级组织代码长度不能大于2!' })
              this.valueValidator.code.rules.splice(3, 1, { min: 2, message: '一级组织代码长度不能小于2!' })
            } else {
              this.leader = this.view_data.code
              this.valueValidator.code.rules.splice(2, 1, { max: 2, message: '每级专项分类代码增长量不能大于2!' })
              this.valueValidator.code.rules.splice(3, 1, { min: 2, message: '每级专项分类代码增长量不能小于2!' })
            }
          }
        }
      }
    }
  },
  data() {
    return {
      saveLoading: false, //按钮是否刷新
      labelCol: { span: 3, push: 1 },
      wrapperCol: { span: 20, push: 1 },
      form: this.$form.createForm(this),
      valueValidator: {
        //表单验证
        name: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '组织名称不能为空!' },
            { max: 50, message: '组织名称长度不能大于20!' },
            { validator: this.checkValues }
          ]
        },
        code: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [{ required: true, message: '组织代码不能为空!' }, { validator: this.checkValues }, {}, {}]
        },
        manager: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '管理员不能为空!' },
            { max: 38, message: '管理员名称长度不能大于38!' },
            { validator: this.checkValues }
          ]
        },
        phone: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '联系电话不能为空!' },
            { max: 15, message: '联系电话长度不能大于15!' },
            { validator: this.checkValues }
          ]
        },
        duty: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '责任人不能为空!' },
            { max: 50, message: '责任人名称长度不能大于50!' },
            { validator: this.checkValues }
          ]
        },
        longitude: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          initialValue: 0 //初始化
        },
        latitude: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          initialValue: 0 //初始化
        },
        isThreeWayCalling: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          initialValue: false, //初始化
          valuePropName: 'checked' //加上该属性，使得可使用form.resetFields()清空switch状态
        }
      },
      leader: ''
    }
  },
  //方法集合
  methods: {
    // 修改当前机构
    edit_data() {
      var that = this
      that.saveLoading = true
      that.form.validateFields((err, values) => {
        if (err) {
          console.log('err', err)
          that.saveLoading = false
          return
        }
        values.guid = that.view_data.guid
        values.updatedTime = that.view_data.updatedTime
        values.code = that.leader + values.code
        // console.log('values', values)
        // return false
        that.$message.loading('组织修改中,请稍等...')
        that.$http
          .put('/sys/dept/', values)
          .then(res => {
            that.$message.success('组织修改成功!')
            //res.isLeaf = false;
            res.key = res.guid
            res.title = res.name
            //res.level=that.view_data.level;
            // 树控件不刷新，暂时屏蔽掉
            that.$emit('operate_tree_edit', res, that.tree_data)
            that.saveLoading = false
            that.cancleEditForm()
          })
          .catch(error => {
            // console.log("error",error);
            that.saveLoading = false
            if (error.response.status === 600) {
              that.$message.error('该组织不存在或已被删除!')
            } else if (error.response.status === 601) {
              that.$message.warning('该组织代码已存在!')
            } else if (error.response.status === 606) {
              that.$message.warning('该组织已被修改，请刷新后重试!')
            } else {
              that.$message.error('组织修改失败!')
            }
          })
      })
    },
    // 新增下级机构
    save_sub_unit() {
      const that = this
      that.saveLoading = true
      const topGuid = that.view_data.guid
      that.form.validateFields((err, values) => {
        if (err) {
          that.saveLoading = false
          return
        }
        values.code = that.leader + values.code
        // console.log('values', values)
        // return false
        that.$message.loading('组织保存中,请稍等...')
        that.$http
          .post('/sys/dept/sub/' + topGuid, values)
          .then(res => {
            that.$message.success('组织保存成功!')
            //res.isLeaf = false
            res.key = res.guid
            res.title = res.name
            // 树控件不刷新，暂时屏蔽掉
            that.$emit('operate_tree_add', topGuid, that.tree_data, res)
            that.saveLoading = false
            that.cancleAddForm()
            that.form.resetFields() //清空form表单
          })
          .catch(error => {
            // console.log('error', error)
            that.saveLoading = false
            if (error.response.status === 600) {
              that.$message.error('该组织不存在或已被删除!')
            } else if (error.response.status === 601) {
              that.$message.warning('该组织代码已存在!')
            } else {
              that.$message.error('组织添加失败!')
            }
          })
      })
    },
    delUnit() {
      // 删除组织
      var that = this
      that.$emit('del_unit')
    },
    checkValues(rule, value, callback) {
      console.log('value', value)
      let message = null
      let re = null
      if (rule.field === 'name') {
        if (!this.$RegExpValidate.excludeSpecialCharacter(value)) {
          message = '输入的值中存在特殊字符或空格!'
        }
      } else if (rule.field === 'code') {
        if (!this.$RegExpValidate.isNumber(value)) {
          message = '组织代码只能输入数字!'
        }
      } else if (rule.field === 'manager') {
        if (!this.$RegExpValidate.excludeSpecialCharacter(value)) {
          message = '输入的值中存在特殊字符或空格!'
        }
      } else if (rule.field === 'phone') {
        if (!this.$RegExpValidate.isPhone(value)) {
          message = '联系电话格式不正确!'
        }
      } else if (rule.field === 'duty') {
        if (!this.$RegExpValidate.excludeSpecialCharacter(value)) {
          message = '输入的值中存在特殊字符或空格!'
        }
      }

      if (message === null) {
        callback()
      } else {
        callback(message)
      }
    },
    cancleAddForm() {
      this.$emit('cancleUnitForm', 'add')
    },
    cancleEditForm() {
      this.$emit('cancleUnitForm', 'edit')
    },
    cancleDeleteForm(temp_data) {
      this.$emit('cancleUnitForm', 'delete', temp_data)
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeCreate() {}, //生命周期 - 创建之前
  beforeMount() {}, //生命周期 - 挂载之前
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {} //如果页面有keep-alive缓存功能，这个函数会触发
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.eidt-page {
  border-left: 1px solid #eceff1;
  padding: 20px;
}
.ant-btn {
  margin-right: 10px;
}
.button-div-right {
  text-align: right;
}
.button-div-right button {
  margin-right: 10px;
}
.selected-div {
  border: 1px solid #eceff1;
  padding: 10px;
  margin: 10px 0px;
}
.table-page-search-wrapper {
  border-bottom: 1px solid #eceff1;
  padding: 0px 0px 10px 0px;
}
.input-div {
  width: 15%;
  display: inline-block;
  text-align: center;
  border: 1px solid #d9d9d9;
  height: 30px;
  line-height: 29px;
}
</style>