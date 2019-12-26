<template>
  <a-card :bordered="false" :title="name" class="card-area">
    <!-- 功能块Start -->
    <div class="function-div">
      <span>
        <a-button type="primary" ghost @click="goBack">
          <a-icon type="left" />返回
        </a-button>
      </span>
      <span>
        <a-button type="primary" @click="showModal">
          <a-icon type="plus-square" />添加枚举值
        </a-button>
        <enumCodeForm
          ref="myEnumCodeForm"
          :parentObj="parentObject"
          :addOrEdit="addOrEdit"
          :visible="visible"
          @cancel="handleCancel"
          @reloadTable="handleTableChange"
          @cleanEditEnumCodeForm="cleanEditEnumCodeForm"
        ></enumCodeForm>
      </span>
    </div>
    <!-- 功能块End -->
    <!-- 分页列表块Start -->
    <!-- 
          :rowKey="record => record.guid"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange,columnWidth:'5%'}"
    -->
    <a-table
      :columns="columns"
      :dataSource="data"
      :pagination="pagination"
      :showHeader="showHeader"
      :bordered="bordered"
      :scroll="scroll"
      :loading="loading"
      @change="handleTableChange"
      :rowClassName="rowClassName"
    >
      <!-- 排序列修改Start -->
      <template slot="sequence" slot-scope="text, record">
        <editable-cell :text="text" @change="updateSequence(record, 'sequence', $event)" />
      </template>
      <!-- 排序列修改End -->
      <!-- 操作列Start -->
      <span slot="action" slot-scope="text, record" @click.stop>
        <a-tooltip placement="top">
          <template slot="title">
            <span>编辑</span>
          </template>
          <a-button
            type="primary"
            :size="size"
            :loading="a_button_loading"
            ghost
            @click="editEnumerate(record)"
          >
            <a-icon type="edit" />
          </a-button>
        </a-tooltip>
        <a-popconfirm @confirm="deleteEnumCode(record.guid)">
          <template slot="title">
            <p>该操作会删除枚举值！</p>
            <p>确定执行删除吗？</p>
          </template>
          <a-tooltip placement="top">
            <template slot="title">
              <span>删除</span>
            </template>
            <a-button type="danger" :size="size" :loading="a_button_loading" ghost>
              <a-icon type="delete" />
            </a-button>
          </a-tooltip>
        </a-popconfirm>
      </span>
      <!-- 操作列End -->
    </a-table>
    <!-- 分页列表块End -->
  </a-card>
</template>
<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import enumCodeForm from './enumerate-code-add-form' //弹窗组件
import EditableCell from '@/components/EditableCell/EditableCell-Number'

//Table的头部标题
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    width: '40%',
    align: 'center'
  },
  {
    title: 'Code值',
    dataIndex: 'code',
    width: '20%',
    align: 'center'
  },
  {
    title: '排序',
    dataIndex: 'sequence',
    width: '20%',
    align: 'center',
    // sorter: true,//是否有排序
    scopedSlots: { customRender: 'sequence' }
  },
  {
    title: '操作',
    key: 'action',
    width: '20%',
    align: 'center',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'enumerate-code-index',
  //import引入的组件需要注入到对象中才能使用
  components: { enumCodeForm, EditableCell },
  data() {
    //这里存放数据
    return {
      guid: '',
      name: '',
      data: [], //数据
      columns, //列表标题栏以及每一列的取值key，文字位置，每一列宽度
      pagination: {
        //分页设置
        //current:1,//当前页数
        //pageSize: 10,//每页显示条数（在有指定每页显示多少条选项时，该设置需要注掉，貌似有冲突）
        defaultCurrent: 1, //默认当前页数
        defaultPageSize: 100, //默认每页（在有指定每页显示多少条选项时，使用默认每页显示多少条进行初始化）
        showQuickJumper: true, //是否显示快速跳转
        showSizeChanger: true, //是否可以改变pageSize
        size: 'large', //小尺寸分页
        showTotal: total => {
          //显示数据总量
          return `共 ${total} 条`
        },
        pageSizeOptions: ['100', '200', '300'], //指定每页可以显示多少条
        showSizeChange: (current, size) => {}, //切换每页显示条数时的回调函数
        hideOnSinglePage: true //只有一页数据时不显示分页器
      },
      selectedRowKeys: [],
      loading: false, //列表是否刷新
      showHeader: true, //是否显示列表标题行
      bordered: true, //是否显示列表边框
      scroll: { y: 480 }, //设置横向或纵向滚动，也可用于指定滚动区域的宽和高，建议为 x 设置一个数字，如果要设置为 true，需要配合样式 .ant-table td { white-space: nowrap; }
      //shape:"",//操作列按钮形状
      size: 'small', //操作列按钮大小
      a_button_loading: false, //操作列按钮是否刷新
      rowClassName: (record, index) => {
        return 'tr-span-button'
      },
      parentObject: '', //传给子组件的值
      visible: false, //传给子组件的值，用于弹出窗的显示和隐藏
      addOrEdit: true //添加true，添加false
    }
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    getData(params = {}) {
      //获取数据
      // const pagination = { ...this.pagination };
      // let size=pagination.defaultPageSize;
      // let page=pagination.defaultCurrent-1;
      // if(Object.keys(params).length!=0){
      //     size=params.size;
      //     page=params.page-1;//第一页默认为0
      // }
      this.loading = true
      this.$http
        .get('/sys/enum-dictionary/all-code/' + localStorage.enum_type_guid)
        .then(res => {
          if (res) {
            this.data = res
            // console.log("res",res);
            // pagination.total = res.size();//数据总条数
            // this.pagination = pagination;
            this.loading = false
          }
        })
        .catch(error => {
          this.loading = false
          console.log(error)
        })
    },
    handleTableChange(pagination, filters, sorter) {
      //页码改变的回调，参数是改变后的页码及每页条数
      const that = this
      // if(pagination===null||pagination===undefined){
      //   pagination=that.pagination;
      // }
      // that.getData({
      //   size: pagination.pageSize,
      //   page: pagination.current,
      // });
      that.getData()
    },
    deleteEnumCode(guid) {
      //删除枚举类
      const that = this
      const typeGuid = localStorage.enum_type_guid
      that.a_button_loading = true
      // console.log("删除key为"+guid+"枚举类");
      that.$http
        .delete('/sys/enum-dictionary/code/' + typeGuid + '-in-' + guid)
        .then(res => {
          if (res) {
            that.$message.success('枚举值删除成功!')
            that.a_button_loading = false
            that.handleTableChange()
          }
        })
        .catch(error => {
          that.a_button_loading = false
          if (error.response.status === 600) {
            that.$message.error('该枚举值不存在或已被删除!')
          } else {
            that.$message.error('枚举值删除失败!')
          }
        })
    },
    editEnumerate(enumCode) {
      //编辑枚举类
      const that = this
      // console.log("编辑guid为"+guid+"枚举类");
      that.$refs.myEnumCodeForm.form.resetFields() //清空form表单
      that.parentObject = enumCode
      that.addOrEdit = false //编辑
      that.visible = true //打开弹出窗
      //将回调延迟到下次 DOM 更新循环之后执行
      that.$nextTick(() => {
        that.$refs.myEnumCodeForm.form.setFieldsValue(enumCode)
      })
    },
    cleanEditEnumCodeForm(guid, name) {
      //清空父组件向子组件传的值
      const that = this
      that.parentObject = ''
    },
    onSelectChange(selectedRowKeys) {
      //选中事件
      // console.log('selectedRowKeys changed: ', selectedRowKeys);
      this.selectedRowKeys = selectedRowKeys
    },
    updateSequence(enumCode, key, sequence) {
      const that = this
      const values = {
        guid: localStorage.enum_type_guid,
        name: localStorage.enum_type_name,
        codes: [{ guid: enumCode.guid, sequence: sequence, updatedTime: enumCode.updatedTime }]
      }
      // console.log('values', values)
      // return false;
      that.$message.loading('修改枚举值排序中，请稍后...')
      that.$http
        .put('/sys/enum-dictionary/type/sequence', values)
        .then(res => {
          if (res) {
            that.$message.success('修改枚举值排序成功！')
            that.handleTableChange()
          }
        })
        .catch(error => {
          if (error.response.status === 600) {
            that.$message.error('该枚举值不存在或已被删除!')
          } else if (error.response.status === 606) {
            that.$message.warning('该枚举值已被修改，请刷新后重试!')
          } else {
            that.$message.error('修改枚举值排序失败!')
          }
          that.handleTableChange()
        })
    },
    showModal() {
      //打开弹出层
      var that = this
      that.addOrEdit = true //添加
      that.visible = true
    },
    handleCancel() {
      //关闭弹出层
      var that = this
      //console.log(that.$refs.myEnumCodeForm.form);
      that.$refs.myEnumCodeForm.form.resetFields() //清空form表单
      that.parentObject = ''
      that.visible = false
    },
    goBack() {
      //返回枚举类分页列表
      var that = this
      localStorage.removeItem('enum_type_guid')
      localStorage.removeItem('enum_type_name')
      this.$router.go(-1)
      // that.$router.push({name:'/enumerate/index',params:{pagination:that.$route.params.pagination}});
      // that.$router.push({path:'/enumerate/index',query:{pagination:that.$route.params.pagination}});
    },
    getLocalStorage() {
      //从localStorage中获取guid和name
      const that = this
      // console.log("localStorage.enum_type_guid",localStorage.enum_type_guid);
      if (localStorage.enum_type_guid === null || localStorage.enum_type_guid === undefined) {
        that.goBack()
      }
      that.guid = localStorage.enum_type_guid
      that.name = localStorage.enum_type_name
    },
    initResolution() {
      const that = this
      let height = window.screen.height - 430
      if (height > 0) {
        that.scroll = { y: height }
      }
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getData()
    this.getLocalStorage()
    this.initResolution()
  },
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    window.onresize = () => {
      this.initResolution()
    }
  },
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
.ant-table td {
  white-space: nowrap;
}
.function-div {
  height: 45px;
}
.function-div span {
  margin-left: 10px;
}
.tr-span-button td span button {
  margin-left: 10px;
}
.editable-cell {
  position: relative;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: none;
}

.editable-cell-icon-check {
  line-height: 28px;
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}

.editable-add-btn {
  margin-bottom: 8px;
}
</style>
