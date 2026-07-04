// pages/calendar/calendar.js
Page({
  data: {
    currentYear: 2026,
    currentMonth: 7,
    weekdays: ['一', '二', '三', '四', '五', '六', '日'],
    calendarGrid: [],
    // 统计
    stats: {
      workoutDays: 0,
      dietDays: 0,
      streak: 0,
      totalWorkouts: 0
    },
    // 目标
    goals: [],
    // 详情弹窗
    showDayModal: false,
    selectedDate: '',
    selectedDayRecords: [],
    // 补卡弹窗
    showMakeupModal: false,
    makeupDate: '',
    makeupReason: ''
  },

  onLoad() {
    const now = new Date()
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1
    })
    this.renderCalendar()
    this.calcStats()
    this.loadGoals()
  },

  onShow() {
    this.renderCalendar()
    this.calcStats()
    this.loadGoals()
  },

  // 格式化日期
  formatDate(y, m, d) {
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  },

  // 生成日历网格
  renderCalendar() {
    const { currentYear, currentMonth } = this.data
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
    const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay()
    // 转换为周一开始（JS周日=0）
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    // 获取当月打卡数据
    const workouts = wx.getStorageSync('workouts') || []
    const diets = wx.getStorageSync('diets') || []
    const prefix = this.formatDate(currentYear, currentMonth, 0).slice(0, 7)

    const checkedDates = new Set()
    workouts.forEach(w => { if (w.date) checkedDates.add(w.date) })
    diets.forEach(d => { if (d.date) checkedDates.add(d.date) })

    const today = this.formatDate(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    )

    // 构建网格（6行 x 7列）
    const grid = []
    let day = 1
    for (let row = 0; row < 6; row++) {
      const week = []
      for (let col = 0; col < 7; col++) {
        if (row === 0 && col < startOffset) {
          week.push({ day: '', empty: true })
        } else if (day > daysInMonth) {
          week.push({ day: '', empty: true })
        } else {
          const dateStr = `${prefix}-${String(day).padStart(2, '0')}`
          const checked = checkedDates.has(dateStr)
          const isToday = dateStr === today
          week.push({ day, date: dateStr, checked, isToday })
          day++
        }
      }
      grid.push(week)
    }
    this.setData({ calendarGrid: grid })
  },

  // 切换月份
  prevMonth() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 1) {
      this.setData({ currentYear: currentYear - 1, currentMonth: 12 })
    } else {
      this.setData({ currentMonth: currentMonth - 1 })
    }
    this.renderCalendar()
    this.calcStats()
  },

  nextMonth() {
    let { currentYear, currentMonth } = this.data
    if (currentMonth === 12) {
      this.setData({ currentYear: currentYear + 1, currentMonth: 1 })
    } else {
      this.setData({ currentMonth: currentMonth + 1 })
    }
    this.renderCalendar()
    this.calcStats()
  },

  // 点击日期
  tapDay(e) {
    const { date, day } = e.currentTarget.dataset
    if (!date) return

    const workouts = wx.getStorageSync('workouts') || []
    const diets = wx.getStorageSync('diets') || []
    const dayRecords = [
      ...workouts.filter(w => w.date === date).map(w => ({ ...w, _type: 'workout' })),
      ...diets.filter(d => d.date === date).map(d => ({ ...d, _type: 'diet' }))
    ]
    this.setData({
      showDayModal: true,
      selectedDate: date,
      selectedDayRecords: dayRecords
    })
  },

  closeDayModal() {
    this.setData({ showDayModal: false })
  },

  // 计算连续打卡天数
  calcStreak(checkedDates) {
    const today = new Date()
    let streak = 0
    const d = new Date(today)
    while (true) {
      const dateStr = this.formatDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
      if (checkedDates.has(dateStr)) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        // 如果今天还没打卡，从昨天开始算
        if (streak === 0 && dateStr === this.formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())) {
          d.setDate(d.getDate() - 1)
          continue
        }
        break
      }
    }
    return streak
  },

  // 计算月度统计
  calcStats() {
    const { currentYear, currentMonth } = this.data
    const workouts = wx.getStorageSync('workouts') || []
    const diets = wx.getStorageSync('diets') || []
    const prefix = this.formatDate(currentYear, currentMonth, 0).slice(0, 7)

    const workoutDates = new Set(workouts.filter(w => w.date && w.date.startsWith(prefix)).map(w => w.date))
    const dietDates = new Set(diets.filter(d => d.date && d.date.startsWith(prefix)).map(d => d.date))
    const totalWorkouts = workouts.filter(w => w.date && w.date.startsWith(prefix)).length

    // 合并所有打卡日期
    const allChecked = new Set()
    workouts.forEach(w => { if (w.date) allChecked.add(w.date) })
    diets.forEach(d => { if (d.date) allChecked.add(d.date) })
    const streak = this.calcStreak(allChecked)

    this.setData({
      stats: {
        workoutDays: workoutDates.size,
        dietDays: dietDates.size,
        streak,
        totalWorkouts
      }
    })
  },

  // 加载目标
  loadGoals() {
    const goals = wx.getStorageSync('goals') || []
    this.setData({ goals })
  },

  // 补卡
  openMakeup() {
    this.setData({ showMakeupModal: true, makeupDate: '', makeupReason: '' })
  },

  closeMakeup() {
    this.setData({ showMakeupModal: false })
  },

  onMakeupDateChange(e) {
    this.setData({ makeupDate: e.detail.value })
  },

  onMakeupReasonInput(e) {
    this.setData({ makeupReason: e.detail.value })
  },

  submitMakeup() {
    if (!this.data.makeupDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    // 创建一个简化的运动记录作为补卡
    const record = {
      id: Date.now(),
      date: this.data.makeupDate,
      type: '补卡',
      isMakeup: true,
      note: this.data.makeupReason || '补卡',
      createdAt: new Date().toISOString()
    }
    const workouts = wx.getStorageSync('workouts') || []
    workouts.unshift(record)
    wx.setStorageSync('workouts', workouts)
    this.setData({ showMakeupModal: false })
    this.renderCalendar()
    this.calcStats()
    wx.showToast({ title: '补卡成功！', icon: 'success' })
  }
})
