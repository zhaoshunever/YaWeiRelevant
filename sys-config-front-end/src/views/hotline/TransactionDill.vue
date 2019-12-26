<template>
  <a-card :bordered="false" class="card-area">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <!-- 搜索区域 -->
      <a-form layout="inline">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="名称" :labelCol="{span: 5}" :wrapperCol="{span: 18, offset: 1}">
              <a-input placeholder="请输入名称查询" v-model="queryParam.name"></a-input>
            </a-form-item>
          </a-col>
          <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
            <a-col :md="6" :sm="24">
              <a-button type="primary" @click="searchQuery">查询</a-button>
             
            </a-col>
          </span>
        </a-row>
      </a-form>
       <a-button style="margin-left: 8px">下发转办</a-button>
        <a-button style="margin-left: 8px" >打印1</a-button>
         <a-button style="margin-left: 8px">打印2</a-button>
          <a-button style="margin-left: 8px" >列表导出</a-button>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" style="margin-top: 5px">
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1">
            <a-icon type="delete" />删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择&nbsp;
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      >
        <span slot="action" slot-scope="text, record">
          <a @click="showDetails(record)">详情</a>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->
    <TransactionDillModal ref="transactionDillModal"></TransactionDillModal>
    <!-- 表单区域 -->
  </a-card>
</template>

<script>
import { LangsinListMixin } from '@/mixins/LangsinListMixin'
import JDate from '@/components/jeecg/JDate'
import { constants } from 'crypto'
import TransactionDillModal from './modules/TransactionDillModal'

const TranData = [
  {
    id: '000000001',
    key: '000000001',
    status:"待处理",
    phone:"13650000004",
    telPhone:"13655456545",
    address:"山东省济南市市中区王官庄",
    doType:"转办",
    kind:"投诉",
    luruTime:"2019/9/1 17:45:22",
    queKind:"社会事业",
    acceptName:"张三",
    acceptId:"000000032",
    acceptType:"来电",
    workId: '1000000001',
    degree: '一般',
    startTime: '2019-09-01',
    sendTime: '2019/9/1 17:45:22',
    description: '来电反应,南辛庄小吃摊乱倒污水',
    secret: '保密',
    repeat: '需回复',
    name: '王先生',
    repeatPs:"*****",
    turnQue:"请及时处理",
    turnFun:"转办到城管处理"


  }
]
export default {

  name: 'RoleList',
  mixins: [LangsinListMixin],
  components: {
    TransactionDillModal,
    JDate
  },
  data() {
    return {
      description: '角色管理页面',
      // 查询条件
      queryParam: {},
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '工单编号',
          align: 'center',
          dataIndex: 'workId'
        },
        {
          title: '办理时限',
          align: 'center',
          dataIndex: 'startTime'
        },
        {
          title: '紧急程度',
          align: 'center',
          dataIndex: 'sendTime'
        },
        {
          title: '问题描述',
          align: 'center',
          dataIndex: 'description'
        },

        {
          title: '是否保密',
          align: 'center',
          dataIndex: 'secret'
        },
        {
          title: '是否需回复',
          align: 'center',
          dataIndex: ' repeat'
        },
        {
          title: '发送人',
          align: 'center',
          dataIndex: 'name'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },

  methods: {
    showDetails(record) {
      this.$refs.transactionDillModal.show(record)
    },
    searchReset() {
      //重置按钮
      this.queryParam.name = ''
    },
    loadData() {
      this.dataSource = TranData
      this.ipagination.total = TranData.length
    }
  },
  mounted() {}
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>