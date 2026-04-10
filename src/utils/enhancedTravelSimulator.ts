// 增强版旅行模拟器
// 使用高德地图API进行真实的路径规划和街道级别行进

import { planRoute, splitRouteIntoSegments, calculateTravelTime as calculateTravelTimeFromPlanner } from './routePlanner'

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
    private distance: number,
    speed: number,
    _mountType: string,
    apiKey: string
  ) {
    this.currentPosition = from
    this.apiKey = apiKey
    this.totalTime = calculateTravelTimeFromPlanner(distance * 1000, speed) // 距离转换为米
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
    this.startTime = Date.now()
    this.currentProgress = 0
    this.currentSegmentIndex = 0
    
    try {
      // 使用高德地图API进行路径规划
      const route = await planRoute(this.from, this.to, this.apiKey)
      
      // 获取路径点
      this.routePoints = route.polyline
      
      // 分割为路段（街道级别）
      this.routeSegments = splitRouteIntoSegments(this.routePoints) // 每100米一个路段
      
      // 通知第一个路段
      if (this.routeSegments.length > 0) {
        onSegmentChanged({
          index: 0,
          total: this.routeSegments.length,
          road: this.getCurrentRoad(route)
        })
      }
      
      // 开始模拟
      this.intervalId = window.setInterval(() => {
        this.updatePosition(onProgress, onPointReached, onSegmentChanged, onComplete, route)
      }, 100) // 每100毫秒更新一次
      
    } catch (error) {
      console.error('路径规划失败，使用模拟模式:', error)
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
    this.currentProgress = progress
    
    // 计算当前位置在路径上的位置
    const pointIndex = Math.floor(progress * (this.routePoints.length - 1))
    
    // 更新当前位置
    if (pointIndex < this.routePoints.length) {
      this.currentPosition = this.routePoints[pointIndex]
      
      // 检查是否切换了路段
      const segmentIndex = Math.floor(pointIndex / (this.routePoints.length / this.routeSegments.length))
      if (segmentIndex > this.currentSegmentIndex) {
        this.currentSegmentIndex = segmentIndex
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
        onPointReached({
          coordinates: this.currentPosition,
          description: this.getRoutePointDescription(progress)
        })
      }
      
      // 检查是否完成
      if (progress >= 1) {
        this.stop()
        onComplete()
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
    const elapsedHours = (Date.now() - this.startTime) / (1000 * 60 * 60)
    return Math.min(1, elapsedHours / this.totalTime)
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