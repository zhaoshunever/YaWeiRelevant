<template>
  <a-card :bordered="false" class="card-area">
    <!-- 功能块Start -->
    <div class="function-div">
      <!-- <a-input-search placeholder="请输入枚举类" style="width: 200px;margin-left: 0px;" @search="onSearch" /> -->
      <span>
        <a-button type="primary" @click="showModal" ghost>
          <a-icon type="plus-square" />添加枚举类
        </a-button>
        <enumForm
          ref="myEnumForm"
          :parentObj="parentObject"
          :addOrEdit="addOrEdit"
          :visible="visible"
          @cancel="handleCancel"
          @reloadTable="handleTableChange"
          @cleanEditEnumerateForm="cleanEditEnumerateForm"
        ></enumForm>
      </span>
    </div>
    <!-- 功能块End -->
    <!-- 分页列表块Start -->
    <!-- :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange,columnWidth:'5%'}" -->
    <a-table
      :rowKey="record => record.guid"
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
      <!-- 操作列Start -->
      <span slot="action" slot-scope="text, record" @click.stop>
        <a-tooltip placement="top">
          <template slot="title">
            <span>编辑</span>
          </template>
          <a-button
            type="primary"
            :size="button_size"
            :loading="a_button_loading"
            ghost
            @click="editEnumerate(record)"
          >
            <a-icon type="edit" />
          </a-button>
        </a-tooltip>
        <a-popconfirm @confirm="deleteEnumerate(record.guid)">
          <template slot="title">
            <p>该操作会删除枚举类及其下所有枚举值！</p>
            <p>确定执行删除吗？</p>
          </template>
          <a-tooltip placement="top">
            <template slot="title">
              <span>删除</span>
            </template>
            <a-button type="danger" :size="button_size" :loading="a_button_loading" ghost>
              <a-icon type="delete" />
            </a-button>
          </a-tooltip>
        </a-popconfirm>
        <a-tooltip placement="top">
          <template slot="title">
            <span>查看枚举值</span>
          </template>
          <a-button type="primary" :size="button_size" ghost @click="getEnumCode(record.guid,record.name)">
            <a-icon type="right" />
          </a-button>
        </a-tooltip>
      </span>
      <!-- 操作列End -->
    </a-table>
    <!-- 分页列表块End -->
  </a-card>
</template>
<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import enumForm from './enumerate-add-form' //弹窗组件

//Table的头部标题
const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    width: '50%',
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    width: '50%',
    align: 'center',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'enumerate-index',
  //import引入的组件需要注入到对象中才能使用
  components: { enumForm },
  data() {
    //这里存放数据
    return {
      data: [], //数据
      columns, //列表标题栏以及每一列的取值key，文字位置，每一列宽度
      pagination: {
        //分页设置
        //current:1,//当前页数
        //pageSize: 10,//每页显示条数（在有指定每页显示多少条选项时，该设置需要注掉，貌似有冲突）
        defaultCurrent: 1, //默认当前页数
        defaultPageSize: 20, //默认每页（在有指定每页显示多少条选项时，使用默认每页显示多少条进行初始化）
        showQuickJumper: true, //是否显示快速跳转
        showSizeChanger: true, //是否可以改变pageSize
        size: 'large', //小尺寸分页
        showTotal: total => {
          //显示数据总量
          return `共 ${total} 条`
        },
        pageSizeOptions: ['20', '30', '40'], //指定每页可以显示多少条
        showSizeChange: (current, size) => {} //切换每页显示条数时的回调函数
        //hideOnSinglePage:true,//只有一页数据时不显示分页器
      },
      selectedRowKeys: [],
      loading: false, //列表是否刷新
      showHeader: true, //是否显示列表标题行
      bordered: true, //是否显示列表边框
      scroll: { y: 460 }, //设置横向或纵向滚动，也可用于指定滚动区域的宽和高，建议为 x 设置一个数字，如果要设置为 true，需要配合样式 .ant-table td { white-space: nowrap; }
      //shape:"",//操作列按钮形状
      button_size: 'small', //操作列按钮大小
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
      let pagination = { ...this.pagination }
      if (localStorage.enum_type_pagination !== undefined) {
        pagination = JSON.parse(localStorage.enum_type_pagination)
        // console.log(pagination);
        localStorage.removeItem('enum_type_pagination')
      }
      let size = pagination.defaultPageSize
      let page = pagination.defaultCurrent - 1
      // if(Object.keys(params).length!=0){
      //     size=params.size;
      //     page=params.page-1;//第一页默认为0
      // }
      if (pagination.pageSize !== undefined && pagination.current !== undefined) {
        size = pagination.pageSize
        page = pagination.current - 1
      }
      this.loading = true
      this.$http
        .get('/sys/enum-dictionary/find-all-type?sort=updated_time&size=' + size + '&page=' + page)
        .then(res => {
          if (res) {
            this.data = res.content
            pagination.total = res.totalElements //数据总条数
            this.pagination = pagination
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
      if (pagination === null || pagination === undefined) {
        pagination = that.pagination
      } else {
        that.pagination = pagination
      }
      // that.getData({
      //   size: pagination.pageSize,
      //   page: pagination.current,
      // });
      that.getData()
    },
    onSearch(value) {
      //搜索
      console.log(value)
    },
    deleteEnumerate(guid) {
      //删除枚举类
      const that = this
      that.a_button_loading = true
      // console.log("删除key为"+guid+"枚举类");
      that.$message.loading('枚举类删除中,请稍等...', 1)
      that.$http
        .delete('/sys/enum-dictionary/' + guid)
        .then(res => {
          if (res) {
            that.$message.success('枚举类删除成功!')
            that.a_button_loading = false
            that.getData()
          }
        })
        .catch(error => {
          that.a_button_loading = false
          if (error.response.status === 600) {
            that.$message.error('该枚举类不存在或已被删除!')
          } else {
            that.$message.error('枚举类删除失败!')
          }
        })
    },
    editEnumerate(record) {
      //编辑枚举类
      const that = this
      that.$refs.myEnumForm.form.resetFields() //清空form表单
      // console.log("编辑guid为"+guid+"枚举类");
      that.parentObject = record
      that.addOrEdit = false //编辑
      that.visible = true //打开弹出窗
      //将回调延迟到下次 DOM 更新循环之后执行
      that.$nextTick(() => {
        that.$refs.myEnumForm.form.setFieldsValue(record) //清空form表单
      })
    },
    cleanEditEnumerateForm(guid, name) {
      //清空父组件向子组件传的值
      const that = this
      that.parentObject = ''
    },
    showModal() {
      //打开弹出层
      var that = this
      that.addOrEdit = true //添加
      that.visible = true
      that.$refs.myEnumForm.form.resetFields() //清空form表单
    },
    handleCancel() {
      //关闭弹出层
      var that = this
      that.$refs.myEnumForm.form.resetFields() //清空form表单
      that.parentObject = ''
      that.visible = false
    },
    getEnumCode(guid, name) {
      const that = this
      if (!window.localStorage) {
        //浏览器不支持localStorage
        alert('浏览器不支持localStorage！')
        return false
      } else {
        const pagination = { ...this.pagination }
        localStorage.setItem('enum_type_guid', guid)
        localStorage.setItem('enum_type_name', name)
        localStorage.setItem('enum_type_pagination', JSON.stringify(pagination))
      }
      that.$router.push({ path: '/enumerate/enumerate-code-index' })
    },
    initResolution() {
      //   console.log(`网页可见区域宽:${document.body.clientWidth}`)
      //   console.log(`网页可见区域高:${document.body.clientHeight}`)
      //   console.log(`网页可见区域宽(包括边线和滚动条的宽):${document.body.offsetWidth}`)
      //   console.log(`网页可见区域高(包括边线的宽):${document.body.offsetHeight}`)
      //   console.log(`网页正文全文高:${document.body.scrollWidth}`)
      //   console.log(`网页被卷去的高:${document.body.scrollTop}`)
      //   console.log(`网页被卷去的左:${document.body.scrollLeft}`)
      //   console.log(`网页正文部分上:${window.screenTop}`)
      //   console.log(`网页正文部分左:${window.screenLeft}`)
      //   console.log(`屏幕分辨率的高:${window.screen.height}`)
      //   console.log(`屏幕分辨率的宽:${window.screen.width}`)
      //   console.log(`屏幕可用工作区高度:${window.screen.availHeight}`)
      //   console.log(`屏幕可用工作区宽度:${window.screen.availWidth}`)
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
