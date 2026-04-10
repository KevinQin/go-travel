import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Province, Location, UserData, TravelRecord, TravelStatus } from '@/types'
import { getProvinceById } from '@/data/provinces'
import { getRandomLocation } from '@/data/locations'
import { TravelSimulator, calculateTravelTime } from '@/utils/travelSimulator'
import { calculateDistance } from '@/utils/map'

// 根据坐骑名称获取坐骑类型
function getMountType(mount: string): 'animal' | 'vehicle' | 'other' {
  const animalMounts = ['熊猫', '醒狮', '骏马', '骆驼', '大象']
  const vehicleMounts = ['高铁', '磁悬浮', '数字高铁']
  
  if (animalMounts.includes(mount)) {
    return 'animal'
  } else if (vehicleMounts.includes(mount)) {
    return 'vehicle'
  } else {
    return 'other'
  }
}

// 根据坐骑类型获取行进模式
function getTransportMode(mount: string): 'walking' | 'riding' | 'flying' | 'driving' {
  const animalMounts = ['熊猫', '骆驼', '大象']
  const ridingMounts = ['骏马', '醒狮']
  const vehicleMounts = ['高铁', '磁悬浮', '数字高铁']
  
  if (animalMounts.includes(mount)) {
    return 'walking'
  } else if (ridingMounts.includes(mount)) {
    return 'riding'
  } else if (vehicleMounts.includes(mount)) {
    return 'driving'
  }
  
  return 'driving' // 默认
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

  // 旅行状态
  const travelStatus = ref<TravelStatus>({
    isTraveling: false,
    progress: 0,
    distance: 0,
    time: 0,
    speed: 0,
    transport: 'driving'
  })

  // 当前旅行数据
  const currentLocation = ref<Location | null>(null)
  const destination = ref<Location | null>(null)
  const travelStartTime = ref<number | null>(null)
  
  // 旅行模拟器实例
  const travelSimulator = ref<TravelSimulator | null>(null)
  
  // 沿途讲解点
  const routePoints = ref<Array<{
    name: string
    coordinates: [number, number]
    description: string
    distanceFromStart: number
  }>>([])
  
  // 当前讲解点
  const currentRoutePoint = ref<number>(0)

  // 计算属性
  const visitedCount = computed(() => userData.value.visitedLocations.length)
  
  const visitedCountries = computed(() => Array.from(userData.value.visitedCountries))
  
  const currentSpeed = computed(() => {
    if (!selectedProvince.value) return 0
    return selectedProvince.value.speed
  })

  const currentTransport = computed(() => {
    if (!selectedProvince.value) return 'driving'
    return getTransportMode(selectedProvince.value.mount)
  })

  // 获取已走过的路径
  const traveledPath = computed(() => {
    if (!travelSimulator.value) return []
    return travelSimulator.value.getTraveledPath()
  })

  // 获取模拟中的当前位置（用于地图显示）
  const simulatedPosition = computed(() => {
    if (!travelSimulator.value) return undefined
    return travelSimulator.value.getCurrentPosition()
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

    // 选择随机目的地
    const newDestination = getRandomLocation()
    destination.value = newDestination

    // 计算距离
    const distance = calculateDistance(
      currentLocation.value.coordinates,
      newDestination.coordinates
    )

    // 计算旅行时间
    const time = calculateTravelTime(distance, selectedProvince.value.speed)

    // 更新旅行状态
    travelStatus.value = {
      isTraveling: true,
      progress: 0,
      distance,
      time,
      speed: selectedProvince.value.speed,
      transport: getTransportMode(selectedProvince.value.mount)
    }

    travelStartTime.value = Date.now()

    // 创建旅行记录
    const record: TravelRecord = {
      id: Date.now(),
      from: currentLocation.value,
      to: newDestination,
      distance,
      startTime: travelStartTime.value,
      estimatedTime: time,
      transport: getMountType(selectedProvince.value.mount),
      speed: selectedProvince.value.speed
    }

    userData.value.travelRecords.push(record)

    // 开始旅行模拟
    startTravelSimulation(
      currentLocation.value.coordinates,
      newDestination.coordinates,
      distance,
      selectedProvince.value.speed,
      selectedProvince.value.mount
    )
    
    return true
  }

  // 开始旅行模拟
  function startTravelSimulation(
    from: [number, number],
    to: [number, number],
    distance: number,
    speed: number,
    mountType: string
  ) {
    // 停止现有的模拟器
    if (travelSimulator.value) {
      travelSimulator.value.stop()
    }

    // 创建新的模拟器
    travelSimulator.value = new TravelSimulator(from, to, distance, speed, mountType)
    
    // 重置讲解点
    routePoints.value = []
    currentRoutePoint.value = 0

    // 开始模拟
    travelSimulator.value.start(
      // 进度回调
      (progress) => {
        travelStatus.value.progress = progress
      },
      // 讲解点回调
      (point) => {
        // 显示讲解点信息
        showRoutePointInfo(point.description)
      },
      // 完成回调
      () => {
        completeTravel()
      }
    )
  }

  // 显示讲解点信息
  function showRoutePointInfo(description: string) {
    console.log('到达讲解点:', description)
    // 这里可以显示弹窗或通知
  }

  // 完成旅行
  function completeTravel() {
    if (!currentLocation.value || !destination.value) return

    // 更新用户数据
    userData.value.totalDistance += travelStatus.value.distance
    userData.value.visitedLocations.push(destination.value)
    userData.value.visitedCountries.add(destination.value.country)

    // 更新当前位置
    currentLocation.value = destination.value

    // 重置旅行状态
    travelStatus.value.isTraveling = false
    travelStatus.value.progress = 0
    destination.value = null
    travelStartTime.value = null

    // 清理模拟器
    if (travelSimulator.value) {
      travelSimulator.value.stop()
      travelSimulator.value = null
    }

    // 重置讲解点
    routePoints.value = []
    currentRoutePoint.value = 0

    // 自动开始下一次旅行（3秒后）
    setTimeout(() => {
      if (selectedProvince.value) {
        startNewTravel()
      }
    }, 3000)

    // 保存到本地存储
    saveToLocalStorage()
  }

  // 手动结束当前旅行（立即到达）
  function skipToDestination() {
    if (!travelStatus.value.isTraveling) return
    
    // 停止模拟器
    if (travelSimulator.value) {
      travelSimulator.value.stop()
      travelSimulator.value = null
    }
    
    // 直接完成旅行
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

  // 获取当前旅行信息
  function getCurrentTravelInfo() {
    if (!travelStatus.value.isTraveling) return null
    
    return {
      from: currentLocation.value?.name || '未知',
      to: destination.value?.name || '未知',
      progress: travelStatus.value.progress,
      distance: travelStatus.value.distance,
      time: travelStatus.value.time,
      speed: travelStatus.value.speed,
      transport: travelStatus.value.transport,
      remainingTime: travelSimulator.value?.getRemainingTime() || 0
    }
  }

  // 本地存储
  function saveToLocalStorage() {
    const data = {
      selectedProvinceId: selectedProvince.value?.id,
      userData: {
        ...userData.value,
        visitedCountries: Array.from(userData.value.visitedCountries)
      },
      currentLocation: currentLocation.value,
      travelStatus: travelStatus.value
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
          if (parsed.currentLocation) {
            currentLocation.value = parsed.currentLocation
          } else if (parsed.userData.visitedLocations.length > 0) {
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
      
      if (parsed.travelStatus) {
        travelStatus.value = parsed.travelStatus
      }
      
      // 如果用户已选择省份但不在旅行中，自动开始新旅行
      if (selectedProvince.value && !travelStatus.value.isTraveling) {
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
    travelStatus.value = {
      isTraveling: false,
      progress: 0,
      distance: 0,
      time: 0,
      speed: 0,
      transport: 'driving'
    }
    
    // 停止模拟器
    if (travelSimulator.value) {
      travelSimulator.value.stop()
      travelSimulator.value = null
    }
    
    localStorage.removeItem('gotravel_user')
  }

  // 初始化时加载本地存储
  loadFromLocalStorage()

  return {
    // 状态
    selectedProvince,
    userData,
    travelStatus,
    currentLocation,
    destination,
    routePoints,
    currentRoutePoint,
    
    // 计算属性
    visitedCount,
    visitedCountries,
    currentSpeed,
    currentTransport,
    traveledPath,
    simulatedPosition,
    
    // 方法
    selectProvince,
    startNewTravel,
    skipToDestination,
    getRecentTravels,
    getTravelStats,
    getCurrentTravelInfo,
    resetUserData,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})