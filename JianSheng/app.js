// app.js - 简生健身打卡小程序入口
App({
  onLaunch() {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    this.globalData.systemInfo = systemInfo
    this.globalData.statusBarHeight = systemInfo.statusBarHeight

    console.log('简生启动成功', systemInfo.SDKVersion)
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 0,
    // 预设运动类型
    workoutTypes: [
      '力量', '有氧', '瑜伽', '跑步',
      '游泳', '跳绳', '球类', '居家自重'
    ],
    // 训练部位
    bodyParts: ['胸', '背', '腿', '肩', '手臂', '核心', '全身'],
    // 动作感受
    feelings: ['轻松', '适中', '吃力', '力竭'],
    // 餐别
    mealTypes: [
      { key: 'breakfast', label: '早餐', icon: '🌅' },
      { key: 'lunch', label: '午餐', icon: '🌞' },
      { key: 'dinner', label: '晚餐', icon: '🌙' },
      { key: 'snack', label: '零食', icon: '🍪' }
    ]
  }
})
