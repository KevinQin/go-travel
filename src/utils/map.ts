// 高德地图工具函数
// 注意：需要申请高德地图API key

/**
 * 加载高德地图SDK
 * @param apiKey 高德地图API Key
 * @returns Promise
 */
export function loadAMapSDK(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`
    script.async = true
    script.onload = () => {
      // 加载UI组件库
      const uiScript = document.createElement('script')
      uiScript.src = 'https://webapi.amap.com/ui/1.1/main.js'
      uiScript.async = true
      uiScript.onload = () => resolve()
      uiScript.onerror = reject
      document.head.appendChild(uiScript)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * 创建地图实例
 * @param containerId 容器ID
 * @param center 中心点坐标 [lng, lat]
 * @param zoom 缩放级别
 * @returns 地图实例
 */
export function createMap(
  containerId: string,
  center: [number, number] = [116.397428, 39.90923], // 北京
  zoom: number = 5
): Promise<any> {
  return new Promise((resolve) => {
    const map = new window.AMap.Map(containerId, {
      zoom,
      center,
      viewMode: '2D',
      resizeEnable: true,
      zoomEnable: true,
      dragEnable: true,
      doubleClickZoom: true,
      keyboardEnable: true,
      scrollWheel: true,
      touchZoom: true,
      mapStyle: 'amap://styles/light', // 浅色主题
      // 性能优化配置
      optimizePanAnimation: true,
      animateEnable: true,
      renderOnMoving: true,
      showIndoorMap: false,
      // 尝试减少Canvas读取操作
      features: ['bg', 'point', 'road', 'building'],
    })
    resolve(map)
  })
}

/**
 * 添加省份标记
 * @param map 地图实例
 * @param provinces 省份数据
 */
export function addProvinceMarkers(map: any, provinces: Array<{ coordinates: [number, number], name: string, color: string }>) {
  provinces.forEach(province => {
    const marker = new window.AMap.Marker({
      position: new window.AMap.LngLat(province.coordinates[0], province.coordinates[1]),
      title: province.name,
      offset: new window.AMap.Pixel(-13, -30)
    })

    // 自定义标记内容
    const content = `
      <div style="
        background-color: ${province.color};
        color: white;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${province.name.charAt(0)}
      </div>
    `

    marker.setContent(content)
    marker.setMap(map)

    // 点击事件
    marker.on('click', () => {
      map.setCenter(marker.getPosition())
      map.setZoom(8)
    })
  })
}

/**
 * 添加旅行路径
 * @param map 地图实例
 * @param from 起点坐标 [lng, lat]
 * @param to 终点坐标 [lng, lat]
 * @param color 路径颜色
 */
export function addTravelPath(map: any, from: [number, number], to: [number, number], color: string = '#4CAF50') {
  const path = [
    new window.AMap.LngLat(from[0], from[1]),
    new window.AMap.LngLat(to[0], to[1])
  ]

  const polyline = new window.AMap.Polyline({
    path,
    strokeColor: color,
    strokeWeight: 3,
    strokeOpacity: 0.6,
    strokeStyle: 'solid',
    lineJoin: 'round',
    lineCap: 'round'
  })

  polyline.setMap(map)
  return polyline
}

/**
 * 添加目的地标记
 * @param map 地图实例
 * @param location 地点数据
 */
export function addDestinationMarker(map: any, location: { coordinates: [number, number], name: string, country: string }) {
  const marker = new window.AMap.Marker({
    position: new window.AMap.LngLat(location.coordinates[0], location.coordinates[1]),
    title: `${location.name}, ${location.country}`,
    offset: new window.AMap.Pixel(-13, -30)
  })

  // 自定义标记内容
  const content = `
    <div style="
      background-color: #FF6B6B;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      animation: pulse 1.5s infinite;
    ">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    </style>
  `

  marker.setContent(content)
  marker.setMap(map)

  // 信息窗口
  const infoWindow = new window.AMap.InfoWindow({
    content: `
      <div style="padding: 10px;">
        <h3 style="margin: 0 0 8px; color: #333;">${location.name}</h3>
        <p style="margin: 0; color: #666;">${location.country}</p>
      </div>
    `,
    offset: new window.AMap.Pixel(0, -40)
  })

  marker.on('click', () => {
    infoWindow.open(map, marker.getPosition())
  })

  return { marker, infoWindow }
}

/**
 * 计算两点间距离（简化版，使用球面余弦公式）
 * @param from 起点坐标 [lng, lat]
 * @param to 终点坐标 [lng, lat]
 * @returns 距离（公里）
 */
export function calculateDistance(from: [number, number], to: [number, number]): number {
  const [lng1, lat1] = from
  const [lng2, lat2] = to

  // 将经纬度转换为弧度
  const rad = (deg: number) => deg * Math.PI / 180
  const radLat1 = rad(lat1)
  const radLat2 = rad(lat2)
  const radLng1 = rad(lng1)
  const radLng2 = rad(lng2)

  // 球面余弦公式
  const a = Math.sin((radLat2 - radLat1) / 2) ** 2 +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin((radLng2 - radLng1) / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // 地球半径（公里）
  const R = 6371
  return Math.round(R * c)
}

/**
 * 飞行动画
 * @param map 地图实例
 * @param from 起点坐标
 * @param to 终点坐标
 * @param duration 动画时长（毫秒）
 */
export function flyTo(map: any, from: [number, number], to: [number, number], duration: number = 2000) {
  return new Promise((resolve) => {
    map.setZoomAndCenter(5, from)
    
    setTimeout(() => {
      // 平滑移动到目的地
      map.setZoomAndCenter(8, to, true, duration / 1000)
      
      setTimeout(() => {
        resolve(null)
      }, duration)
    }, 500)
  })
}

// 全局类型声明
declare global {
  interface Window {
    AMap: any
  }
}