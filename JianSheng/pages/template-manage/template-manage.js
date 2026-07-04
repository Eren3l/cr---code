// pages/template-manage/template-manage.js
Page({
  data: {
    templates: []
  },

  onLoad() {
    this.loadTemplates()
  },

  onShow() {
    this.loadTemplates()
  },

  loadTemplates() {
    const templates = wx.getStorageSync('templates') || []
    this.setData({ templates })
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
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  // 编辑模板 → 跳转编辑页
  editTemplate(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/template-edit/template-edit?id=${id}`
    })
  },

  // 新建模板 → 跳转编辑页
  newTemplate() {
    wx.navigateTo({
      url: '/pages/template-edit/template-edit'
    })
  }
})
