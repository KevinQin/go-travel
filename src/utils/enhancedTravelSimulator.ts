// 增强版旅行模拟器
// 使用高德地图API进行真实的路径规划和街道级别行进

import { planRoute, splitRouteIntoSegments, calculateTravelTime as calculateTravelTimeFromPlanner } from './routePlanner'
import { handleAmapApiError } from './apiErrorHandler'

/**
 * 增强版旅行模拟器类
 */
export class EnhancedTravelSimulator {
  private intervalId: number | null = null
  private currentProgress: number = 0
  private startTime: number = 0
  private totalTime: number = 0
  private routePoints: [number, number][] = []
  private routeSegments: [number, number][][] = []
  private currentSegmentIndex: number = 0
  private currentPosition: [number, number]
  private apiKey: string
  
  constructor(
    private from: [number, number],
    private to: [number, number],
    private distance: number, // 距离（公里）
    speed: number, // 速度（公里/小时）
    _mountType: string,
    apiKey: string
  ) {
    this.currentPosition = from
    this.apiKey = apiKey
    
    // 计算总旅行时间（小时）
    // distance已经是公里，speed是公里/小时
    this.totalTime = calculateTravelTimeFromPlanner(distance, speed)
    
    console.log('📊 模拟器初始化:', {
      distance: distance + ' km',
      speed: speed + ' km/h',
      totalTime: this.totalTime + ' hours',
      from,
      to
    })
  }
  
  /**
   * 开始旅行
   * @param onProgress 进度回调
   * @param onPointReached 到达路径点回调
   * @param onSegmentChanged 切换路段回调
   * @param onComplete 完成回调
   */
  async start(
    onProgress: (progress: number, currentPosition: [number, number], currentRoad?: string) => void,
    onPointReached: (point: { coordinates: [number, number], description: string }) => void,
    onSegmentChanged: (segment: { index: number, total: number, road?: string }) => void,
    onComplete: () => void
  ) {
    console.log('🎬 开始旅行模拟，起点:', this.from, '终点:', this.to)
    this.startTime = Date.now()
    this.currentProgress = 0
    this.currentSegmentIndex = 0
    
    try {
      console.log('🗺️ 开始路径规划...')
      // 使用高德地图API进行路径规划
      const route = await planRoute(this.from, this.to, this.apiKey)
      console.log('✅ 路径规划成功，总距离:', route.distance, '米，总时间:', route.duration, '秒')
      
      // 获取路径点
      this.routePoints = route.polyline
      console.log('📊 路径点数量:', this.routePoints.length)
      
      // 分割为路段（街道级别）
      this.routeSegments = splitRouteIntoSegments(this.routePoints) // 每100米一个路段
      console.log('🛣️ 路段数量:', this.routeSegments.length)
      
      // 通知第一个路段
      if (this.routeSegments.length > 0) {
        onSegmentChanged({
          index: 0,
          total: this.routeSegments.length,
          road: this.getCurrentRoad(route)
        })
      }
      
      console.log('⏱️ 开始模拟，总时间:', this.totalTime, '小时')
      // 开始模拟
      this.intervalId = window.setInterval(() => {
        this.updatePosition(onProgress, onPointReached, onSegmentChanged, onComplete, route)
      }, 100) // 每100毫秒更新一次
      
    } catch (error) {
      console.error('❌ 路径规划失败，使用模拟模式:', error)
      
      // 使用统一的错误处理器
      handleAmapApiError(error, '旅行模拟器')
      
      // 如果API失败，使用模拟模式
      this.startSimulationMode(onProgress, onPointReached, onSegmentChanged, onComplete)
    }
  }
  
  /**
   * 更新当前位置
   */
  private updatePosition(
    onProgress: (progress: number, currentPosition: [number, number], currentRoad?: string) => void,
    onPointReached: (point: { coordinates: [number, number], description: string }) => void,
    onSegmentChanged: (segment: { index: number, total: number, road?: string }) => void,
    onComplete: () => void,
    route?: any
  ) {
    const progress = this.calculateTravelProgress()
    console.log('📈 计算进度:', progress, '当前时间:', Date.now() - this.startTime, 'ms')
    
    if (progress !== this.currentProgress) {
      console.log('🔄 进度变化:', this.currentProgress, '->', progress)
      this.currentProgress = progress
      
      // 计算当前位置在路径上的位置
      const pointIndex = Math.floor(progress * (this.routePoints.length - 1))
      
      // 更新当前位置
      if (pointIndex < this.routePoints.length) {
        this.currentPosition = this.routePoints[pointIndex]
        console.log('📍 更新位置:', this.currentPosition, '索引:', pointIndex)
        
        // 检查是否切换了路段
        const segmentIndex = Math.floor(pointIndex / (this.routePoints.length / this.routeSegments.length))
        if (segmentIndex > this.currentSegmentIndex) {
          this.currentSegmentIndex = segmentIndex
          console.log(`🛣️ 切换到路段 ${this.currentSegmentIndex + 1}/${this.routeSegments.length}`)
          onSegmentChanged({
            index: this.currentSegmentIndex,
            total: this.routeSegments.length,
            road: route ? this.getCurrentRoad(route) : undefined
          })
        }
        
        // 通知进度更新
        onProgress(progress, this.currentPosition, route ? this.getCurrentRoad(route) : undefined)
        
        // 检查是否到达讲解点（每10%进度一个讲解点）
        if (Math.floor(progress * 10) > Math.floor((progress - 0.01) * 10) && progress > 0.1) {
          console.log('💬 触发讲解点，进度:', progress)
          onPointReached({
            coordinates: this.currentPosition,
            description: this.getRoutePointDescription(progress)
          })
        }
        
        // 检查是否完成
        if (progress >= 1) {
          console.log('🏁 旅行完成，停止模拟器')
          this.stop()
          onComplete()
        }
      }
    }
  }
  
  /**
   * 模拟模式（当API不可用时）
   */
  private startSimulationMode(
    onProgress: (progress: number, currentPosition: [number, number], currentRoad?: string) => void,
    onPointReached: (point: { coordinates: [number, number], description: string }) => void,
    onSegmentChanged: (segment: { index: number, total: number, road?: string }) => void,
    onComplete: () => void
  ) {
    // 创建模拟路径点
    const numPoints = 100
    this.routePoints = []
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const lng = this.from[0] + (this.to[0] - this.from[0]) * t
      const lat = this.from[1] + (this.to[1] - this.from[1]) * t
      
      // 添加一些随机偏移，模拟真实道路
      const offsetLng = (Math.random() - 0.5) * 0.01
      const offsetLat = (Math.random() - 0.5) * 0.01
      
      this.routePoints.push([lng + offsetLng, lat + offsetLat])
    }
    
    // 分割为路段
    this.routeSegments = splitRouteIntoSegments(this.routePoints)
    
    // 开始模拟
    this.intervalId = window.setInterval(() => {
      this.updatePosition(onProgress, onPointReached, onSegmentChanged, onComplete)
    }, 100)
  }
  
  /**
   * 计算旅行进度
   */
  private calculateTravelProgress(): number {
    const elapsedMs = Date.now() - this.startTime
    const elapsedHours = elapsedMs / (1000 * 60 * 60)
    
    // 使用加速因子：1秒模拟1分钟（60倍加速）
    const accelerationFactor = 60
    const acceleratedElapsedHours = elapsedHours * accelerationFactor
    
    const progress = Math.min(1, acceleratedElapsedHours / this.totalTime)
    
    // 调试信息
    if (elapsedMs % 5000 < 100) { // 每5秒输出一次
      console.log('⏱️ 进度计算:', {
        elapsedMs,
        elapsedHours: elapsedHours.toFixed(4),
        acceleratedHours: acceleratedElapsedHours.toFixed(4),
        totalTime: this.totalTime.toFixed(4),
        progress: (progress * 100).toFixed(2) + '%'
      })
    }
    
    return progress
  }
  
  /**
   * 获取当前道路信息
   */
  private getCurrentRoad(route: any): string {
    if (!route.steps || route.steps.length === 0) return '道路'
    
    // 根据当前位置找到对应的步骤
    const progress = this.currentProgress
    const stepIndex = Math.floor(progress * route.steps.length)
    
    if (stepIndex < route.steps.length) {
      return route.steps[stepIndex].road || '道路'
    }
    
    return '道路'
  }
  
  /**
   * 获取路径点描述
   */
  private getRoutePointDescription(progress: number): string {
    const distanceTraveled = this.distance * progress
    
    if (progress < 0.25) {
      return `刚刚出发，已行驶 ${distanceTraveled.toFixed(1)} 公里`
    } else if (progress < 0.5) {
      return `行程过半，已行驶 ${distanceTraveled.toFixed(1)} 公里`
    } else if (progress < 0.75) {
      return `接近目的地，已行驶 ${distanceTraveled.toFixed(1)} 公里`
    } else {
      return `即将到达，已行驶 ${distanceTraveled.toFixed(1)} 公里`
    }
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
   * 获取当前位置
   */
  getCurrentPosition(): [number, number] {
    return this.currentPosition
  }
  
  /**
   * 获取当前进度
   */
  getProgress(): number {
    return this.currentProgress * 100 // 转换为百分比
  }
  
  /**
   * 获取已走过的路径点
   */
  getTraveledPath(): [number, number][] {
    const traveledPoints: [number, number][] = []
    const numPoints = Math.floor(this.currentProgress * (this.routePoints.length - 1))
    
    for (let i = 0; i <= numPoints; i++) {
      traveledPoints.push(this.routePoints[i])
    }
    
    return traveledPoints
  }
  
  /**
   * 获取剩余时间（小时）
   */
  getRemainingTime(): number {
    if (this.currentProgress >= 1) return 0
    
    const elapsedHours = (Date.now() - this.startTime) / (1000 * 60 * 60)
    return Math.max(0, this.totalTime - elapsedHours)
  }
  
  /**
   * 获取当前路段信息
   */
  getCurrentSegment(): { index: number, total: number } {
    return {
      index: this.currentSegmentIndex,
      total: this.routeSegments.length
    }
  }
}

// 全局类型声明
declare global {
  interface Window {
    EnhancedTravelSimulator: typeof EnhancedTravelSimulator
  }
}