// 位置信息服务工具
// 根据坐标获取详细位置信息（省、市、区、街道）

// 模拟的位置数据库（实际应该使用高德地图逆地理编码API）
const mockLocationDatabase: Record<string, {
  province: string
  city: string
  district: string
  street: string
  address: string
}> = {
  '116.397428,39.90923': { // 北京
    province: '北京市',
    city: '北京市',
    district: '东城区',
    street: '天安门广场',
    address: '天安门广场'
  },
  '121.4737,31.2304': { // 上海
    province: '上海市',
    city: '上海市',
    district: '黄浦区',
    street: '外滩',
    address: '外滩'
  },
  '113.2644,23.1291': { // 广州
    province: '广东省',
    city: '广州市',
    district: '天河区',
    street: '天河路',
    address: '天河体育中心'
  },
  '120.1536,30.2875': { // 杭州
    province: '浙江省',
    city: '杭州市',
    district: '西湖区',
    street: '西湖',
    address: '西湖风景区'
  },
  '104.0668,30.5728': { // 成都
    province: '四川省',
    city: '成都市',
    district: '武侯区',
    street: '武侯祠大街',
    address: '武侯祠'
  },
  '114.0859,22.547': { // 深圳
    province: '广东省',
    city: '深圳市',
    district: '福田区',
    street: '深南大道',
    address: '市民中心'
  },
  '118.7969,32.0603': { // 南京
    province: '江苏省',
    city: '南京市',
    district: '玄武区',
    street: '中山路',
    address: '中山陵'
  },
  '117.283,31.8612': { // 合肥
    province: '安徽省',
    city: '合肥市',
    district: '包河区',
    street: '芜湖路',
    address: '包公园'
  }
}

// 全球主要城市位置信息
const globalLocations: Record<string, {
  country: string
  city: string
  district: string
  address: string
}> = {
  '139.6917,35.6895': { // 东京
    country: '日本',
    city: '东京',
    district: '新宿区',
    address: '东京都厅'
  },
  '2.3522,48.8566': { // 巴黎
    country: '法国',
    city: '巴黎',
    district: '第一区',
    address: '卢浮宫'
  },
  '-0.1276,51.5072': { // 伦敦
    country: '英国',
    city: '伦敦',
    district: '威斯敏斯特',
    address: '大本钟'
  },
  '-74.006,40.7128': { // 纽约
    country: '美国',
    city: '纽约',
    district: '曼哈顿',
    address: '时代广场'
  },
  '151.2093,-33.8688': { // 悉尼
    country: '澳大利亚',
    city: '悉尼',
    district: '悉尼市中心',
    address: '悉尼歌剧院'
  }
}

/**
 * 根据坐标获取详细位置信息
 * @param coordinates 坐标 [lng, lat]
 * @returns 详细位置信息
 */
export function getDetailedLocation(coordinates: [number, number]): {
  province?: string
  city: string
  district?: string
  street?: string
  address: string
  country: string
} {
  const [lng, lat] = coordinates
  const key = `${lng.toFixed(4)},${lat.toFixed(4)}`
  
  // 先检查中国城市
  if (mockLocationDatabase[key]) {
    const loc = mockLocationDatabase[key]
    return {
      province: loc.province,
      city: loc.city,
      district: loc.district,
      street: loc.street,
      address: loc.address,
      country: '中国'
    }
  }
  
  // 检查全球城市
  if (globalLocations[key]) {
    const loc = globalLocations[key]
    return {
      city: loc.city,
      district: loc.district,
      address: loc.address,
      country: loc.country
    }
  }
  
  // 如果找不到精确匹配，查找最近的城市
  const allLocations = { ...mockLocationDatabase, ...globalLocations }
  let closestKey = ''
  let minDistance = Infinity
  
  for (const locKey in allLocations) {
    const [locLng, locLat] = locKey.split(',').map(Number)
    const distance = Math.sqrt(
      Math.pow(locLng - lng, 2) + Math.pow(locLat - lat, 2)
    )
    
    if (distance < minDistance) {
      minDistance = distance
      closestKey = locKey
    }
  }
  
  if (closestKey && minDistance < 5) { // 5度以内的距离
    const loc = allLocations[closestKey] as any
    
    if (closestKey in mockLocationDatabase) {
      return {
        province: loc.province,
        city: loc.city,
        district: loc.district,
        street: loc.street,
        address: `附近 ${loc.address}`,
        country: '中国'
      }
    } else {
      return {
        city: loc.city,
        district: loc.district,
        address: `附近 ${loc.address}`,
        country: loc.country
      }
    }
  }
  
  // 默认返回
  return {
    city: '未知城市',
    address: '未知位置',
    country: '未知国家'
  }
}

/**
 * 格式化位置信息为字符串
 * @param coordinates 坐标
 * @returns 格式化后的位置字符串
 */
export function formatLocation(coordinates: [number, number]): string {
  const location = getDetailedLocation(coordinates)
  
  const parts: string[] = []
  
  if (location.country === '中国') {
    if (location.province) parts.push(location.province)
    if (location.city && location.city !== location.province) parts.push(location.city)
    if (location.district) parts.push(location.district)
    if (location.street) parts.push(location.street)
  } else {
    parts.push(location.country)
    if (location.city) parts.push(location.city)
    if (location.district) parts.push(location.district)
  }
  
  return parts.join('，')
}

/**
 * 获取当前位置的详细地址
 * @param coordinates 坐标
 * @returns 详细地址
 */
export function getFullAddress(coordinates: [number, number]): string {
  const location = getDetailedLocation(coordinates)
  const formatted = formatLocation(coordinates)
  
  if (location.address && !formatted.includes(location.address)) {
    return `${formatted}，${location.address}`
  }
  
  return formatted
}

// 全局类型声明
declare global {
  interface Window {
    getDetailedLocation: typeof getDetailedLocation
    formatLocation: typeof formatLocation
    getFullAddress: typeof getFullAddress
  }
}