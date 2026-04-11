// 高德地图路径规划服务
// 使用高德地图API进行真实的路径规划

import { handleAmapApiError } from './apiErrorHandler'

/**
 * 路径规划选项
 */
interface RoutePlanningOptions {
  strategy?: number  // 策略：0-速度优先，1-费用优先，2-距离优先，3-不走高速，4-躲避拥堵，5-多策略
  extensions?: 'base' | 'all'  // 返回结果类型
}

/**
 * 路径规划结果
 */
interface RoutePlanningResult {
  origin: [number, number]
  destination: [number, number]
  distance: number  // 总距离（米）
  duration: number  // 预计时间（秒）
  steps: RouteStep[]  // 路径步骤
  polyline: [number, number][]  // 路径坐标点
}

/**
 * 路径步骤
 */
interface RouteStep {
  instruction: string  // 行驶指示
  distance: number  // 步骤距离（米）
  duration: number  // 步骤时间（秒）
  polyline: [number, number][]  // 步骤坐标点
  road: string  // 道路名称
  action: string  // 动作：直行、左转、右转等
  assistant_action: string  // 辅助动作
}

/**
 * 使用高德地图API进行路径规划
 * @param origin 起点坐标 [lng, lat]
 * @param destination 终点坐标 [lng, lat]
 * @param apiKey 高德地图API Key
 * @param options 规划选项
 * @returns 路径规划结果
 */
export async function planRoute(
  origin: [number, number],
  destination: [number, number],
  apiKey: string,
  options: RoutePlanningOptions = {}
): Promise<RoutePlanningResult> {
  const { strategy = 0, extensions = 'base' } = options
  
  try {
    // 构建API URL
    const url = `https://restapi.amap.com/v3/direction/driving?origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&strategy=${strategy}&extensions=${extensions}&key=${apiKey}`
    
    // 发送请求
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== '1') {
      throw new Error(`API error: ${data.info}`)
    }
    
    // 解析路径数据
    const route = data.route
    const path = route.paths[0]
    
    // 解析步骤
    const steps: RouteStep[] = path.steps.map((step: any) => ({
      instruction: step.instruction,
      distance: parseInt(step.distance),
      duration: parseInt(step.duration),
      polyline: decodePolyline(step.polyline),
      road: step.road || '',
      action: step.action || '',
      assistant_action: step.assistant_action || ''
    }))
    
    // 解析总路径
    const polyline = decodePolyline(path.polyline)
    
    return {
      origin,
      destination,
      distance: parseInt(path.distance),
      duration: parseInt(path.duration),
      steps,
      polyline
    }
    
  } catch (error) {
    console.error('路径规划失败:', error)
    
    // 使用统一的错误处理器
    handleAmapApiError(error, '路径规划')
    
    // 如果API调用失败，使用模拟数据
    return createMockRoute(origin, destination)
  }
}

/**
 * 解码高德地图的polyline编码
 * @param polyline 编码后的polyline字符串
 * @returns 坐标点数组
 */
function decodePolyline(polyline: string): [number, number][] {
  const points: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0
  
  while (index < polyline.length) {
    let b
    let shift = 0
    let result = 0
    
    // 解码纬度
    do {
      b = polyline.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lat += dlat
    
    // 解码经度
    shift = 0
    result = 0
    
    do {
      b = polyline.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
    lng += dlng
    
    points.push([lng * 1e-5, lat * 1e-5])
  }
  
  return points
}

/**
 * 创建模拟路径（当API不可用时）
 * @param origin 起点
 * @param destination 终点
 * @returns 模拟路径规划结果
 */
function createMockRoute(origin: [number, number], destination: [number, number]): RoutePlanningResult {
  const [lng1, lat1] = origin
  const [lng2, lat2] = destination
  
  // 计算距离（简化版）
  const distance = Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)) * 111 * 1000 // 转换为米
  
  // 创建路径点
  const polyline: [number, number][] = []
  const steps: number = 20
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const lng = lng1 + (lng2 - lng1) * t
    const lat = lat1 + (lat2 - lat1) * t
    
    // 添加一些随机偏移，模拟真实道路
    const offsetLng = (Math.random() - 0.5) * 0.01
    const offsetLat = (Math.random() - 0.5) * 0.01
    
    polyline.push([lng + offsetLng, lat + offsetLat])
  }
  
  // 创建步骤
  const stepSize = Math.ceil(polyline.length / 5)
  const routeSteps: RouteStep[] = []
  
  for (let i = 0; i < polyline.length; i += stepSize) {
    const endIndex = Math.min(i + stepSize, polyline.length - 1)
    const stepPolyline = polyline.slice(i, endIndex + 1)
    
    routeSteps.push({
      instruction: `沿道路行驶 ${Math.round(distance / 5)} 米`,
      distance: Math.round(distance / 5),
      duration: Math.round((distance / 5) / (50 * 1000 / 3600)), // 假设速度50km/h
      polyline: stepPolyline,
      road: '模拟道路',
      action: '直行',
      assistant_action: ''
    })
  }
  
  return {
    origin,
    destination,
    distance: Math.round(distance),
    duration: Math.round(distance / (50 * 1000 / 3600)), // 假设速度50km/h
    steps: routeSteps,
    polyline
  }
}

/**
 * 根据速度计算旅行时间
 * @param distance 距离（米）
 * @param speed 速度（km/h）
 * @returns 旅行时间（小时）
 */
export function calculateTravelTime(distance: number, speed: number): number {
  // distance: 距离（千米），speed: 速度（千米/小时）
  return distance / speed
}

/**
 * 将路径点分割为更小的段，用于街道级别行进
 * @param polyline 原始路径点
 * @param segmentLength 每段长度（米）
 * @returns 分割后的路径段
 */
export function splitRouteIntoSegments(
  polyline: [number, number][]
): [number, number][][] {
  if (polyline.length < 2) return [polyline]
  
  const segments: [number, number][][] = []
  let currentSegment: [number, number][] = [polyline[0]]
  
  for (let i = 1; i < polyline.length; i++) {
    currentSegment.push(polyline[i])
    
    // 检查当前段是否达到目标长度
    if (i === polyline.length - 1) {
      segments.push(currentSegment)
    } else {
      // 这里可以添加更精确的长度计算
      // 简化：每5个点作为一个段
      if (i % 5 === 0) {
        segments.push(currentSegment)
        currentSegment = [polyline[i]]
      }
    }
  }
  
  return segments
}

/**
 * 获取当前位置在路径上的进度
 * @param currentPosition 当前位置
 * @param polyline 路径点
 * @returns 进度（0-1）
 */
export function getProgressOnRoute(
  currentPosition: [number, number],
  polyline: [number, number][]
): number {
  if (polyline.length < 2) return 0
  
  // 找到最近的点
  let closestIndex = 0
  let minDistance = Infinity
  
  for (let i = 0; i < polyline.length; i++) {
    const [lng, lat] = polyline[i]
    const [clng, clat] = currentPosition
    const distance = Math.sqrt(Math.pow(lng - clng, 2) + Math.pow(lat - clat, 2))
    
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = i
    }
  }
  
  return closestIndex / (polyline.length - 1)
}

// 全局类型声明
declare global {
  interface Window {
    planRoute: typeof planRoute
    decodePolyline: typeof decodePolyline
  }
}