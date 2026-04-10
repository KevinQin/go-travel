<template>
  <div class="amap-container">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>
    
    <!-- 地图控制面板 -->
    <div class="map-controls" v-if="props.showControls">
      <div class="control-group">
        <el-button 
          size="small" 
          @click="zoomIn"
          :disabled="!mapInstance"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
        <el-button 
          size="small" 
          @click="zoomOut"
          :disabled="!mapInstance"
        >
          <el-icon><Minus /></el-icon>
        </el-button>
        <el-button 
          size="small" 
          @click="resetView"
          :disabled="!mapInstance"
        >
          <el-icon><Aim /></el-icon>
        </el-button>
      </div>
      
      <div class="control-group" v-if="props.showTypeSwitch">
        <el-button-group>
          <el-button 
            size="small" 
            :type="mapType === 'normal' ? 'primary' : ''"
            @click="switchMapType('normal')"
          >
            标准
          </el-button>
          <el-button 
            size="small" 
            :type="mapType === 'satellite' ? 'primary' : ''"
            @click="switchMapType('satellite')"
          >
            卫星
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="map-loading">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>地图加载中...</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="map-error">
      <div class="error-content">
        <el-icon class="error-icon"><Warning /></el-icon>
        <p>地图加载失败</p>
        <el-button size="small" @click="initMap">重试</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { loadAMapSDK, createMap } from '@/utils/map'
import { ElMessage } from 'element-plus'

interface Props {
  // 地图配置
  center?: [number, number]
  zoom?: number
  apiKey?: string
  
  // 功能控制
  showControls?: boolean
  showTypeSwitch?: boolean
  interactive?: boolean
  
  // 数据
  provinces?: Array<{
    coordinates: [number, number]
    name: string
    color: string
  }>
  
  // 旅行数据
  travelPath?: {
    from: [number, number]
    to: [number, number]
    color?: string
  }
  
  // 当前位置
  currentPosition?: [number, number]
  
  // 已走过的路径
  traveledPath?: [number, number][]
  
  // 坐骑信息
  mountInfo?: {
    type: string
    icon: string
    color: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [116.397428, 39.90923] as [number, number], // 北京
  zoom: 5,
  apiKey: '', // 需要传入高德地图API Key
  showControls: true,
  showTypeSwitch: true,
  interactive: true,
  provinces: () => [],
  travelPath: undefined,
  currentPosition: undefined,
  traveledPath: () => [],
  mountInfo: undefined
})

const emit = defineEmits<{
  'map-ready': [map: any]
  'map-click': [event: any]
  'marker-click': [marker: any]
  'position-update': [position: [number, number]]
}>()

// 响应式数据
const mapContainer = ref<HTMLElement>()
const mapInstance = ref<any>(null)
const loading = ref(false)
const error = ref(false)
const mapType = ref<'normal' | 'satellite'>('normal')

// 地图元素引用
const currentPositionMarker = ref<any>(null)
// const travelPathPolyline = ref<any>(null) // 不再使用
const traveledPathPolyline = ref<any>(null)
const provinceMarkers = ref<any[]>([])
const destinationMarker = ref<any>(null)

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return
  
  loading.value = true
  error.value = false
  
  try {
    // 加载SDK
    if (!window.AMap) {
      if (!props.apiKey) {
        throw new Error('请提供高德地图API Key')
      }
      await loadAMapSDK(props.apiKey)
    }
    
    // 创建地图实例
    const map = await createMap(mapContainer.value.id, props.center, props.zoom)
    mapInstance.value = map
    
    // 设置交互
    if (!props.interactive) {
      map.setStatus({
        dragEnable: false,
        zoomEnable: false,
        doubleClickZoom: false,
        keyboardEnable: false,
        scrollWheel: false,
        touchZoom: false
      })
    }
    
    // 添加省份标记
    addProvinceMarkers(map)
    
    // 添加旅行路径（移除，只显示已走过的路径）
    // if (props.travelPath) {
    //   addTravelPath(map, props.travelPath)
    // }
    
    // 添加当前位置标记
    if (props.currentPosition) {
      addCurrentPositionMarker(map, props.currentPosition)
    }
    
    // 添加已走过的路径
    if (props.traveledPath && props.traveledPath.length > 0) {
      addTraveledPath(map, props.traveledPath)
    }
    
    // 地图点击事件
    map.on('click', (event: any) => {
      emit('map-click', event)
    })
    
    // 触发 ready 事件
    emit('map-ready', map)
    
    ElMessage.success('地图加载完成')
  } catch (err) {
    console.error('地图初始化失败:', err)
    error.value = true
    ElMessage.error('地图加载失败，请检查API Key')
  } finally {
    loading.value = false
  }
}

// 添加省份标记
const addProvinceMarkers = (map: any) => {
  // 清理之前的标记
  provinceMarkers.value.forEach(marker => marker.setMap(null))
  provinceMarkers.value = []
  
  if (props.provinces.length > 0) {
    props.provinces.forEach(province => {
      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(province.coordinates[0], province.coordinates[1]),
        title: province.name,
        offset: new window.AMap.Pixel(-13, -30)
      })
      
      const content = `
        <div style="
          background-color: ${province.color};
          color: white;
          width: 24px;
          height: 24px;
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
      
      marker.on('click', () => {
        emit('marker-click', { province, marker })
      })
      
      provinceMarkers.value.push(marker)
    })
  }
}

// 添加旅行路径（移除，只显示已走过的路径）
const addTravelPath = (_map: any, _travelPath: { from: [number, number], to: [number, number], color?: string }) => {
  // 不再显示起点到终点的路径
  // 只显示已走过的路径
}

// 添加当前位置标记
const addCurrentPositionMarker = (map: any, position: [number, number]) => {
  // 清理之前的标记
  if (currentPositionMarker.value) {
    currentPositionMarker.value.setMap(null)
  }
  
  const mountColor = props.mountInfo?.color || '#4CAF50'
  const mountIcon = props.mountInfo?.icon || '🐾'
  
  currentPositionMarker.value = new window.AMap.Marker({
    position: new window.AMap.LngLat(position[0], position[1]),
    title: '当前位置',
    offset: new window.AMap.Pixel(-20, -40),
    zIndex: 100
  })
  
  const content = `
    <div style="
      background-color: ${mountColor};
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    ">
      ${mountIcon}
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 3px 6px rgba(0,0,0,0.3); }
        50% { transform: scale(1.1); box-shadow: 0 5px 10px rgba(0,0,0,0.4); }
        100% { transform: scale(1); box-shadow: 0 3px 6px rgba(0,0,0,0.3); }
      }
    </style>
  `
  
  currentPositionMarker.value.setContent(content)
  currentPositionMarker.value.setMap(map)
}

// 添加已走过的路径（虚线）
const addTraveledPath = (map: any, pathPoints: [number, number][]) => {
  // 清理之前的路径
  if (traveledPathPolyline.value) {
    traveledPathPolyline.value.setMap(null)
  }
  
  if (pathPoints.length < 2) return
  
  const path = pathPoints.map(point => new window.AMap.LngLat(point[0], point[1]))
  
  traveledPathPolyline.value = new window.AMap.Polyline({
    path,
    strokeColor: '#2196F3', // 蓝色，类似跑步应用的轨迹
    strokeWeight: 4,
    strokeOpacity: 0.8,
    strokeStyle: 'dashed', // 虚线
    lineDash: [10, 5], // 虚线样式
    lineJoin: 'round',
    lineCap: 'round',
    zIndex: 50
  })
  
  traveledPathPolyline.value.setMap(map)
}

// 更新当前位置
const updateCurrentPosition = (position: [number, number]) => {
  if (!mapInstance.value || !currentPositionMarker.value) return
  
  // 更新标记位置
  currentPositionMarker.value.setPosition(new window.AMap.LngLat(position[0], position[1]))
  
  // 触发位置更新事件
  emit('position-update', position)
  
  // 平滑移动到新位置
  mapInstance.value.setCenter(position, true, 300)
}

// 添加路径点（用于记录走过的路径）
const addPathPoint = (_point: [number, number]) => {
  if (!mapInstance.value) return
  
  // 这里可以扩展为动态添加路径点
  // 目前由 traveledPath prop 控制
}

// 添加目的地标记
const addDestinationMarker = (position: [number, number], name: string) => {
  // 清理之前的目的地标记
  if (destinationMarker.value) {
    destinationMarker.value.setMap(null)
  }
  
  if (!mapInstance.value) return
  
  destinationMarker.value = new window.AMap.Marker({
    position: new window.AMap.LngLat(position[0], position[1]),
    title: name,
    offset: new window.AMap.Pixel(-13, -30)
  })
  
  const content = `
    <div style="
      background-color: #FF6B6B;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    ">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `
  
  destinationMarker.value.setContent(content)
  destinationMarker.value.setMap(mapInstance.value)
}

// 清除目的地标记
const clearDestinationMarker = () => {
  if (destinationMarker.value) {
    destinationMarker.value.setMap(null)
    destinationMarker.value = null
  }
}

// 地图控制方法
const zoomIn = () => {
  if (mapInstance.value) {
    const zoom = mapInstance.value.getZoom()
    mapInstance.value.setZoom(zoom + 1)
  }
}

const zoomOut = () => {
  if (mapInstance.value) {
    const zoom = mapInstance.value.getZoom()
    mapInstance.value.setZoom(zoom - 1)
  }
}

const resetView = () => {
  if (mapInstance.value) {
    mapInstance.value.setZoom(props.zoom)
    mapInstance.value.setCenter(props.center)
  }
}

const switchMapType = (type: 'normal' | 'satellite') => {
  if (!mapInstance.value) return
  
  mapType.value = type
  const style = type === 'satellite' ? 'amap://styles/satellite' : 'amap://styles/light'
  mapInstance.value.setMapStyle(style)
}

// 公开方法
defineExpose({
  getMap: () => mapInstance.value,
  flyTo: (to: [number, number], zoom?: number) => {
    if (mapInstance.value) {
      mapInstance.value.setZoomAndCenter(zoom || 8, to, true, 1)
    }
  },
  updateCurrentPosition,
  addPathPoint,
  addDestinationMarker,
  clearDestinationMarker,
  addMarker: (position: [number, number], options?: any) => {
    if (!mapInstance.value) return null
    
    const marker = new window.AMap.Marker({
      position: new window.AMap.LngLat(position[0], position[1]),
      ...options
    })
    
    marker.setMap(mapInstance.value)
    return marker
  },
  clearMarkers: () => {
    // 实际实现需要保存所有marker引用
  }
})

// 监听属性变化
watch(() => props.center, (newCenter) => {
  if (mapInstance.value && newCenter) {
    mapInstance.value.setCenter(newCenter)
  }
})

watch(() => props.zoom, (newZoom) => {
  if (mapInstance.value && newZoom) {
    mapInstance.value.setZoom(newZoom)
  }
})

watch(() => props.currentPosition, (newPosition) => {
  if (newPosition && mapInstance.value) {
    if (currentPositionMarker.value) {
      updateCurrentPosition(newPosition)
    } else {
      addCurrentPositionMarker(mapInstance.value, newPosition)
    }
  }
})

watch(() => props.traveledPath, (newPath) => {
  if (newPath && newPath.length > 0 && mapInstance.value) {
    addTraveledPath(mapInstance.value, newPath)
  }
})

watch(() => props.travelPath, (newPath) => {
  if (newPath && mapInstance.value) {
    addTravelPath(mapInstance.value, newPath)
  }
})

watch(() => props.provinces, () => {
  if (mapInstance.value) {
    addProvinceMarkers(mapInstance.value)
  }
})

// 生命周期
onMounted(() => {
  // 确保DOM渲染完成
  nextTick(() => {
    if (mapContainer.value) {
      // 生成唯一ID
      mapContainer.value.id = `amap-${Date.now()}`
      initMap()
    }
  })
})

onUnmounted(() => {
  // 清理地图实例
  if (mapInstance.value) {
    mapInstance.value.destroy()
    mapInstance.value = null
  }
})
</script>

<style scoped>
.amap-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: white;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.map-loading,
.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-content,
.error-content {
  text-align: center;
}

.loading-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

.error-icon {
  font-size: 3rem;
  color: #f56c6c;
  margin-bottom: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 768px) {
  .map-controls {
    top: 10px;
    right: 10px;
  }
  
  .control-group {
    padding: 6px;
  }
}
</style>