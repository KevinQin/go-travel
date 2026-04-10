// 旅行模拟器工具
// 模拟真实的路径行进，支持沿途讲解

/**
 * 计算路径上的多个中间点（模拟真实路线）
 * @param from 起点坐标 [lng, lat]
 * @param to 终点坐标 [lng, lat]
 * @param numPoints 中间点数量
 * @returns 路径点数组
 */
export function calculatePathPoints(
  from: [number, number],
  to: [number, number],
  numPoints: number = 10
): [number, number][] {
  const [lng1, lat1] = from
  const [lng2, lat2] = to
  
  const points: [number, number][] = []
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    // 线性插值
    const lng = lng1 + (lng2 - lng1) * t
    const lat = lat1 + (lat2 - lat1) * t
    
    // 添加一些随机偏移，模拟真实路线
    const offsetLng = (Math.random() - 0.5) * 0.5
    const offsetLat = (Math.random() - 0.5) * 0.5
    
    points.push([lng + offsetLng, lat + offsetLat])
  }
  
  return points
}

/**
 * 计算旅行时间（小时）
 * @param distance 距离（公里）
 * @param speed 速度（公里/小时）
 * @returns 旅行时间（小时）
 */
export function calculateTravelTime(distance: number, speed: number): number {
  return distance / speed
}

/**
 * 模拟旅行进度
 * @param startTime 开始时间（时间戳）
 * @param totalTime 总时间（小时）
 * @returns 进度百分比（0-100）
 */
export function calculateTravelProgress(startTime: number, totalTime: number): number {
  const now = Date.now()
  const elapsedHours = (now - startTime) / (1000 * 60 * 60)
  
  if (elapsedHours >= totalTime) {
    return 100
  }
  
  return Math.min(100, (elapsedHours / totalTime) * 100)
}

/**
 * 根据坐骑类型获取行进模式
 * @param mountType 坐骑类型
 * @returns 行进模式
 */
export function getTransportMode(mountType: string): 'walking' | 'riding' | 'flying' | 'driving' {
  const animalMounts = ['熊猫', '骆驼', '大象']
  const ridingMounts = ['骏马', '醒狮']
  const flyingMounts: string[] = [] // 暂时没有飞行坐骑
  const vehicleMounts = ['高铁', '磁悬浮', '数字高铁']
  
  if (animalMounts.includes(mountType)) {
    return 'walking'
  } else if (ridingMounts.includes(mountType)) {
    return 'riding'
  } else if (flyingMounts.includes(mountType)) {
    return 'flying'
  } else if (vehicleMounts.includes(mountType)) {
    return 'driving'
  }
  
  return 'driving' // 默认
}

/**
 * 获取沿途讲解点
 * @param from 起点
 * @param to 终点
 * @param distance 距离
 * @returns 讲解点数组
 */
export function getRoutePoints(
  from: { name: string, coordinates: [number, number] },
  to: { name: string, coordinates: [number, number] },
  distance: number
): Array<{
  name: string
  coordinates: [number, number]
  description: string
  distanceFromStart: number
}> {
  const points: Array<{
    name: string
    coordinates: [number, number]
    description: string
    distanceFromStart: number
  }> = []
  
  const [lng1, lat1] = from.coordinates
  const [lng2, lat2] = to.coordinates
  
  // 根据距离决定讲解点数量
  const numPoints = Math.min(Math.floor(distance / 500), 5)
  
  for (let i = 1; i <= numPoints; i++) {
    const t = i / (numPoints + 1)
    const lng = lng1 + (lng2 - lng1) * t
    const lat = lat1 + (lat2 - lat1) * t
    
    // 模拟沿途城市或景点
    const pointNames = [
      '途经城市',
      '风景名胜',
      '休息站点',
      '文化地标',
      '自然景观'
    ]
    
    const pointDescriptions = [
      '这里是一个美丽的城市，有着悠久的历史和丰富的文化。',
      '著名的旅游景点，每年吸引大量游客前来参观。',
      '适合休息的地方，可以品尝当地特色美食。',
      '重要的文化地标，见证了历史的变迁。',
      '壮丽的自然景观，让人心旷神怡。'
    ]
    
    const randomIndex = Math.floor(Math.random() * pointNames.length)
    
    points.push({
      name: pointNames[randomIndex],
      coordinates: [lng, lat],
      description: pointDescriptions[randomIndex],
      distanceFromStart: distance * t
    })
  }
  
  return points
}

/**
 * 旅行模拟器类
 */
export class TravelSimulator {
  private intervalId: number | null = null
  private currentProgress: number = 0
  private startTime: number = 0
  private totalTime: number = 0
  private routePoints: Array<{ coordinates: [number, number], description: string }> = []
  private currentPointIndex: number = 0
  
  constructor(
    private from: [number, number],
    private to: [number, number],
    private distance: number,
    speed: number,
    _mountType: string
  ) {
    this.totalTime = calculateTravelTime(distance, speed)
  }
  
  /**
   * 开始旅行
   * @param onProgress 进度回调
   * @param onPointReached 到达讲解点回调
   * @param onComplete 完成回调
   */
  start(
    onProgress: (progress: number, currentPosition: [number, number]) => void,
    onPointReached: (point: { coordinates: [number, number], description: string }) => void,
    onComplete: () => void
  ) {
    this.startTime = Date.now()
    this.currentProgress = 0
    this.currentPointIndex = 0
    
    // 计算路径点和讲解点
    const pathPoints = calculatePathPoints(this.from, this.to, 20)
    this.routePoints = pathPoints.map((point, index) => ({
      coordinates: point,
      description: `路径点 ${index + 1}`
    }))
    
    // 添加沿途讲解点
    const routePoints = getRoutePoints(
      { name: '起点', coordinates: this.from },
      { name: '终点', coordinates: this.to },
      this.distance
    )
    
    routePoints.forEach(point => {
      // 找到最近的路径点
      const closestIndex = this.findClosestPointIndex(point.coordinates)
      if (closestIndex > 0 && closestIndex < this.routePoints.length - 1) {
        this.routePoints[closestIndex] = {
          coordinates: point.coordinates,
          description: point.description
        }
      }
    })
    
    // 开始模拟
    this.intervalId = window.setInterval(() => {
      const progress = calculateTravelProgress(this.startTime, this.totalTime)
      this.currentProgress = progress
      
      // 计算当前位置
      const currentIndex = Math.floor((progress / 100) * (this.routePoints.length - 1))
      const currentPosition = this.routePoints[Math.min(currentIndex, this.routePoints.length - 1)].coordinates
      
      // 检查是否到达讲解点
      if (currentIndex > this.currentPointIndex) {
        this.currentPointIndex = currentIndex
        const currentPoint = this.routePoints[currentIndex]
        if (currentPoint.description !== `路径点 ${currentIndex + 1}`) {
          onPointReached(currentPoint)
        }
      }
      
      // 更新进度
      onProgress(progress, currentPosition)
      
      // 检查是否完成
      if (progress >= 100) {
        this.stop()
        onComplete()
      }
    }, 100) // 每100毫秒更新一次
  }
  
  /**
   * 停止旅行
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  
  /**
   * 获取当前进度
   */
  getProgress(): number {
    return this.currentProgress
  }
  
  /**
   * 获取剩余时间（小时）
   */
  getRemainingTime(): number {
    if (this.currentProgress >= 100) return 0
    
    const elapsedHours = (Date.now() - this.startTime) / (1000 * 60 * 60)
    const totalHours = this.totalTime
    return Math.max(0, totalHours - elapsedHours)
  }
  
  /**
   * 找到最近的路径点索引
   */
  private findClosestPointIndex(target: [number, number]): number {
    let closestIndex = 0
    let minDistance = Infinity
    
    this.routePoints.forEach((point, index) => {
      const dx = point.coordinates[0] - target[0]
      const dy = point.coordinates[1] - target[1]
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })
    
    return closestIndex
  }
}

// 全局类型声明
declare global {
  interface Window {
    TravelSimulator: typeof TravelSimulator
  }
}