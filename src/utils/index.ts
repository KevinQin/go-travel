// 通用工具函数

/**
 * 格式化数字（添加千分位）
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

/**
 * 生成随机整数
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 计算两点间距离（简化版）
 * @param lat1 纬度1
 * @param lng1 经度1
 * @param lat2 纬度2
 * @param lng2 经度2
 * @returns 距离（公里）
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/**
 * 防抖函数
 * @param fn 原函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 * @param fn 原函数
 * @param interval 时间间隔（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= interval) {
      fn(...args)
      lastTime = now
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 格式化时间
 * @param date 日期对象或时间戳
 * @param format 格式字符串（默认：YYYY-MM-DD HH:mm:ss）
 * @returns 格式化后的时间字符串
 */
export function formatDate(
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date)
  
  const pad = (n: number) => n.toString().padStart(2, '0')
  
  const replacements: Record<string, string> = {
    'YYYY': d.getFullYear().toString(),
    'MM': pad(d.getMonth() + 1),
    'DD': pad(d.getDate()),
    'HH': pad(d.getHours()),
    'mm': pad(d.getMinutes()),
    'ss': pad(d.getSeconds())
  }
  
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match])
}

/**
 * 从数组中随机选择元素
 * @param array 数组
 * @returns 随机选择的元素
 */
export function randomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * 数组洗牌（Fisher-Yates算法）
 * @param array 要洗牌的数组
 * @returns 洗牌后的数组
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 安全获取对象属性
 * @param obj 对象
 * @param path 属性路径（如 'a.b.c'）
 * @param defaultValue 默认值
 * @returns 属性值或默认值
 */
export function get(
  obj: any,
  path: string,
  defaultValue: any = undefined
): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null) return defaultValue
    result = result[key]
  }
  
  return result === undefined ? defaultValue : result
}

/**
 * 判断是否在移动端
 * @returns 是否在移动端
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise
 */
export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  
  // 兼容旧浏览器
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (successful) {
        resolve()
      } else {
        reject(new Error('复制失败'))
      }
    } catch (err) {
      document.body.removeChild(textarea)
      reject(err)
    }
  })
}

/**
 * 生成颜色渐变
 * @param startColor 起始颜色（十六进制）
 * @param endColor 结束颜色（十六进制）
 * @param steps 步数
 * @returns 颜色数组
 */
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const start = parseInt(startColor.slice(1), 16)
  const end = parseInt(endColor.slice(1), 16)
  
  const startR = (start >> 16) & 255
  const startG = (start >> 8) & 255
  const startB = start & 255
  
  const endR = (end >> 16) & 255
  const endG = (end >> 8) & 255
  const endB = end & 255
  
  const gradient: string[] = []
  
  for (let i = 0; i < steps; i++) {
    const r = Math.round(startR + (endR - startR) * (i / (steps - 1)))
    const g = Math.round(startG + (endG - startG) * (i / (steps - 1)))
    const b = Math.round(startB + (endB - startB) * (i / (steps - 1)))
    
    gradient.push(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`)
  }
  
  return gradient
}

/**
 * 文件大小格式化
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * 验证手机号格式（中国）
 * @param phone 手机号
 * @returns 是否有效
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

/**
 * 生成指定长度的随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}