<!-- 组织机构首页 -->
<template>
  <a-card :bordered="false" class="card-area">
    <div class="table-page-search-wrapper">
      <div style="margin:10px"></div>
      <a-button type="primary" @click="add_unit">新增组织</a-button>
      <a-button @click="help">使用说明</a-button>
      <!-- <a-input-search style="margin-bottom: 8px" placeholder="查询" @change="onChange" /> -->
    </div>
    <div style="margin:10px"></div>
    <a-row :gutter="16">
      <a-col :span="8">
        <div v-if="this.view_data.name" class="selected-div">
          当前选择节点：
          <a-tag closable @close="disCheckTreeItem">{{ this.view_data.name }}</a-tag>
        </div>
        <a-tree
          :loadData="onLoadData"
          :treeData="tree_data"
          @expand="onExpand"
          @select="getView"
          :expandedKeys="expandedKeys"
          :autoExpandParent="autoExpandParent"
          :defaultSelectedKeys="['0']"
        >
          <template slot="title" slot-scope="{title}">
            <span v-if="title.indexOf(searchValue) > -1">
              {{title.substr(0, title.indexOf(searchValue))}}
              <span
                style="color: #f50"
              >{{searchValue}}</span>
              {{title.substr(title.indexOf(searchValue) + searchValue.length)}}
            </span>
            <span v-else>{{title}}</span>
          </template>
        </a-tree>
      </a-col>
      <a-col :span="16">
        <!-- 添加、编辑页面 -->
        <unitForm
          ref="unitForm"
          :is_show_edit="is_show_edit"
          :is_show_add="is_show_add"
          :view_data="view_data"
          :add_data="add_data"
          :tree_data="tree_data"
          @operate_tree_add="operate_tree_add"
          @operate_tree_edit="operate_tree_edit"
          @cancleUnitForm="cancleUnitForm"
          @del_unit="del_unit"
        ></unitForm>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
import unitForm from '@/views/unit/unit-form'

const getParentKey = (key, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]

    if (node.children) {
      if (node.children.some(item => item.title === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

export default {
  name: 'unit-index',
  //import引入的组件需要注入到对象中才能使用
  components: { unitForm },
  data() {
    return {
      // 树数据
      tree_data: [
        {
          title: '全部',
          key: '0',
          guid: '0',
          code: '0',
          level: '0',
          name: '全部',
          isLeaf: false
        }
      ],
      // 当前点击查看的树数据
      view_data: {},
      // 是否显示编辑
      is_show_edit: false,
      // 是否显示新增
      is_show_add: false,
      // 新增数据
      add_data: {},
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true
    }
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    onLoadData(treeNode) {
      return new Promise(resolve => {
        if (treeNode.dataRef.children) {
          resolve()
          return
        }
        this.getTreeData(treeNode.dataRef.key, treeNode, resolve)
      })
    },
    onChange(e) {
      const value = e.target.value
      const expandedKeys = this.tree_data
        .map(item => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(item.title, this.tree_data)
          }
          return null
        })
        .filter((item, i, self) => item && self.indexOf(item) === i)
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      })
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    // 使用说明
    help() {
      const h = this.$createElement
      this.$info({
        title: '使用说明',
        content: h('div', {}, [
          h('p', '新增：点击左侧树选择上级节点，并点击新增按钮进行新增，如果不选择上级，则默认新增一级；'),
          h('p', ' 修改：从树中点击选择要修改的节点，在右侧进行编辑；'),
          h('p', '删除：从树中点击选择要修改的节点，在右侧点击删除按钮；')
        ]),
        onOk() {}
      })
    },
    // 新增组织
    add_unit() {
      if (!this.view_data.guid) {
        this.$message.warning('请在左侧机构树中选择上级单位，如果您不选择上级单位则默认增加第一级')
        return
      }
      this.view_data.code = this.$refs.unitForm.leader + this.view_data.code
      // 显示组织机构编辑窗口
      this.is_show_edit = false
      this.is_show_add = true
      this.$refs.unitForm.form.resetFields() //清空form表单
    },
    // 取消树选择
    disCheckTreeItem() {
      this.view_data = {}
      //关闭添加和编辑表单
      this.is_show_edit = false
      this.is_show_add = false
    },
    // 获取树数据
    getTreeData(topGuid, treeNode, resolve) {
      var that = this
      that.$http
        .get('/sys/dept/sub/' + topGuid)
        .then(res => {
          if (res) {
            // 加载子级
            // 增加树节点需要的数据
            for (var i = 0; i < res.length; i++) {
              res[i].title = res[i].name
              res[i].key = res[i].guid
              //res[i].isLeaf = false;
              res[i].scopedSlots = { title: res[i].name }
            }
            treeNode.dataRef.children = res
            that.tree_data = [...that.tree_data]
            resolve()
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 展示树数据
    getView(selectedKeys, e) {
      this.$refs.unitForm.form.resetFields() //清空form表单
      // 展示编辑框
      this.is_show_edit = true
      // 关闭新增框
      this.is_show_add = false
      // 设置展示数据
      // this.view_data = e.node.dataRef
      let obj = e.node.dataRef
      this.view_data = {}
      Object.assign(this.view_data, e.node.dataRef)
      this.$refs.unitForm.leader = ''
      let code = obj.code
      let length = code.length
      let level = obj.level
      if (code != '0') {
        if (level != 1) {
          this.$refs.unitForm.leader = code.substring(0, length - 2)
          this.view_data.code = this.view_data.code.substring(length - 2, length)
        }
        this.$refs.unitForm.valueValidator.code.rules.splice(2, 1, {
          max: 2,
          message: '每级问题分类代码增长量不能大于2!'
        })
        this.$refs.unitForm.valueValidator.code.rules.splice(3, 1, {
          min: 2,
          message: '每级问题分类代码增长量不能小于2!'
        })
      }
      //将回调延迟到下次 DOM 更新循环之后执行
      this.$nextTick(() => {
        this.$refs.unitForm.form.setFieldsValue(this.view_data)
      })
    },
    // 查找指定节点，并从树中删除，直接操作树 不重复刷新树
    operate_tree_del(guid, data) {
      for (var i = 0; i < data.length; i++) {
        var item = data[i]
        if (item.guid == guid) {
          data.splice(i, 1)
        } else {
          // 冒泡子集进行删除操作
          if (item.children) {
            this.operate_tree_del(guid, item.children)
          }
        }
      }
      return data
    },
    // 查找指定节点，并从树中新增，直接操作树 不重复刷新树
    operate_tree_add(guid, data, children_data) {
      for (var i = 0; i < data.length; i++) {
        var item = data[i]
        if (item.guid == guid) {
          // 将子节点挂到树上
          if (item.children === undefined) {
            item.children = []
          }
          item.isLeaf = false
          item.children.push(children_data)
        } else {
          // 冒泡子集进行挂载操作
          if (item.children) {
            this.operate_tree_add(guid, item.children, children_data)
          }
        }
      }
    },
    // 编辑当前节点时更新树
    operate_tree_edit(edit, data) {
      for (var i = 0; i < data.length; i++) {
        var item = data[i]
        if (item.guid == edit.guid) {
          console.log('item', item)
          console.log('edit', edit)
          // 将子节点挂到树上
          Object.assign(item, edit) //将edit的属性复制到item
          console.log('item2', item)
        } else {
          // 冒泡子集进行挂载操作
          if (item.children) {
            this.operate_tree_edit(edit, item.children)
          }
        }
      }
    },
    cancleUnitForm(e, temp_data) {
      if (e === 'add') {
        this.is_show_add = false
      } else if (e === 'edit') {
        //this.is_show_edit = false;
      }
      this.add_data = {}
    },
    del_unit() {
      // 删除组织
      var that = this
      that.$confirm({
        title: '您确定要删除该组织吗?',
        content: '删除组织时，如果该组织下有下级单位将无法删除!',
        okText: '删除',
        okType: 'danger',
        cancelText: '否',
        onOk() {
          that.$http
            .delete('/sys/dept/' + that.view_data.guid)
            .then(res => {
              that.$message.success('组织删除成功!')
              var temp_data = that.operate_tree_del(that.view_data.guid, that.tree_data)
              that.tree_data = []
              that.tree_data = temp_data
              // 清楚当前选择
              that.view_data = {}
              that.is_show_edit = false // 显示组织机构编辑窗口
            })
            .catch(error => {
              // console.log("error",error);
              if (error.response.status === 600) {
                that.$message.error('该组织不存在或已被删除!')
              } else if (error.response.status === 607) {
                that.$message.warning('该组织存在下级,不允许删除!')
              } else {
                that.$message.error('组织删除失败!')
              }
            })
        }
      })
    },
    getTreeTopView() {
      const that = this
      // 展示编辑框
      that.is_show_edit = true
      // 设置展示数据
      that.view_data = that.tree_data[0]
      //将回调延迟到下次 DOM 更新循环之后执行
      // that.$nextTick(() => {
      //   that.form.setFieldsValue(that.tree_data[0]);
      // });
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.getTreeData(0)
    this.getTreeTopView()
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
</style>