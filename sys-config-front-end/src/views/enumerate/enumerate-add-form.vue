<template>
  <span>
    <span v-if="addOrEdit">
      <a-modal
        :visible="visible"
        title="添加枚举类"
        okText="保存"
        @cancel="() => { $emit('cancel') }"
        @ok="handleCreate"
        :confirmLoading="confirmLoading"
        :keyboard="keyboard"
        :maskClosable="maskClosable"
      >
        <a-form layout="vertical" :form="form">
          <a-form-item label="名称">
            <a-input v-decorator="['name',valueValidator.name]" autocomplete="off" />
          </a-form-item>
        </a-form>
      </a-modal>
    </span>
    <span v-if="!addOrEdit">
      <a-modal
        :visible="visible"
        title="编辑枚举类"
        okText="修改"
        @cancel="() => { $emit('cancel') }"
        @ok="handleCreate"
        :confirmLoading="confirmLoading"
        :keyboard="keyboard"
        :maskClosable="maskClosable"
      >
        <a-form layout="vertical" :form="form">
          <a-form-item label="枚举类">
            <a-input v-decorator="['name',valueValidator.name]" autocomplete="off" />
          </a-form-item>
        </a-form>
      </a-modal>
    </span>
  </span>
</template>

<script>
export default {
  name: 'enumerate-add-form',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      validateStatus: '',
      helpMsg: '',
      confirmLoading: false, //异步关闭弹出窗
      keyboard: false, //是否支持Esc键关闭
      maskClosable: false, //点击蒙层是否关闭弹窗
      form: this.$form.createForm(this),
      valueValidator: {
        //表单验证
        name: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '枚举类名称不能为空!' },
            { max: 100, message: '枚举类名称长度不能大于100!' },
            { validator: this.checkValues }
          ]
        }
      }
    }
  },
  props: ['parentObj', 'visible', 'addOrEdit'], //获取父组件传过来的值
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    handleCreate() {
      //保存枚举类
      const that = this
      const form = that.form
      let obj = that.parentObj
      that.confirmLoading = true
      that.form.validateFields((err, values) => {
        if (err) {
          console.log(err);
          that.confirmLoading = false
          return
        }
        if (obj !== null && obj !== undefined && obj !== '') {
          //编辑
          that.$message.loading('枚举类修改中,请稍等...')
          values.guid = obj.guid
          values.updatedTime = obj.updatedTime
          console.log("values",values);
          that.$http
            .put('/sys/enum-dictionary/type', values)
            .then(res => {
              if (res) {
                that.$message.success('枚举类修改成功!')
                that.form.resetFields() //清空form表单
                that.confirmLoading = false
                that.$emit('cancel') //关闭弹出层
                that.$emit('reloadTable')
              }
            })
            .catch(error => {
              that.confirmLoading = false
              if (error.response.status === 600) {
                that.$message.error('该枚举类不存在或已被删除!')
              } else if (error.response.status === 602) {
                that.$message.warning('枚举类名称已存在!')
              }else if (error.response.status === 606) {
                that.$message.warning('该枚举类已被修改，请刷新后重试!')
              } else {
                that.$message.error('枚举类修改失败!')
              }
            })
        } else {
          that.$message.loading('枚举类添加中,请稍等...')
          that.$http
            .post('/sys/enum-dictionary/type', values)
            .then(res => {
              if (res) {
                that.$message.success('枚举类添加成功!')
                that.form.resetFields() //清空form表单
                that.confirmLoading = false
                that.$emit('cancel') //关闭弹出层
                that.$emit('reloadTable')
              }
            })
            .catch(error => {
              that.confirmLoading = false
              if (error.response.status === 602) {
                that.$message.error('该枚举类已存在!')
              } else if (error.response.status === 604) {
                that.$message.warning('枚举类名称不能为空!')
              } else {
                that.$message.error('枚举类添加失败!')
              }
            })
        }
      })
    },
    showHint(status, message) {
      //操作提示
      const that = this
      that.validateStatus = status
      that.helpMsg = message
    },
    cleanHint() {
      //清空操作提示
      const that = this
      this.validateStatus = ''
      this.helpMsg = ''
    },
    checkValues(rule, value, callback) {
      let message = null
      let re = null
      if (rule.field === 'name') {
        if (!this.$RegExpValidate.excludeSpecialCharacter(value)) {
          message = '输入的值中存在特殊字符或空格!'
        }
      }

      if (message === null) {
        callback()
      } else {
        callback(message)
      }
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

<style>
</style>
