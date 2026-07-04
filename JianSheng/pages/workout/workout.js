// pages/workout/workout.js
Page({
  data: {
    date: '',
    // 运动类型
    workoutTypes: [],
    selectedType: '',
    customType: '',
    showCustomInput: false,
    // 训练部位
    bodyParts: [],
    selectedBodyPart: '',
    // 打卡表单
    form: {
      sets: '',
      reps: '',
      weight: '',
      duration: '',
      distance: '',
      pace: '',
      heartRate: '',
      feeling: '',
      note: ''
    },
    // 照片
    photos: [],
    // 模板
    templates: [],
    // 今日记录
    todayRecords: []
  },

  onLoad() {
    const app = getApp()
    this.setData({
      workoutTypes: app.globalData.workoutTypes,
      bodyParts: app.globalData.bodyParts,
      date: this.formatDate(new Date())
    })
    this.loadTemplates()
    this.loadTodayRecords()
  },

  onShow() {
    this.loadTemplates()
    this.loadTodayRecords()
  },

  // 格式化日期
  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  // 选择运动类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    if (type === '自定义') {
      this.setData({ showCustomInput: true, selectedType: '' })
    } else {
      this.setData({ selectedType: type, showCustomInput: false })
    }
  },

  // 输入自定义类型
  onCustomTypeInput(e) {
    this.setData({ customType: e.detail.value })
  },

  // 确认自定义类型
  confirmCustomType() {
    if (this.data.customType.trim()) {
      this.setData({
        selectedType: this.data.customType.trim(),
        showCustomInput: false
      })
    }
  },

  // 选择训练部位
  selectBodyPart(e) {
    this.setData({ selectedBodyPart: e.currentTarget.dataset.part })
  },

  // 选择动作感受
  selectFeeling(e) {
    const feeling = e.currentTarget.dataset.feeling
    this.setData({ 'form.feeling': feeling })
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  // 选择照片
  choosePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const photos = this.data.photos.concat(res.tempFiles[0].tempFilePath)
        this.setData({ photos: photos.slice(0, 3) })
      }
    })
  },

  // 删除照片
  deletePhoto(e) {
    const index = e.currentTarget.dataset.index
    const photos = this.data.photos.slice()
    photos.splice(index, 1)
    this.setData({ photos })
  },

  // 重置表单
  resetForm() {
    this.setData({
      selectedType: '',
      customType: '',
      showCustomInput: false,
      selectedBodyPart: '',
      photos: [],
      form: {
        sets: '', reps: '', weight: '', duration: '',
        distance: '', pace: '', heartRate: '', feeling: '', note: ''
      }
    })
  },

  // 加载模板
  loadTemplates() {
    const templates = wx.getStorageSync('templates') || []
    this.setData({ templates })
  },

  // 使用模板快速填充
  useTemplate(e) {
    const tpl = e.currentTarget.dataset.template
    this.setData({
      selectedType: tpl.type,
      selectedBodyPart: tpl.bodyPart || '',
      form: {
        sets: tpl.sets || '',
        reps: tpl.reps || '',
        weight: tpl.weight || '',
        duration: tpl.duration || '',
        distance: '',
        pace: '',
        heartRate: '',
        feeling: '',
        note: ''
      }
    })
    wx.showToast({ title: '已应用模板', icon: 'success' })
  },

  // 保存为模板
  saveAsTemplate() {
    if (!this.data.selectedType) {
      wx.showToast({ title: '请先选择运动类型', icon: 'none' })
      return
    }
    const templates = wx.getStorageSync('templates') || []
    const newTpl = {
      id: Date.now(),
      name: this.data.selectedType,
      type: this.data.selectedType,
      bodyPart: this.data.selectedBodyPart,
      sets: this.data.form.sets,
      reps: this.data.form.reps,
      weight: this.data.form.weight,
      duration: this.data.form.duration,
      createdAt: new Date().toISOString()
    }
    templates.unshift(newTpl)
    if (templates.length > 10) templates.pop()
    wx.setStorageSync('templates', templates)
    this.loadTemplates()
    wx.showToast({ title: '模板已保存', icon: 'success' })
  },

  // 删除模板
  deleteTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除模板',
      content: '确定要删除这个模板吗？',
      success: (res) => {
        if (res.confirm) {
          let templates = wx.getStorageSync('templates') || []
          templates = templates.filter(t => t.id !== id)
          wx.setStorageSync('templates', templates)
          this.loadTemplates()
        }
      }
    })
  },

  // 提交打卡
  submitWorkout() {
    if (!this.data.selectedType) {
      wx.showToast({ title: '请选择运动类型', icon: 'none' })
      return
    }
    const record = {
      id: Date.now(),
      date: this.data.date,
      type: this.data.selectedType,
      bodyPart: this.data.selectedBodyPart,
      ...this.data.form,
      photos: this.data.photos,
      createdAt: new Date().toISOString()
    }
    const records = wx.getStorageSync('workouts') || []
    records.unshift(record)
    wx.setStorageSync('workouts', records)

    wx.showToast({ title: '打卡成功！', icon: 'success' })
    this.resetForm()
    this.loadTodayRecords()
  },

  // 加载今日记录
  loadTodayRecords() {
    const records = wx.getStorageSync('workouts') || []
    const today = this.formatDate(new Date())
    const todayRecords = records.filter(r => r.date === today)
    this.setData({ todayRecords })
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条打卡记录吗？',
      success: (res) => {
        if (res.confirm) {
          let records = wx.getStorageSync('workouts') || []
          records = records.filter(r => r.id !== id)
          wx.setStorageSync('workouts', records)
          this.loadTodayRecords()
        }
      }
    })
  }
})
