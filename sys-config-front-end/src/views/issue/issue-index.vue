<!-- 问题分类首页 -->
<template>
  <a-card :bordered="false" class="card-area">
    <div class="table-page-search-wrapper">
      <a-button type="primary" @click="add_issue">新增问题分类</a-button>
      <a-button @click="help">使用说明</a-button>
      <!-- <a-input-search style="margin-bottom: 8px" placeholder="查询" @change="onChange" /> -->
    </div>
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
        <div v-if="is_show_edit" class="eidt-page">
          <a-form :form="form">
            <a-form-item label="问题分类层级">
              <a-input v-model="view_data.level" disabled v-if="view_data.code!=='0'"></a-input>
              <a-input v-model="view_data.level" disabled v-else-if="view_data.code==='0'"></a-input>
            </a-form-item>
            <a-form-item label="问题分类名称">
              <a-input
                v-decorator="['name',valueValidator.name]"
                v-if="view_data.code!=='0'"
                autocomplete="off"
              />
              <a-input v-model="view_data.name" v-else-if="view_data.code==='0'" disabled></a-input>
            </a-form-item>
            <a-form-item label="问题分类代码">
              <!-- <a-input
                v-decorator="['code', valueValidator.code]"
                v-if="view_data.code!=='0'"
                autocomplete="off"
              />-->
              <div class="input-div" v-if="view_data.code!=='0'&&leader!=''">{{leader}}</div>
              <a-input
                v-if="view_data.code!=='0'"
                v-decorator="['code', valueValidator.code]"
                autocomplete="off"
                style="width:85%"
              />
              <a-input v-model="view_data.code" v-if="view_data.code==='0'" disabled />
            </a-form-item>
            <a-form-item class="button-div-right" v-if="view_data.code!=='0'">
              <a-button type="primary" @click="edit_data" :loading="saveLoading">修改</a-button>
              <a-button type="danger" ghost @click="del_issue" :loading="saveLoading">删除</a-button>
            </a-form-item>
          </a-form>
        </div>
        <div v-if="is_show_add" class="eidt-page">
          <a-form :form="form">
            <a-form-item label="上级问题分类">
              <a-input v-model="view_data.name" disabled></a-input>
            </a-form-item>
            <a-form-item label="问题分类名称">
              <a-input v-decorator="['name',valueValidator.name]" autocomplete="off" />
            </a-form-item>
            <a-form-item label="问题分类代码">
              <!-- <a-col :span="2">
                <a-input v-model="leader" readonly />
              </a-col>
              <a-col :span="22">
                <a-input v-decorator="['code', valueValidator.code]" autocomplete="off" />
              </a-col>-->
              <div class="input-div" v-if="leader!=''">{{leader}}</div>
              <a-input
                v-decorator="['code', valueValidator.code]"
                autocomplete="off"
                style="width:85%"
              />
            </a-form-item>
            <a-form-item class="button-div-right">
              <a-button type="primary" @click="save_sub_issue" :loading="saveLoading">保存</a-button>
              <a-button type="danger" @click="[is_show_add = false]" ghost :loading="saveLoading">关闭</a-button>
            </a-form-item>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
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
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';

export default {
  name: 'issue-index',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    return {
      // 树数据
      tree_data: [
        {
          key: '0',
          title: '全部',
          level: '0',
          guid: '0',
          code: '0',
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
      autoExpandParent: true,
      saveLoading: false, //保存按钮是否刷新
      form: this.$form.createForm(this),
      valueValidator: {
        //表单验证
        name: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '问题分类名称不能为空!' },
            { max: 50, message: '问题分类名称长度不能大于20!' },
            { validator: this.checkValues }
          ]
        },
        code: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [{ required: true, message: '问题分类代码不能为空!' }, { validator: this.checkValues }, {}, {}]
        }
      },
      leader: ''
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
    // 显示新增问题分类
    add_issue() {
      if (!this.view_data.guid || this.view_data.guid === undefined) {
        this.$message.warning('请在左侧问题分类树中选择上级问题分类，如果您不选择上级单位则默认增加第一级')
        return false
      }
      this.leader = ''
      let length = this.view_data.code.length
      if (this.view_data.code === '0') {
        this.valueValidator.code.rules.splice(2, 1, { max: 2, message: '一级问题分类代码长度不能大于2!' })
        this.valueValidator.code.rules.splice(3, 1, { min: 2, message: '一级问题分类代码长度不能小于2!' })
      } else {
        this.leader = this.view_data.code
        this.valueValidator.code.rules.splice(2, 1, { max: 2, message: '每级问题分类代码增长量不能大于2!' })
        this.valueValidator.code.rules.splice(3, 1, { min: 2, message: '每级问题分类代码增长量不能小于2!' })
      }
      // 显示问题分类编辑窗口
      this.is_show_edit = false
      this.is_show_add = true
      this.form.resetFields() //清空form表单
    },
    // 修改当前问题分类
    edit_data() {
      var that = this
      that.form.validateFields((err, values) => {
        if (err) {
          that.saveLoading = false
          return
        }
        values.guid = that.view_data.guid
        values.updatedTime = that.view_data.updatedTime
        values.code = that.leader + values.code
        // Object.assign(that.view_data, values) //将values的属性复制到that.view_data
        // console.log('values', values)
        // return false
        that.$message.loading('问题分类修改中,请稍等...')
        that.$http
          .put('/sys/issue-category/', values)
          .then(res => {
            that.$message.success('问题分类修改成功!')
            that.add_data = {}
            //that.form.resetFields(); //清空form表单
            res.isLeaf = false
            res.key = res.guid
            res.title = res.name
            // 树控件不刷新，暂时屏蔽掉
            that.operate_tree_edit(res, that.tree_data)
          })
          .catch(error => {
            if (error.response.status === 600) {
              that.$message.error('该问题分类不存在或已被删除!')
            } else if (error.response.status === 601) {
              that.$message.warning('该问题分类代码已存在!')
            } else if (error.response.status === 606) {
              that.$message.warning('该问题分类已被修改，请刷新后重试!')
            } else {
              that.$message.error('问题分类修改失败!')
            }
          })
      })
    },
    // 新增下级问题分类
    save_sub_issue() {
      var that = this
      that.saveLoading = true
      const topGuid = that.view_data.guid
      that.form.validateFields((err, values) => {
        if (err) {
          that.saveLoading = false
          return
        }
        values.code = that.leader + values.code
        // console.log("values",values);
        that.$message.loading('问题分类保存中,请稍等...')
        that.$http
          .post('/sys/issue-category/sub/' + topGuid, values)
          .then(res => {
            that.$message.success('问题分类保存成功!')
            that.add_data = {}
            that.form.resetFields() //清空form表单
            res.isLeaf = false
            res.key = res.guid
            res.title = res.name
            // 树控件不刷新，暂时屏蔽掉
            that.operate_tree_add(topGuid, that.tree_data, res)
            that.saveLoading = false
            this.is_show_add = false
          })
          .catch(error => {
            that.saveLoading = false
            if (error.response.status === 600) {
              that.$message.error('该问题分类不存在或已被删除!')
            } else if (error.response.status === 601) {
              that.$message.warning('该问题分类代码已存在!')
            } else {
              that.$message.error('问题分类添加失败!')
            }
          })
      })
    },
    // 删除问题分类
    del_issue() {
      var that = this
      that.$confirm({
        title: '您确定要删除该问题分类吗?',
        content: '删除问题分类时，如果该问题分类下有下级将无法删除!',
        okText: '删除',
        okType: 'danger',
        cancelText: '否',
        onOk() {
          that.saveLoading = true
          that.$message.loading('问题分类删除中,请稍等...')
          that.$http
            .delete('/sys/issue-category/' + that.view_data.guid, that.add_data)
            .then(res => {
              that.$message.success('问题分类删除成功!')
              var temp_data = that.operate_tree_del(that.view_data.guid, that.tree_data)
              // tree 蛋疼问题，直接splice数组不会直接导致树刷新，这里重新赋值就好了
              that.tree_data = []
              that.tree_data = temp_data
              // 清楚当前选择
              that.view_data = {}
              //隐藏form窗口
              that.is_show_edit = false
              that.is_show_add = false
              that.saveLoading = false
            })
            .catch(error => {
              that.saveLoading = false
              if (error.response.status === 600) {
                that.$message.error('该问题分类不存在或已被删除!')
              } else if (error.response.status === 607) {
                that.$message.warning('该问题分类存在下级,不允许删除!')
              } else {
                that.$message.error('问题分类删除失败!')
              }
            })
        },
        onCancel() {}
      })

      // 显示问题分类编辑窗口
      this.is_show_edit = true
    },
    // 取消树选择
    disCheckTreeItem() {
      this.view_data = {}
      //关闭添加和编辑表单
      this.is_show_edit = false
      this.is_show_add = false
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
    // 获取树数据
    initTreeData() {
      var that = this
      that.$http
        .get('/sys/issue-category/first-level')
        .then(res => {
          if (res) {
            // 加载第一级节点
            // 增加树节点需要的数据
            for (var i = 0; i < res.length; i++) {
              res[i].title = res[i].name
              res[i].key = res[i].guid
              res[i].isLeaf = false
              res[i].scopedSlots = { title: res[i].name }
            }
            //that.tree_data = res
            that.tree_data[0].children = res
            that.tree_data = [...that.tree_data]
            resolve()
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    // 获取树数据
    getTreeData(topGuid, treeNode, resolve) {
      var that = this
      that.$http
        .get('/sys/issue-category/sub/' + topGuid)
        .then(res => {
          if (res) {
            // 判断是否是点击树节点进入
            // 加载子级
            // 增加树节点需要的数据
            for (var i = 0; i < res.length; i++) {
              res[i].title = res[i].name
              res[i].key = res[i].guid
              res[i].isLeaf = false
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
      // console.log("selectedKeys",selectedKeys);
      // console.log("e",e);
      const that = this
      that.form.resetFields() //清空form表单
      // 展示编辑框
      that.is_show_edit = true
      // 关闭新增框
      that.is_show_add = false
      // 设置展示数据
      let obj = e.node.dataRef
      that.view_data = {}
      Object.assign(that.view_data, e.node.dataRef)

      this.leader = ''
      let length = e.node.dataRef.code.length
      let level = e.node.dataRef.level
      if (that.view_data.code != '0') {
        that.valueValidator.code.initialValue = that.view_data.code
        if (level != 1) {
          that.leader = that.view_data.code.substring(0, length - 2)
          that.view_data.code = that.view_data.code.substring(length - 2, length)
        }
        that.valueValidator.code.rules.splice(2, 1, { max: 2, message: '每级问题分类代码增长量不能大于2!' })
        that.valueValidator.code.rules.splice(3, 1, { min: 2, message: '每级问题分类代码增长量不能小于2!' })
      }

      //将回调延迟到下次 DOM 更新循环之后执行
      that.$nextTick(() => {
        that.form.setFieldsValue(that.view_data)
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
          // 将子节点挂到树上
          //item.title = edit.name
          Object.assign(item, edit) //将edit的属性复制到item
        } else {
          // 冒泡子集进行挂载操作
          if (item.children) {
            this.operate_tree_edit(edit, item.children)
          }
        }
      }
    },
    checkValues(rule, value, callback) {
      let message = null
      let re = null
      if (rule.field === 'name') {
        if (!this.$RegExpValidate.excludeSpecialCharacter(value)) {
          message = '输入的值中存在特殊字符或空格!'
        }
      } else if (rule.field === 'code') {
        if (!this.$RegExpValidate.isNumber(value)) {
          message = '问题分类代码只能输入数字!'
        }
      }
      if (message === null) {
        callback()
      } else {
        callback(message)
      }
    },
    getTreeTopView() {
      const that = this
      // 展示编辑框
      that.is_show_edit = true
      // 设置展示数据
      that.view_data = that.tree_data[0]
      //将回调延迟到下次 DOM 更新循环之后执行
      that.$nextTick(() => {
        that.form.setFieldsValue(that.tree_data[0])
      })
    }
  },
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {
    this.initTreeData()
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
.number-input {
  width: 100%;
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