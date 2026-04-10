// 省份数据 - 动物坐骑优先，实在找不到用交通工具
export interface Province {
  id: number
  name: string
  code: string
  coordinates: [number, number]
  color: string
  mount: string  // 坐骑名称
  speed: number
  description: string
  icon: string
}

export const provinces: Province[] = [
  {
    id: 1,
    name: '四川',
    code: 'SC',
    coordinates: [104.0668, 30.5728],
    color: '#96CEB4',
    mount: '熊猫',
    speed: 30,
    description: '国宝熊猫，悠闲漫步',
    icon: '🐼'
  },
  {
    id: 2,
    name: '广东',
    code: 'GD',
    coordinates: [113.2644, 23.1291],
    color: '#45B7D1',
    mount: '醒狮',
    speed: 40,
    description: '南狮威武，醒狮文化',
    icon: '🦁'
  },
  {
    id: 3,
    name: '内蒙古',
    code: 'NM',
    coordinates: [111.7510, 40.8415],
    color: '#DDA0DD',
    mount: '骏马',
    speed: 60,
    description: '草原骏马，自由奔腾',
    icon: '🐎'
  },
  {
    id: 4,
    name: '新疆',
    code: 'XJ',
    coordinates: [87.6168, 43.8256],
    color: '#FFEAA7',
    mount: '骆驼',
    speed: 20,
    description: '沙漠之舟，坚韧不拔',
    icon: '🐫'
  },
  {
    id: 5,
    name: '云南',
    code: 'YN',
    coordinates: [102.7123, 25.0406],
    color: '#76D7C4',
    mount: '大象',
    speed: 25,
    description: '亚洲象，雨林漫步',
    icon: '🐘'
  },
  {
    id: 6,
    name: '北京',
    code: 'BJ',
    coordinates: [116.4074, 39.9042],
    color: '#FF6B6B',
    mount: '高铁',
    speed: 300,
    description: '中国高铁，速度先锋',
    icon: '🚄'
  },
  {
    id: 7,
    name: '上海',
    code: 'SH',
    coordinates: [121.4737, 31.2304],
    color: '#4ECDC4',
    mount: '磁悬浮',
    speed: 430,
    description: '磁悬浮列车，科技前沿',
    icon: '🚝'
  },
  {
    id: 8,
    name: '浙江',
    code: 'ZJ',
    coordinates: [120.1536, 30.2875],
    color: '#98D8C8',
    mount: '数字高铁',
    speed: 280,
    description: '智慧出行，数字浙江',
    icon: '🚅'
  }
]

// 获取省份名称列表
export function getProvinceNames(): string[] {
  return provinces.map(p => p.name)
}

// 根据ID获取省份
export function getProvinceById(id: number): Province | undefined {
  return provinces.find(p => p.id === id)
}

// 根据名称获取省份
export function getProvinceByName(name: string): Province | undefined {
  return provinces.find(p => p.name === name)
}