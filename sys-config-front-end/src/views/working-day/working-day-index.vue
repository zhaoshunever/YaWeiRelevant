<!-- 工作日管理 -->
<template>
  <div class>
    <a-card :bordered="false" class="card-area">
        <a-alert message="日历中工作日仅显示当月状态，上月结余和下月预览中的日期未显示工作日状态" type="info" showIcon />
        <div :style="{ display: 'inline-block', border: '1px solid #d9d9d9', borderRadius: '4px' }">
          <a-calendar v-if="had_data" @panelChange="panelChange" @change="dateChange">
            <a-switch  slot="dateCellRender" slot-scope="value" checkedChildren="开" unCheckedChildren="关" @change="change_status(value,this)"  :checked="check_status(value)" />
          </a-calendar>
        </div>
    </a-card>
  </div>
</template>

<script>
//这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
//例如：import 《组件名称》 from '《组件路径》';
export default {
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      // 是否有初始化数据
      had_data: false,
      // 所有日期
      date_data: [],
      // 当前月份数据
      month_data: []
    }
  },
  //监听属性 类似于data概念
  computed: {},
  //监控data中的数据变化
  watch: {},
  //方法集合
  methods: {
    check_status (value) {
      // 查找当天的信息
        for(var i = 0; i < this.month_data.length; i++) {
          var day = this.month_data[i]
          if(day.dateTimeKey == (value.format('YYYY-MM-DD') + ' 00:00:00') && day.isWokingDay) {
            return true;
          }
        }
        return false
    },
    panelChange (date,mode) {
      if(mode == 'year'){
        // 获取新的一年的数据
          this.get_date_data(date.year())
      }
       if(mode == 'month'){
        // 获取新的一月的数据
          this.get_month_data(date.month())
      }
    },
    dateChange(value) {
      var had_date = false;
       // 查找当天的信息
        for(var i = 0; i < this.month_data.length; i++) {
          var day = this.month_data[i]
          if(day.dateTimeKey == (value.format('YYYY-MM-DD') + ' 00:00:00') && day.isWokingDay) {
            had_date = true;
          }
        }
      if(!had_date){
        this.get_month_data(value.month())
      }
    },
    // 更改工作日状态
    change_status (value,obj) {
      var that = this
      // 查找当前日期的主键
      var guid = ''
      for(var i = 0; i < this.month_data.length; i++) {
          var day = this.month_data[i]
          if(day.dateTimeKey == (value.format('YYYY-MM-DD') + ' 00:00:00')) {
            guid = day.guid
          }
        }
      if(guid == ''){
         that.$message.warning('无法更改日期,您操作的日期不是当前月，已为您切换到目标月份')
        return
      }
      this.$http.put('/sys/working-days/' + guid)
      .then(res => {
        for(var i = 0; i < this.date_data.length; i++) {
          var day = this.date_data[i]
          if(day.guid == res.guid) {
             this.date_data[i].isWokingDay = res.isWokingDay
          }
        }
        that.$message.success('变更成功')
      }).catch(error => {
        that.$message.error('变更工作日状态失败')
      })
    },
    // 更新工作日信息
    update_working_day (value) {
    // 查找对应年份的数据
      for(var i = 0; i< this.date_data.length; i++) {
          var item = this.date_data[i];
          if(item.year == value.year()){
            // 查找当天的信息
             for(var j = 0; j < item.days.length; i++) {
               var day = item.days[j].dateTimeKey
               if(day.dateTimeKey == (value.format('YYYY-MM-DD' + '00:00:00'))) {
                 return true;
               }
             }
          }
        }
    },
    // 获取年份内的工作日信息
    get_date_data(year) {
      // 清空当前
      this.date_data = []
      var that = this
      that.$http.get('/sys/working-days/year/' + year)
      .then(res => {
        that.date_data = res
         // 获取当月数据，用于展示工作日
        var now = new Date()
        that.get_month_data(now.getMonth())
        this.had_data = true
      }).catch(error => {
        that.$message.error('获取'+ year + '年内的工作日信息失败')
      })
    },
    // 获取切换到的月份的数据,这个方法是为了展示页面的开关的，为了避免每个开关便利365次
    get_month_data(now_month) {
      // 因为日历显示上月数据，所以此处+1
      now_month = now_month + 1
      
      this.month_data = []
      // 加载当月数据
      for(var i = 0; i < this.date_data.length;i++){
            var month = this.date_data[i].month
            if(month == now_month) {
              this.month_data.push(this.date_data[i])
            }
          }
          // 加载上月数据，为了日历中展示的上月数据
          if(now_month > 1){
            var pre_month = now_month -1 
             for(var i = 0; i < this.date_data.length;i++){
                var month = this.date_data[i].month
                if(month == pre_month) {
                  this.month_data.push(this.date_data[i])
                }
             }
          }
         
          // 加载下月数据，为日历中展示的下月数据
          if(now_month < 12){
            var aft_month = now_month + 1 
             for(var i = 0; i < this.date_data.length;i++){
                var month = this.date_data[i].month
                if(month == aft_month) {
                  this.month_data.push(this.date_data[i])
                }
             }
          }
    }
  },
  
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    var now = new Date()
    // 初始化本年的数据
    this.get_date_data(now.getFullYear())
  },
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
</style>
<style lang='scss'>
.ant-fullcalendar-value{
  font-size: 28px;
  font-weight: 600;
}
</style>
