import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Province, Location, UserData, TravelRecord, MountType } from '@/types'
import { getProvinceById } from '@/data/provinces'
import { getRandomLocation } from '@/data/locations'

// 计算真实距离（使用高德地图API）
async function calculateRealDistance(from: [number, number], to: [number, number]): Promise<number> {
  // 这里应该调用高德地图的路径规划API
  // 暂时使用简化计算
  const R = 6371 // 地球半径（公里）
  const dLat = (to[1] - from[1]) * Math.PI / 180
  const dLng = (to[0] - from[0]) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from[1] * Math.PI / 180) * Math.cos(to[1] * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// 计算旅行时间（小时）
function calculateTravelTime(distance: number, speed: number): number {
  return Math.round((distance / speed) * 10) / 10
}

export const useUserStore = defineStore('user', () => {
  // 用户选择的省份
  const selectedProvince = ref<Province | null>(null)
  
  // 用户数据
  const userData = ref<UserData>({
    totalDistance: 0,
    visitedLocations: [],
    visitedCountries: new Set(),
    travelRecords: []
  })

  // 当前旅行状态
  const isTraveling = ref(false)
  const currentLocation = ref<Location | null>(null)
  const destination = ref<Location | null>(null)
  const travelProgress = ref(0) // 0-100
  const travelStartTime = ref<number | null>(null)
  const travelDistance = ref(0)
  const travelTime = ref(0) // 小时

  // 计算属性
  const visitedCount = computed(() => userData.value.visitedLocations.length)
  
  const visitedCountries = computed(() => Array.from(userData.value.visitedCountries))
  
  const currentSpeed = computed(() => {
    if (!selectedProvince.value) return 0
    return selectedProvince.value.speed
  })

  const currentTransport = computed(() => {
    if (!selectedProvince.value) return null
    return selectedProvince.value.mount
  })

  // 选择省份并自动开始漫游
  async function selectProvince(provinceId: number) {
    const province = getProvinceById(provinceId)
    if (!province) return false

    selectedProvince.value = province
    
    // 设置当前位置为省会
    currentLocation.value = {
      id: Date.now(),
      name: province.name,
      country: '中国',
      coordinates: province.coordinates,
      category: 'city' as const,
      description: `${province.name}省会`
    }

    // 立即开始第一次漫游
    await startNewTravel()
    
    // 保存到本地存储
    saveToLocalStorage()
    
    return true
  }

  // 开始新的旅行
  async function startNewTravel() {
    if (!selectedProvince.value || !currentLocation.value) return false

    isTraveling.value = true
    travelProgress.value = 0
    travelStartTime.value = Date.now()

    // 选择随机目的地
    const newDestination = getRandomLocation()
    destination.value = newDestination

    // 计算真实距离
    const distance = await calculateRealDistance(
      currentLocation.value.coordinates,
      newDestination.coordinates
    )
    travelDistance.value = distance

    // 计算旅行时间（基于省份交通方式的速度）
    const time = calculateTravelTime(distance, selectedProvince.value.speed)
    travelTime.value = time

    // 开始旅行进度模拟
    startTravelProgress(time)

    // 创建旅行记录
    const record: TravelRecord = {
      id: Date.now(),
      from: currentLocation.value,
      to: newDestination,
      distance,
      startTime: travelStartTime.value,
      estimatedTime: time,
      transport: selectedProvince.value.mount,
      speed: selectedProvince.value.speed
    }

    userData.value.travelRecords.push(record)
    
    return true
  }

  // 模拟旅行进度
  function startTravelProgress(totalHours: number) {
    const interval = 1000 // 每秒更新一次
    const totalSteps = totalHours * 3600 // 总秒数
    let currentStep = 0

    const timer = setInterval(() => {
      if (!isTraveling.value) {
        clearInterval(timer)
        return
      }

      currentStep++
      travelProgress.value = Math.min((currentStep / totalSteps) * 100, 100)

      // 到达目的地
      if (currentStep >= totalSteps) {
        clearInterval(timer)
        completeTravel()
      }
    }, interval)
  }

  // 完成旅行
  function completeTravel() {
    if (!currentLocation.value || !destination.value) return

    // 更新用户数据
    userData.value.totalDistance += travelDistance.value
    userData.value.visitedLocations.push(destination.value)
    userData.value.visitedCountries.add(destination.value.country)

    // 更新当前位置
    currentLocation.value = destination.value

    // 重置旅行状态
    isTraveling.value = false
    destination.value = null
    travelProgress.value = 0
    travelStartTime.value = null

    // 自动开始下一次旅行
    setTimeout(() => {
      startNewTravel()
    }, 3000) // 3秒后开始下一次旅行

    // 保存到本地存储
    saveToLocalStorage()
  }

  // 手动结束当前旅行（立即到达）
  function skipToDestination() {
    if (!isTraveling.value) return
    completeTravel()
  }

  // 获取最近的旅行记录
  function getRecentTravels(limit: number = 5): TravelRecord[] {
    return [...userData.value.travelRecords]
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit)
  }

  // 获取旅行统计
  function getTravelStats() {
    return {
      totalDistance: userData.value.totalDistance,
      visitedLocations: userData.value.visitedLocations.length,
      visitedCountries: userData.value.visitedCountries.size,
      totalTravels: userData.value.travelRecords.length,
      averageDistance: userData.value.travelRecords.length > 0 
        ? Math.round(userData.value.totalDistance / userData.value.travelRecords.length)
        : 0
    }
  }

  // 本地存储
  function saveToLocalStorage() {
    const data = {
      selectedProvinceId: selectedProvince.value?.id,
      userData: {
        ...userData.value,
        visitedCountries: Array.from(userData.value.visitedCountries)
      }
    }
    localStorage.setItem('gotravel_user', JSON.stringify(data))
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem('gotravel_user')
    if (!data) return

    try {
      const parsed = JSON.parse(data)
      
      if (parsed.selectedProvinceId) {
        const province = getProvinceById(parsed.selectedProvinceId)
        if (province) {
          selectedProvince.value = province
          
          // 恢复当前位置
          if (parsed.userData.visitedLocations.length > 0) {
            currentLocation.value = parsed.userData.visitedLocations[parsed.userData.visitedLocations.length - 1]
          } else {
            currentLocation.value = {
              id: Date.now(),
              name: province.name,
              country: '中国',
              coordinates: province.coordinates,
              category: 'city' as const,
              description: `${province.name}省会`
            }
          }
        }
      }

      userData.value = parsed.userData
      userData.value.visitedCountries = new Set(parsed.userData.visitedCountries || [])
      
      // 如果用户已选择省份但不在旅行中，自动开始新旅行
      if (selectedProvince.value && !isTraveling.value) {
        startNewTravel()
      }
    } catch (error) {
      console.error('加载本地存储失败:', error)
    }
  }

  // 重置用户数据
  function resetUserData() {
    selectedProvince.value = null
    userData.value = {
      totalDistance: 0,
      visitedLocations: [],
      visitedCountries: new Set(),
      travelRecords: []
    }
    currentLocation.value = null
    destination.value = null
    isTraveling.value = false
    travelProgress.value = 0
    
    localStorage.removeItem('gotravel_user')
  }

  // 初始化时加载本地存储
  loadFromLocalStorage()

  return {
    // 状态
    selectedProvince,
    userData,
    isTraveling,
    currentLocation,
    destination,
    travelProgress,
    travelDistance,
    travelTime,
    
    // 计算属性
    visitedCount,
    visitedCountries,
    currentSpeed,
    currentTransport,
    
    // 方法
    selectProvince,
    startNewTravel,
    skipToDestination,
    getRecentTravels,
    getTravelStats,
    resetUserData,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})