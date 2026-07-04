// pages/goal-setting/goal-setting.js
Page({
  data: {
    goals: [],
    showForm: false,
    editGoal: null,
    form: {
      type: 'weekly_workouts',
      target: '',
      typeLabel: '每周训练次数'
    }
  },

  onLoad() {
    this.loadGoals()
  },

  onShow() {
    this.loadGoals()
  },

  loadGoals() {
    const goals = wx.getStorageSync('goals') || []
    this.setData({ goals })
  },

  // 打开新增/编辑表单
  openForm(e) {
    const id = e ? e.currentTarget.dataset.id : null
    if (id) {
      const goal = this.data.goals.find(g => g.id === id)
      this.setData({
        showForm: true,
        editGoal: goal,
        form: {
          type: goal.type,
          target: String(goal.target),
          typeLabel: this.getTypeLabel(goal.type)
        }
      })
    } else {
      this.setData({
        showForm: true,
        editGoal: null,
        form: { type: 'weekly_workouts', target: '', typeLabel: '每周训练次数' }
      })
    }
  },

  closeForm() {
    this.setData({ showForm: false, editGoal: null })
  },

  getTypeLabel(type) {
    const map = {
      weekly_workouts: '每周训练次数',
      daily_water: '每日饮水 (ml)',
      daily_calories: '每日热量 (kcal)'
    }
    return map[type] || type
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      'form.type': type,
      'form.typeLabel': this.getTypeLabel(type)
    })
  },

  onTargetInput(e) {
    this.setData({ 'form.target': e.detail.value })
  },

  saveGoal() {
    if (!this.data.form.target || Number(this.data.form.target) <= 0) {
      wx.showToast({ title: '请输入有效的目标值', icon: 'none' })
      return
    }

    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    if (this.data.editGoal) {
      // 编辑
      let goals = wx.getStorageSync('goals') || []
      const idx = goals.findIndex(g => g.id === this.data.editGoal.id)
      if (idx >= 0) {
        goals[idx] = {
          ...goals[idx],
          type: this.data.form.type,
          target: Number(this.data.form.target),
          updatedAt: new Date().toISOString()
        }
        wx.setStorageSync('goals', goals)
      }
    } else {
      // 新增
      const goal = {
        id: Date.now(),
        type: this.data.form.type,
        target: Number(this.data.form.target),
        startDate: dateStr,
        endDate: '',
        isActive: true,
        createdAt: new Date().toISOString()
      }
      const goals = wx.getStorageSync('goals') || []
      goals.push(goal)
      wx.setStorageSync('goals', goals)
    }

    this.setData({ showForm: false, editGoal: null })
    this.loadGoals()
    wx.showToast({ title: '目标已保存', icon: 'success' })
  },

  deleteGoal(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除目标',
      content: '确定要删除这个目标吗？',
      success: (res) => {
        if (res.confirm) {
          let goals = wx.getStorageSync('goals') || []
          goals = goals.filter(g => g.id !== id)
          wx.setStorageSync('goals', goals)
          this.loadGoals()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  }
})
