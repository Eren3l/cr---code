// pages/template-edit/template-edit.js
Page({
  data: {
    isEdit: false,
    editId: null,
    workoutTypes: [],
    bodyParts: [],
    form: {
      name: '',
      type: '',
      bodyPart: '',
      sets: '',
      reps: '',
      weight: '',
      duration: ''
    }
  },

  onLoad(options) {
    const app = getApp()
    this.setData({
      workoutTypes: app.globalData.workoutTypes,
      bodyParts: app.globalData.bodyParts
    })

    // 编辑模式
    if (options.id) {
      const templates = wx.getStorageSync('templates') || []
      const tpl = templates.find(t => t.id === Number(options.id))
      if (tpl) {
        this.setData({
          isEdit: true,
          editId: tpl.id,
          form: {
            name: tpl.name || '',
            type: tpl.type || '',
            bodyPart: tpl.bodyPart || '',
            sets: tpl.sets || '',
            reps: tpl.reps || '',
            weight: tpl.weight || '',
            duration: tpl.duration || ''
          }
        })
      }
    }
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  selectType(e) {
    this.setData({ 'form.type': e.currentTarget.dataset.type })
  },

  selectBodyPart(e) {
    this.setData({ 'form.bodyPart': e.currentTarget.dataset.part })
  },

  save() {
    if (!this.data.form.name.trim()) {
      wx.showToast({ title: '请输入模板名称', icon: 'none' })
      return
    }
    if (!this.data.form.type) {
      wx.showToast({ title: '请选择运动类型', icon: 'none' })
      return
    }

    const templates = wx.getStorageSync('templates') || []

    if (this.data.isEdit) {
      const idx = templates.findIndex(t => t.id === this.data.editId)
      if (idx >= 0) {
        templates[idx] = {
          ...templates[idx],
          name: this.data.form.name.trim(),
          type: this.data.form.type,
          bodyPart: this.data.form.bodyPart,
          sets: this.data.form.sets,
          reps: this.data.form.reps,
          weight: this.data.form.weight,
          duration: this.data.form.duration
        }
      }
    } else {
      templates.unshift({
        id: Date.now(),
        name: this.data.form.name.trim(),
        type: this.data.form.type,
        bodyPart: this.data.form.bodyPart,
        sets: this.data.form.sets,
        reps: this.data.form.reps,
        weight: this.data.form.weight,
        duration: this.data.form.duration,
        createdAt: new Date().toISOString()
      })
      if (templates.length > 20) templates.pop()
    }

    wx.setStorageSync('templates', templates)
    wx.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 1000)
  }
})
