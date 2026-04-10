import type { Location } from '@/types'

export const locations: Location[] = [
  // 亚洲
  {
    id: 1,
    name: '东京',
    country: '日本',
    countryCode: 'JP',
    coordinates: [139.6917, 35.6895],
    description: '亚洲最大都市，融合传统与现代',
    image: 'tokyo.jpg',
    category: 'city'
  },
  {
    id: 2,
    name: '首尔',
    country: '韩国',
    countryCode: 'KR',
    coordinates: [126.9780, 37.5665],
    description: '韩流文化中心，时尚与传统并存',
    image: 'seoul.jpg',
    category: 'city'
  },
  {
    id: 3,
    name: '新加坡',
    country: '新加坡',
    countryCode: 'SG',
    coordinates: [103.8198, 1.3521],
    description: '花园城市，多元文化融合',
    image: 'singapore.jpg',
    category: 'city'
  },
  {
    id: 4,
    name: '曼谷',
    country: '泰国',
    countryCode: 'TH',
    coordinates: [100.5018, 13.7563],
    description: '微笑之国，佛教文化之都',
    image: 'bangkok.jpg',
    category: 'city'
  },
  {
    id: 5,
    name: '迪拜',
    country: '阿联酋',
    countryCode: 'AE',
    coordinates: [55.2708, 25.2048],
    description: '沙漠奇迹，未来之城',
    image: 'dubai.jpg',
    category: 'city'
  },
  
  // 欧洲
  {
    id: 6,
    name: '巴黎',
    country: '法国',
    countryCode: 'FR',
    coordinates: [2.3522, 48.8566],
    description: '浪漫之都，艺术与时尚之都',
    image: 'paris.jpg',
    category: 'city'
  },
  {
    id: 7,
    name: '伦敦',
    country: '英国',
    countryCode: 'GB',
    coordinates: [-0.1276, 51.5074],
    description: '雾都，历史与现代的交汇',
    image: 'london.jpg',
    category: 'city'
  },
  {
    id: 8,
    name: '罗马',
    country: '意大利',
    countryCode: 'IT',
    coordinates: [12.4964, 41.9028],
    description: '永恒之城，古罗马文明遗迹',
    image: 'rome.jpg',
    category: 'city'
  },
  {
    id: 9,
    name: '巴塞罗那',
    country: '西班牙',
    countryCode: 'ES',
    coordinates: [2.1734, 41.3851],
    description: '高迪建筑艺术之都',
    image: 'barcelona.jpg',
    category: 'city'
  },
  {
    id: 10,
    name: '阿姆斯特丹',
    country: '荷兰',
    countryCode: 'NL',
    coordinates: [4.9041, 52.3676],
    description: '运河之城，自由与艺术',
    image: 'amsterdam.jpg',
    category: 'city'
  },
  
  // 北美
  {
    id: 11,
    name: '纽约',
    country: '美国',
    countryCode: 'US',
    coordinates: [-74.0060, 40.7128],
    description: '世界之都，自由女神像所在地',
    image: 'newyork.jpg',
    category: 'city'
  },
  {
    id: 12,
    name: '洛杉矶',
    country: '美国',
    countryCode: 'US',
    coordinates: [-118.2437, 34.0522],
    description: '天使之城，好莱坞电影之都',
    image: 'losangeles.jpg',
    category: 'city'
  },
  {
    id: 13,
    name: '多伦多',
    country: '加拿大',
    countryCode: 'CA',
    coordinates: [-79.3832, 43.6532],
    description: '多元文化之都，CN塔所在地',
    image: 'toronto.jpg',
    category: 'city'
  },
  {
    id: 14,
    name: '墨西哥城',
    country: '墨西哥',
    countryCode: 'MX',
    coordinates: [-99.1332, 19.4326],
    description: '阿兹特克文明遗址',
    image: 'mexicocity.jpg',
    category: 'city'
  },
  
  // 南美
  {
    id: 15,
    name: '里约热内卢',
    country: '巴西',
    countryCode: 'BR',
    coordinates: [-43.1729, -22.9068],
    description: '狂欢节之都，基督像所在地',
    image: 'rio.jpg',
    category: 'city'
  },
  {
    id: 16,
    name: '布宜诺斯艾利斯',
    country: '阿根廷',
    countryCode: 'AR',
    coordinates: [-58.3816, -34.6037],
    description: '南美巴黎，探戈舞之乡',
    image: 'buenosaires.jpg',
    category: 'city'
  },
  
  // 非洲
  {
    id: 17,
    name: '开罗',
    country: '埃及',
    countryCode: 'EG',
    coordinates: [31.2357, 30.0444],
    description: '金字塔与狮身人面像所在地',
    image: 'cairo.jpg',
    category: 'city'
  },
  {
    id: 18,
    name: '开普敦',
    country: '南非',
    countryCode: 'ZA',
    coordinates: [18.4241, -33.9249],
    description: '桌山与好望角所在地',
    image: 'capetown.jpg',
    category: 'city'
  },
  
  // 大洋洲
  {
    id: 19,
    name: '悉尼',
    country: '澳大利亚',
    countryCode: 'AU',
    coordinates: [151.2093, -33.8688],
    description: '歌剧院与海港大桥所在地',
    image: 'sydney.jpg',
    category: 'city'
  },
  {
    id: 20,
    name: '奥克兰',
    country: '新西兰',
    countryCode: 'NZ',
    coordinates: [174.7633, -36.8485],
    description: '千帆之都，自然风光',
    image: 'auckland.jpg',
    category: 'city'
  },
  
  // 自然景观
  {
    id: 21,
    name: '富士山',
    country: '日本',
    countryCode: 'JP',
    coordinates: [138.7274, 35.3606],
    description: '日本最高峰，活火山',
    image: 'fuji.jpg',
    category: 'nature'
  },
  {
    id: 22,
    name: '大堡礁',
    country: '澳大利亚',
    countryCode: 'AU',
    coordinates: [146.8285, -18.2871],
    description: '世界最大珊瑚礁系统',
    image: 'greatbarrierreef.jpg',
    category: 'nature'
  },
  {
    id: 23,
    name: '亚马逊雨林',
    country: '巴西',
    countryCode: 'BR',
    coordinates: [-63.0281, -3.4653],
    description: '地球之肺，生物多样性宝库',
    image: 'amazon.jpg',
    category: 'nature'
  },
  {
    id: 24,
    name: '撒哈拉沙漠',
    country: '阿尔及利亚',
    countryCode: 'DZ',
    coordinates: [2.5463, 27.2382],
    description: '世界最大沙漠',
    image: 'sahara.jpg',
    category: 'nature'
  },
  
  // 地标建筑
  {
    id: 25,
    name: '埃菲尔铁塔',
    country: '法国',
    countryCode: 'FR',
    coordinates: [2.2945, 48.8584],
    description: '巴黎象征，世界著名铁塔',
    image: 'eiffel.jpg',
    category: 'landmark'
  },
  {
    id: 26,
    name: '泰姬陵',
    country: '印度',
    countryCode: 'IN',
    coordinates: [78.0421, 27.1751],
    description: '世界七大奇迹之一，爱情纪念碑',
    image: 'tajmahal.jpg',
    category: 'landmark'
  },
  {
    id: 27,
    name: '长城',
    country: '中国',
    countryCode: 'CN',
    coordinates: [116.5704, 40.4319],
    description: '世界文化遗产，人类建筑奇迹',
    image: 'greatwall.jpg',
    category: 'landmark'
  },
  {
    id: 28,
    name: '马丘比丘',
    country: '秘鲁',
    countryCode: 'PE',
    coordinates: [-72.5450, -13.1631],
    description: '印加帝国遗址，天空之城',
    image: 'machupicchu.jpg',
    category: 'landmark'
  }
]

// 获取随机地点
export function getRandomLocation(): Location {
  const randomIndex = Math.floor(Math.random() * locations.length)
  return locations[randomIndex]
}

// 按国家获取地点
export function getLocationsByCountry(countryCode: string): Location[] {
  return locations.filter(loc => loc.countryCode === countryCode)
}

// 按类别获取地点
export function getLocationsByCategory(category: Location['category']): Location[] {
  return locations.filter(loc => loc.category === category)
}

// 获取所有国家
export function getAllCountries(): string[] {
  const countries = new Set(locations.map(loc => loc.country))
  return Array.from(countries).filter(Boolean) as string[]
}

// 获取所有国家代码
export function getAllCountryCodes(): string[] {
  const codes = new Set(locations.map(loc => loc.countryCode))
  return Array.from(codes).filter(Boolean) as string[]
}