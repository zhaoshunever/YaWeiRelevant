<template>
  <a-modal
    :title="title"
    :width="1000"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
    wrapClassName="ant-modal-cust-warp"
    style="top:10%;height: 800px;overflow-y: hidden"
  >
   <div class="box">
    <table class="tbs" border="1" width="950" height="800">
      <tr>
        <th colspan="1">工单状态</th>
        <td colspan="5">{{this.model.status}}</td>
      </tr>
      <tr>
        <th>工单编号</th>
        <td>{{this.model.id}}</td>
        <th>联系人</th>
        <td>{{this.model.name}}</td>
        <th>联系电话</th>
        <td>{{this.model.phone}}</td>
      </tr>
      <tr>
        <th colspan="1">联系地址</th>
        <td colspan="5">{{this.model.address}}</td>
      </tr>
      <tr>
        <th>受理人</th>
        <td>{{this.model.acceptName}}</td>
        <th>受理编号</th>
        <td>{{this.model.acceptId}}</td>
        <th>受理渠道</th>
        <td>{{this.model.acceptType}}</td>
      </tr>
      <tr>
        <th>办理类型</th>
        <td>{{this.model.doType}}</td>
        <th>来电类别</th>
        <td>{{this.model.kind}}</td>
        <th>录入时间</th>
        <td>{{this.model.luruTime}}</td>
      </tr>
      <tr>
        <th>紧急程度</th>
        <td colspan="2">{{this.model.degree}}</td>
        <th>问题分类</th>
        <td colspan="2">{{this.model.queKind}}</td>
      </tr>
      <tr>
        <th>是否保密</th>
        <td>{{this.model.secret}}</td>
        <th>是否回复</th>
        <td>{{this.model.repeat}}</td>
         <th>回复备注</th>
        <td>{{this.model.repeatPs}}</td>
      </tr>
      <tr>
        <th colspan="1">描述</th>
        <td colspan="5">{{this.model.description}}</td>
      </tr>
      <tr>
        <th colspan="1">附件</th>
        <td colspan="5"></td>
      </tr>
      <tr>
          <td colspan="6" align="center">办理信息</td>
      </tr>
      <tr>
        <th>发送人</th>
        <td>{{this.model.name}}</td>
        <th>发送时间</th>
        <td>{{this.model.sendTime}}</td>
         <th>办理时限</th>
        <td>{{this.model.startTime}}</td>
      </tr>
      <tr>
          <th colspan="1">转办意见</th>
          <td colspan="5">{{this.model.turnQue}}</td>
      </tr>
       <tr>
          <th colspan="1">转办流程</th>
          <td colspan="5">{{this.model.turnFun}}</td>
      </tr>
    </table>
   </div>
  </a-modal>
</template>
<style lang="less" scoped>
    .box{
      .tbs{
         th{
            border: border!important;
            text-align: center!important;
         }
      }
    }
    
</style>
<script>
import pick from 'lodash.pick'
import { constants } from 'crypto'

export default {
  name: 'transactionDillModal',
  data() {
    return {
      title: '济南12345办理通知单',
      visible: false,
      roleDisabled: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      form: this.$form.createForm(this)
    }
  },
  created() {},
  methods: {
    show(record) {
      this.model = Object.assign({}, record)
      console.log(this.model)
      console.log(record)

      this.visible = true
    },

    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      const that = this
      // 触发表单验证
    },
    handleCancel() {
      this.close()
    }
  }
}
</script>

