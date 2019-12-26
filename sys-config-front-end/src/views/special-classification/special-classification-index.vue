<template>
  <a-card :bordered="false" class="card-area">
    <div class="table-page-search-wrapper">
      <a-button type="primary" @click="add_sc">新增专项分类</a-button>
      <a-button @click="help">使用说明</a-button>
      <!-- <a-input-search style="margin-bottom: 8px" placeholder="查询" @change="onChange" /> -->
    </div>
    <a-row :gutter="16">
      <a-col :span="8">
        <div v-if="this.view_data.text" class="selected-div">
          当前选择节点：
          <a-tag closable @close="disCheckTreeItem">{{ this.view_data.text }}</a-tag>
        </div>
        <a-tree
          :loadData="onLoadData"
          :treeData="tree_data"
          @expand="onExpand"
          @select="getView"
          :autoExpandParent="autoExpandParent"
          :defaultSelectedKeys="['1']"
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
            <a-form-item label="专项分类层级" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model="view_data.level" disabled></a-input>
            </a-form-item>
            <a-form-item label="专项分类名称" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-decorator="['text',valueValidator.text]" v-if="view_data.code!=='0'" />
              <a-input v-model="view_data.text" v-else-if="view_data.code==='0'" disabled></a-input>
            </a-form-item>
            <a-form-item label="专项分类代码" :label-col="labelCol" :wrapper-col="wrapperCol">
              <!-- <a-input v-decorator="['code',valueValidator.code]" v-if="view_data.code!=='0'" /> -->
              <div class="input-div" v-if="view_data.code!=='0'&&leader!=''">{{leader}}</div>
              <a-input
                v-if="view_data.code!=='0'"
                v-decorator="['code', valueValidator.code]"
                autocomplete="off"
                style="width:85%"
              />
              <a-input v-model="view_data.code" v-if="view_data.code==='0'" disabled></a-input>
            </a-form-item>
            <a-form-item class="button-div-right" v-if="view_data.code!=='0'">
              <a-button type="primary" @click="edit_data" :loading="saveLoading">修改</a-button>
              <a-button type="danger" ghost @click="del_sc" :loading="saveLoading">删除</a-button>
            </a-form-item>
          </a-form>
        </div>
        <div v-if="is_show_add" class="eidt-page">
          <a-form :form="form">
            <a-form-item label="上级专项分类" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-model="view_data.text" disabled></a-input>
            </a-form-item>
            <a-form-item label="专项分类名称" :label-col="labelCol" :wrapper-col="wrapperCol">
              <a-input v-decorator="['text',valueValidator.text]" autocomplete="off" />
            </a-form-item>
            <a-form-item label="专项分类代码" :label-col="labelCol" :wrapper-col="wrapperCol">
              <!-- <a-input v-decorator="['code', valueValidator.code]" autocomplete="off" /> -->
              <div class="input-div" v-if="leader!=''">{{leader}}</div>
              <a-input
                v-decorator="['code', valueValidator.code]"
                autocomplete="off"
                style="width:85%"
              />
            </a-form-item>
            <a-form-item class="button-div-right">
              <a-button type="primary" @click="save_sub_sc" :loading="saveLoading">保存</a-button>
              <a-button type="danger" @click="[is_show_add = false]" ghost :loading="saveLoading">关闭</a-button>
            </a-form-item>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
export default {
  name: 'special-classification-index',
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    return {
      tree_data: [
        {
          title: '全部',
          key: '1',
          guid: '1',
          code: '0',
          level: '0',
          text: '全部',
          isLeaf: false
        }
      ],
      autoExpandParent: true,
      //defaultExpandedKeys: ['0'],//默认展开某个节点
      //loadedKeys: ['0'],//已展开了哪些父节点
      view_data: {}, // 当前点击查看的树数据
      add_data: {}, // 新增数据
      is_show_edit: false, // 是否显示编辑
      is_show_add: false, // 是否显示新增
      labelCol: { span: 4, pull: 1 },
      wrapperCol: { span: 20, pull: 1 },
      saveLoading: false,
      form: this.$form.createForm(this),
      valueValidator: {
        //表单验证
        text: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '专项分类名称不能为空!' },
            { max: 50, message: '专项分类名称长度不能大于20!' },
            { validator: this.checkValues }
          ]
        },
        code: {
          validateFirst: true, //在第一个验证失败后，停止之后的所有验证
          rules: [
            { required: true, message: '专项分类代码不能为空!' },
            { validator: this.checkValues },
            { max: 20, message: '专项分类代码长度不能大于20!' },
            { min: 2, message: '专项分类代码长度不能大于2!' }
          ]
        }
      },
      leader: ''
    }
  },
  methods: {
    onLoadData(treeNode) {
      //展开父级菜单的所有子集
      return new Promise(resolve => {
        if (treeNode.dataRef.children) {
          resolve()
          return
        }
        this.getTreeData(treeNode.dataRef.key, treeNode, resolve)
      })
    },
    initTreeData() {
      //初始化一级节点
      var that = this
      that.$http
        .get('/sys/special-classification/first-level')
        .then(res => {
          if (res) {
            // 加载第一级节点
            // 增加树节点需要的数据
            for (var i = 0; i < res.length; i++) {
              res[i].title = res[i].text
              res[i].key = res[i].guid
              // res[i].isLeaf = res[i].isLeaf
              // res[i].isLeaf = false
              res[i].scopedSlots = { title: res[i].text }
            }
            // that.treeData = res
            this.tree_data[0].children = res
            that.tree_data = [...that.tree_data]
            resolve()
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    getTreeData(topGuid, treeNode, resolve) {
      //获取树的数据
      var that = this
      //that.loadedKeys[that.loadedKeys.length] = topGuid
      //alert(topGuid)
      if (topGuid !== 1) {
        that.$http
          .get('/sys/special-classification/sub/' + topGuid)
          .then(res => {
            if (res) {
              // 判断是否是点击树节点进入
              // 加载子级
              // 增加树节点需要的数据
              for (var i = 0; i < res.length; i++) {
                res[i].title = res[i].text
                res[i].key = res[i].guid
                // res[i].isLeaf = false
                res[i].scopedSlots = { title: res[i].text }
              }
              treeNode.dataRef.children = res
              that.tree_data = [...that.tree_data]
              resolve()
            }
          })
          .catch(error => {
            console.log(error)
          })
      }
    },
    getView(selectedKeys, e) {
      this.form.resetFields() //清空form表单
      // 展示编辑框
      this.is_show_edit = true
      // 关闭新增框
      this.is_show_add = false
      // 设置展示数据
      // this.view_data = e.node.dataRef
      let obj = e.node.dataRef
      this.view_data = {}
      Object.assign(this.view_data, e.node.dataRef)
      this.leader = ''
      let length = e.node.dataRef.code.length
      let level = e.node.dataRef.level
      if (this.view_data.code != '0') {
        // this.valueValidator.code.initialValue = this.view_data.code
        if (level != 1) {
          this.leader = this.view_data.code.substring(0, length - 2)
          this.view_data.code = this.view_data.code.substring(length - 2, length)
        }
        this.valueValidator.code.rules.splice(2, 1, { max: 2, message: '每级问题分类代码增长量不能大于2!' })
        this.valueValidator.code.rules.splice(3, 1, { min: 2, message: '每级问题分类代码增长量不能小于2!' })
      }
      //将回调延迟到下次 DOM 更新循环之后执行
      this.$nextTick(() => {
        this.form.setFieldsValue(this.view_data)
      })
    },
    add_sc() {
      // 新增专项分类
      if (!this.view_data.guid) {
        this.$message.warning('请在左侧机构树中选择上级分类!')
        return
      }
      this.leader = ''
      let length = this.view_data.code.length
      if (this.view_data.code === '0') {
        this.valueValidator.code.rules.splice(2, 1, { max: 2, message: '一级专项分类代码长度不能大于2!' })
        this.valueValidator.code.rules.splice(3, 1, { min: 2, message: '一级专项分类代码长度不能小于2!' })
      } else {
        this.leader = this.view_data.code
        this.valueValidator.code.rules.splice(2, 1, { max: 2, message: '每级专项分类代码增长量不能大于2!' })
        this.valueValidator.code.rules.splice(3, 1, { min: 2, message: '每级专项分类代码增长量不能小于2!' })
      }
      // 显示专项分类编辑窗口
      this.is_show_edit = false
      this.is_show_add = true
      this.form.resetFields() //清空form表单
    },
    // 修改当前专项分类
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
        // console.log(values)
        // return false
        that.$message.loading('专项分类更新中,请稍等...')
        that.$http
          .put('/sys/special-classification/', values)
          .then(res => {
            that.$message.success('专项分类保存成功!')
            that.add_data = {}
            // res.isLeaf = false
            res.key = res.guid
            res.title = res.text
            // 树控件不刷新，暂时屏蔽掉
            that.operate_tree_edit(res, that.tree_data)
            that.saveLoading = false
          })
          .catch(error => {
            that.saveLoading = false
            that.$message.error('专项分类保存失败!')
          })
      })
    },
    // 删除专项分类
    del_sc() {
      var that = this
      //console.log(that.view_data.guid)
      that.$confirm({
        title: '您确定要删除该专项分类吗',
        content: '删除专项分类时，如果该专项分类下有下级将无法删除',
        okText: '删除',
        okType: 'danger',
        cancelText: '否',
        onOk() {
          that.$http
            .delete('/sys/special-classification/' + that.view_data.guid)
            .then(res => {
              that.$message.success('删除成功')
              var temp_data = that.operate_tree_del(that.view_data.guid, that.tree_data)
              that.view_data = {}
              // tree 蛋疼问题，直接splice数组不会直接导致树刷新，这里重新赋值就好了
              that.tree_data = []
              that.tree_data = temp_data
              that.is_show_edit = false
            })
            .catch(error => {
              console.log(error)
              that.$message.error('删除失败')
            })
        },
        onCancel() {}
      })

      // 显示专项分类编辑窗口
      this.is_show_edit = true
    },
    save_sub_sc() {
      // 新增下级专项分类
      var that = this
      that.saveLoading = true
      that.form.validateFields((err, values) => {
        if (err) {
          that.saveLoading = false
          return
        }
        that.$message.loading('专项分类保存中,请稍等...')
        values.code = that.leader + values.code
        // console.log('values', values)
        // return
        that.$http
          .post('/sys/special-classification/sub/' + that.view_data.guid, values)
          .then(res => {
            that.$message.success('专项分类保存成功!')
            that.add_data = {}
            // res.isLeaf = false
            res.key = res.guid
            res.title = res.text
            // 树控件不刷新，暂时屏蔽掉
            that.operate_tree_add(that.view_data.guid, that.tree_data, res)
            that.form.resetFields() //清空form表单
            that.saveLoading = false
          })
          .catch(error => {
            console.log(error)
            that.saveLoading = false
            that.$message.error('专项分类保存失败!')
          })
      })
    },
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
    operate_tree_del(guid, data) {
      // 查找指定节点，并从树中删除，直接操作树 不重复刷新树
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
    help() {
      // 使用说明
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
    disCheckTreeItem() {
      // 取消树选择
      this.view_data = {}
      this.is_show_edit = false
      this.is_show_add = false
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
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
    operate_tree_edit(edit, data) {
      // 编辑当前节点时更新树
      for (var i = 0; i < data.length; i++) {
        var item = data[i]
        if (item.guid == edit.guid) {
          // 将子节点挂到树上
          // item.title = edit.text
          Object.assign(item, edit)
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
          message = '专项分类代码只能输入数字!'
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

<style>
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
