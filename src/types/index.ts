// 省份类型
export interface Province {
  id: number
  name: string
  code: string
  coordinates: [number, number]
  color: string
  mount: string
  speed: number
  description: string
  icon: string
}

// 地点类型
export interface Location {
  id: number
  name: string
  country: string
  countryCode?: string
  coordinates: [number, number]
  category: 'city' | 'landmark' | 'nature'
  description: string
  image?: string
}

// 旅行记录
export interface TravelRecord {
  id: number
  from: Location
  to: Location
  distance: number
  startTime: number
  estimatedTime: number // 小时
  transport: MountType
  speed: number
}

// 用户数据
export interface UserData {
  totalDistance: number
  visitedLocations: Location[]
  visitedCountries: Set<string>
  travelRecords: TravelRecord[]
}

// 排行榜项目
export interface RankingItem {
  provinceId: number
  provinceName: string
  participants: number
  totalDistance: number
  visitedCountries: number
  [key: string]: any
}

// 地图路径
export interface TravelPath {
  from: [number, number]
  to: [number, number]
  color?: string
  transport?: TransportMode
}

// 旅行状态
export interface TravelStatus {
  isTraveling: boolean
  progress: number
  distance: number
  time: number
  speed: number
  transport: TransportMode
}