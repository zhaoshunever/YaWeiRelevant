import enquireJs from 'enquire.js'
// 匹配页面宽度，变更设备类型
const enquireScreen = function (call) {
  // tablet
  const handler = {
    match: function () {
      call && call(0)
    },
    unmatch: function () {
      call && call(-1)
    }
  }
  // mobile
  const handler2 = {
    match: () => {
      call && call(1)
    }
  }
  enquireJs.register('screen and (max-width: 1087.99px)', handler)
  enquireJs.register('screen and (max-width: 767.99px)', handler2)
}

export default enquireScreen