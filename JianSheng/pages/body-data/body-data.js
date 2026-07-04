// pages/body-data/body-data.js
Page({
  data: {
    date: '',
    form: {
      weight: '',
      bodyFat: '',
      waist: '',
      hip: '',
      chest: '',
      arm: '',
      calf: ''
    },
    records: []
  },

  onLoad() {
    this.setData({
      date: this.formatDate(new Date())
    })
    this.loadRecords()
  },

  onShow() {
    this.loadRecords()
  },

  formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  },

  loadRecords() {
    const records = wx.getStorageSync('body_data') || []
    this.setData({ records: records.slice(0, 20) })
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  saveData() {
    const form = this.data.form
    const hasData = Object.values(form).some(v => v !== '')
    if (!hasData) {
      wx.showToast({ title: '请至少填写一项', icon: 'none' })
      return
    }

    const record = {
      id: Date.now(),
      date: this.data.date,
      ...form,
      createdAt: new Date().toISOString()
    }
    const records = wx.getStorageSync('body_data') || []
    // 同一天已有记录则替换
    const existIdx = records.findIndex(r => r.date === this.data.date)
    if (existIdx >= 0) {
      records[existIdx] = record
    } else {
      records.unshift(record)
    }
    wx.setStorageSync('body_data', records)

    wx.showToast({ title: '保存成功', icon: 'success' })
    this.setData({
      form: { weight: '', bodyFat: '', waist: '', hip: '', chest: '', arm: '', calf: '' }
    })
    this.loadRecords()
  },

  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          let records = wx.getStorageSync('body_data') || []
          records = records.filter(r => r.id !== id)
          wx.setStorageSync('body_data', records)
          this.loadRecords()
        }
      }
    })
  }
})
