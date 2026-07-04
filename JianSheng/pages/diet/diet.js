// pages/diet/diet.js
Page({
  data: {
    date: '',
    mealTypes: [],
    // 各餐别食物列表
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    },
    // 饮水
    waterAmount: 0,
    waterGoal: 2000,
    cupSize: 250,
    cups: 8,
    // 弹窗
    showAddModal: false,
    currentMeal: '',
    foodForm: {
      foodName: '',
      calories: '',
      note: ''
    },
    // 热量合计
    totalCalories: 0,
    calorieGoal: 2000
  },

  onLoad() {
    const app = getApp()
    this.setData({
      mealTypes: app.globalData.mealTypes,
      date: this.formatDate(new Date())
    })
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  loadData() {
    const today = this.formatDate(new Date())
    // 加载饮食记录
    const diets = wx.getStorageSync('diets') || []
    const todayDiets = diets.filter(d => d.date === today)
    const meals = { breakfast: [], lunch: [], dinner: [], snack: [] }
    todayDiets.forEach(d => {
      if (meals[d.mealType]) meals[d.mealType].push(d)
    })
    // 加载饮水
    const waterRecords = wx.getStorageSync('water_records') || []
    const todayWater = waterRecords.filter(w => w.date === today)
    const waterAmount = todayWater.reduce((sum, w) => sum + w.amount, 0)
    // 计算热量
    const totalCalories = todayDiets.reduce((sum, d) => sum + (Number(d.calories) || 0), 0)

    this.setData({ meals, waterAmount, totalCalories })
  },

  // 打开添加食物弹窗
  openAddModal(e) {
    const meal = e.currentTarget.dataset.meal
    this.setData({
      showAddModal: true,
      currentMeal: meal,
      foodForm: { foodName: '', calories: '', note: '' }
    })
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showAddModal: false })
  },

  // 表单输入
  onFoodInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`foodForm.${field}`]: e.detail.value })
  },

  // 添加食物
  addFood() {
    if (!this.data.foodForm.foodName.trim()) {
      wx.showToast({ title: '请输入食物名称', icon: 'none' })
      return
    }
    const record = {
      id: Date.now(),
      date: this.data.date,
      mealType: this.data.currentMeal,
      foodName: this.data.foodForm.foodName.trim(),
      calories: Number(this.data.foodForm.calories) || 0,
      note: this.data.foodForm.note,
      createdAt: new Date().toISOString()
    }
    const diets = wx.getStorageSync('diets') || []
    diets.unshift(record)
    wx.setStorageSync('diets', diets)

    this.setData({ showAddModal: false })
    this.loadData()
    wx.showToast({ title: '已记录', icon: 'success' })
  },

  // 删除食物
  deleteFood(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除',
      content: '确定删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          let diets = wx.getStorageSync('diets') || []
          diets = diets.filter(d => d.id !== id)
          wx.setStorageSync('diets', diets)
          this.loadData()
        }
      }
    })
  },

  // 喝水 +1杯
  addWater() {
    const record = {
      id: Date.now(),
      date: this.data.date,
      amount: this.data.cupSize,
      createdAt: new Date().toISOString()
    }
    const waterRecords = wx.getStorageSync('water_records') || []
    waterRecords.unshift(record)
    wx.setStorageSync('water_records', waterRecords)

    const newAmount = this.data.waterAmount + this.data.cupSize
    this.setData({ waterAmount: newAmount })

    if (newAmount >= this.data.waterGoal) {
      wx.showToast({ title: '🎉 今日饮水达标！', icon: 'success' })
    } else {
      wx.showToast({ title: `+${this.data.cupSize}ml`, icon: 'none', duration: 800 })
    }
  },

  // 撤销喝水
  undrinkWater() {
    const waterRecords = wx.getStorageSync('water_records') || []
    const today = this.data.date
    const todayIdx = waterRecords.findIndex(w => w.date === today)
    if (todayIdx === -1) {
      wx.showToast({ title: '没有可撤销的饮水', icon: 'none' })
      return
    }
    waterRecords.splice(todayIdx, 1)
    wx.setStorageSync('water_records', waterRecords)
    this.loadData()
    wx.showToast({ title: `-${this.data.cupSize}ml`, icon: 'none', duration: 800 })
  },

  // 计算某餐合计热量
  mealCalories(mealType) {
    const foods = this.data.meals[mealType] || []
    return foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0)
  }
})
