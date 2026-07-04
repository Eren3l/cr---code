// pages/mine/mine.js
Page({
  data: {
    // 用户信息
    userInfo: {},
    hasUserInfo: false,
    // 训练统计
    totalWorkouts: 0,
    totalDays: 0,
    // 身体数据
    bodyDataList: [],
    // 设置
    waterGoal: 2000,
    calorieGoal: 2000,
    cupSize: 250
  },

  onLoad() {
    this.loadStats()
    this.loadBodyData()
    this.loadSettings()
  },

  onShow() {
    this.loadStats()
    this.loadBodyData()
    this.loadSettings()
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于展示个人头像和昵称',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  // 加载统计
  loadStats() {
    const workouts = wx.getStorageSync('workouts') || []
    const dates = new Set(workouts.map(w => w.date))
    this.setData({
      totalWorkouts: workouts.length,
      totalDays: dates.size
    })
  },

  // 加载身体数据
  loadBodyData() {
    const bodyData = wx.getStorageSync('body_data') || []
    this.setData({ bodyDataList: bodyData.slice(0, 5) })
  },

  // 加载设置
  loadSettings() {
    const waterGoal = wx.getStorageSync('waterGoal') || 2000
    const calorieGoal = wx.getStorageSync('calorieGoal') || 2000
    const cupSize = wx.getStorageSync('cupSize') || 250
    this.setData({ waterGoal, calorieGoal, cupSize })
  },

  // 导航
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    const routes = {
      templates: '/pages/template-manage/template-manage',
      bodydata: '/pages/body-data/body-data',
      goals: '/pages/goal-setting/goal-setting'
    }
    if (routes[url]) {
      wx.navigateTo({ url: routes[url] })
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  // 导出数据
  exportData() {
    const workouts = wx.getStorageSync('workouts') || []
    const diets = wx.getStorageSync('diets') || []
    const data = JSON.stringify({ workouts, diets }, null, 2)
    wx.setClipboardData({
      data,
      success: () => {
        wx.showToast({ title: '数据已复制到剪贴板', icon: 'success' })
      }
    })
  },

  // 清除数据
  clearData() {
    wx.showModal({
      title: '⚠️ 清除所有数据',
      content: '此操作不可恢复，确定要清除所有打卡记录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          this.loadStats()
          this.loadBodyData()
          wx.showToast({ title: '已清除', icon: 'success' })
        }
      }
    })
  }
})
