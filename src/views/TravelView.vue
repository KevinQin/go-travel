<template>
  <div class="travel-view">
    <!-- 顶部状态栏 -->
    <div class="status-bar">
      <div class="container">
        <div class="status-content">
          <div class="user-status">
            <div class="province-badge" :style="{ backgroundColor: userStore.selectedProvince?.color }">
              {{ userStore.selectedProvince?.name || '未选择' }}
            </div>
            <div class="mount-info">
              <span class="mount-label">坐骑：</span>
              <span class="mount-name">{{ userStore.selectedProvince?.icon || '🐾' }} {{ userStore.selectedProvince?.mount || '无' }}</span>
            </div>
          </div>
          
          <div class="travel-stats">
            <div class="stat">
              <span class="stat-label">速度：</span>
              <span class="stat-value">{{ userStore.travelStatus.speed }} km/h</span>
            </div>
            <div class="stat">
              <span class="stat-label">模式：</span>
              <span class="stat-value">{{ getTransportLabel(userStore.travelStatus.transport) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">里程：</span>
              <span class="stat-value">{{ userStore.userData.totalDistance.toLocaleString() }} km</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <el-button 
              v-if="!userStore.travelStatus.isTraveling" 
              type="primary" 
              @click="startNewTravel"
              :disabled="!userStore.selectedProvince"
            >
              <el-icon><Promotion /></el-icon>
              开始漫游
            </el-button>
            <el-button 
              v-else 
              type="warning" 
              @click="skipCurrentTravel"
            >
              <el-icon><CircleClose /></el-icon>
              跳过当前
            </el-button>
            <el-button @click="$router.push('/rankings')">
              <el-icon><Trophy /></el-icon>
              排行榜
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 旅行进度条 -->
    <div v-if="userStore.travelStatus.isTraveling" class="travel-progress-bar">
      <div class="container">
        <div class="progress-content">
          <div class="progress-info">
            <div class="from-to">
              <span class="location">{{ userStore.currentLocation?.name || '未知' }}</span>
              <el-icon><Right /></el-icon>
              <span class="location">{{ userStore.destination?.name || '未知' }}</span>
            </div>
            <div class="progress-stats">
              <span class="stat">距离：{{ userStore.travelStatus.distance.toLocaleString() }} km</span>
              <span class="stat">时间：{{ formatTime(userStore.travelStatus.time) }}</span>
              <span class="stat">进度：{{ userStore.travelStatus.progress.toFixed(1) }}%</span>
            </div>
          </div>
          <div class="progress-bar-container">
            <el-progress 
              :percentage="userStore.travelStatus.progress" 
              :stroke-width="12"
              :color="userStore.selectedProvince?.color || '#4CAF50'"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="map-container">
      <!-- 高德地图组件 -->
      <AMap
        v-if="isMapReady && !mapFallbackMode"
        ref="mapComponent"
        :api-key="amapApiKey"
        :center="mapCenter"
        :zoom="mapZoom"
        :provinces="mapProvinces"
        :travel-path="currentTravelPath"
        :current-position="currentPosition"
        :traveled-path="traveledPath"
        :mount-info="mountInfo"
        :show-controls="true"
        :show-type-switch="true"
        @map-ready="handleMapReady"
        @map-click="handleMapClick"
        @marker-click="handleMarkerClick"
        @position-update="handlePositionUpdate"
        @map-fallback="handleMapFallback"
      />
      
      <!-- 模拟地图（降级方案） -->
      <SimpleMockMap
        v-else-if="isMapReady && mapFallbackMode"
        :center="mapCenter"
        :zoom="mapZoom"
        :provinces="mapProvinces"
        :current-position="currentPosition"
        :traveled-path="traveledPath"
        :mount-info="mountInfo"
        @map-ready="handleMockMapReady"
      />
      
      <!-- 地图加载状态 -->
      <div v-else class="map-placeholder">
        <div class="placeholder-content">
          <el-icon class="placeholder-icon"><MapLocation /></el-icon>
          <h3>地图加载中...</h3>
          <p v-if="mapFallbackMode">使用模拟地图模式</p>
          <div class="loading-actions">
            <el-button type="primary" @click="forceRetryMap">重试加载</el-button>
            <el-button @click="useMockMap">使用模拟地图</el-button>
          </div>
        </div>
      </div>
              重试加载
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 地图覆盖层信息 -->
      <div v-if="isMapReady && userStore.currentLocation" class="map-overlay">
        <div class="overlay-content">
          <!-- 当前位置 -->
          <div class="location-info">
            <h4>当前位置</h4>
            <p v-if="detailedLocation">{{ detailedLocation }}</p>
            <p v-else>{{ userStore.currentLocation.name }}, {{ userStore.currentLocation.country }}</p>
            <div class="coordinates">
              {{ formatCoordinates(userStore.currentLocation.coordinates) }}
            </div>
            <div v-if="fullAddress" class="detailed-address">
              <small>{{ fullAddress }}</small>
            </div>
          </div>
          
          <!-- 目的地 -->
          <div v-if="userStore.destination" class="destination-info">
            <h4>目的地</h4>
            <p>{{ userStore.destination.name }}, {{ userStore.destination.country }}</p>
            <div class="distance">
              距离：{{ userStore.travelStatus.distance.toLocaleString() }} km
            </div>
            <div class="eta">
              预计到达：{{ formatETA() }}
            </div>
          </div>
          
          <!-- 当前道路 -->
          <div v-if="currentRoad" class="road-info">
            <h4>当前道路</h4>
            <p>{{ currentRoad }}</p>
            <div v-if="currentSegment" class="segment-info">
              <small>路段 {{ currentSegment.index + 1 }}/{{ currentSegment.total }}</small>
            </div>
          </div>
          
          <!-- 沿途讲解点 -->
          <div v-if="userStore.routePoints.length > 0" class="route-points">
            <h4>沿途讲解点</h4>
            <div class="points-list">
              <div 
                v-for="(point, index) in userStore.routePoints.slice(0, 3)" 
                :key="index"
                class="point-item"
                :class="{ 'current': index === userStore.currentRoutePoint }"
              >
                <div class="point-marker" :style="{ backgroundColor: userStore.selectedProvince?.color }">
                  {{ index + 1 }}
                </div>
                <div class="point-info">
                  <div class="point-name">{{ point.name }}</div>
                  <div class="point-distance">{{ point.distanceFromStart.toFixed(0) }} km</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 讲解点弹窗 -->
      <div v-if="showRoutePointDialog" class="route-point-dialog">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>沿途讲解</h3>
            <el-button type="text" @click="showRoutePointDialog = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="dialog-body">
            <div class="point-description">
              {{ currentRoutePointDescription }}
            </div>
            <div class="point-actions">
              <el-button type="primary" @click="showRoutePointDialog = false">
                继续旅行
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="container">
        <div class="panel-content">
          <div class="travel-controls">
            <div class="control-section">
              <h4>旅行控制</h4>
              <div class="control-buttons">
                <el-button 
                  v-if="!userStore.travelStatus.isTraveling" 
                  type="primary" 
                  @click="startNewTravel"
                  :disabled="!userStore.selectedProvince"
                >
                  <el-icon><Promotion /></el-icon>
                  开始漫游
                </el-button>
                <el-button 
                  v-else 
                  type="warning" 
                  @click="skipCurrentTravel"
                >
                  <el-icon><CircleClose /></el-icon>
                  跳过当前
                </el-button>
                <el-button 
                  @click="toggleTravelMode"
                  :type="travelMode === 'random' ? 'primary' : ''"
                >
                  <el-icon><Refresh /></el-icon>
                  {{ travelMode === 'random' ? '随机模式' : '指定模式' }}
                </el-button>
              </div>
            </div>
            
            <div v-if="travelMode === 'specific'" class="destination-select">
              <h4>指定目的地</h4>
              <div class="select-controls">
                <el-select v-model="selectedCountry" placeholder="选择国家" style="width: 200px">
                  <el-option
                    v-for="country in allCountries"
                    :key="country"
                    :label="country"
                    :value="country"
                  />
                </el-select>
                <el-button 
                  type="primary" 
                  :disabled="!selectedCountry" 
                  @click="travelToCountry"
                >
                  前往此国家
                </el-button>
              </div>
            </div>
          </div>
          
          <div class="recent-travels">
            <h4>最近访问</h4>
            <div class="recent-list">
              <div 
                v-for="location in recentLocations" 
                :key="location.id"
                class="recent-item"
                @click="viewLocation(location)"
              >
                <div class="location-info">
                  <div class="location-name">{{ location.name }}</div>
                  <div class="location-country">{{ location.country }}</div>
                  <div class="location-distance">{{ getDistanceFromCurrent(location) }} km</div>
                </div>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 目的地详情弹窗 -->
    <el-dialog
      v-model="showLocationDialog"
      :title="selectedLocation?.name"
      width="500px"
    >
      <div v-if="selectedLocation" class="location-detail">
        <div class="location-header">
          <div class="location-title">
            <h3>{{ selectedLocation.name }}</h3>
            <p class="location-country">{{ selectedLocation.country }}</p>
          </div>
          <div class="location-category">
            <el-tag :type="getCategoryTagType(selectedLocation.category)">
              {{ getCategoryLabel(selectedLocation.category) }}
            </el-tag>
          </div>
        </div>
        
        <div class="location-description">
          <p>{{ selectedLocation.description }}</p>
        </div>
        
        <div class="location-coordinates">
          坐标：{{ formatCoordinates(selectedLocation.coordinates) }}
        </div>
        
        <div class="location-actions">
          <el-button type="primary" @click="shareLocation">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
          <el-button @click="travelToLocation(selectedLocation)">
            <el-icon><Promotion /></el-icon>
            前往此地
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getAllCountries, locations } from '@/data/locations'
import { provinces } from '@/data/provinces'
import { formatLocation, getFullAddress } from '@/utils/locationService'
import { calculateDistance } from '@/utils/map'
import AMap from '@/components/map/AMap.vue'
import SimpleMockMap from '@/components/map/SimpleMockMap.vue'
import { ElMessage, ElNotification } from 'element-plus'
import type { Location } from '@/types'

const userStore = useUserStore()

// 状态
const isMapReady = ref(false)
const travelMode = ref<'random' | 'specific'>('random')
const selectedCountry = ref('')
const showLocationDialog = ref(false)
const selectedLocation = ref<Location | null>(null)
const showRoutePointDialog = ref(false)
const currentRoutePointDescription = ref('')

// 地图相关
const amapApiKey = ref(import.meta.env.VITE_AMAP_API_KEY || '')
const mapComponent = ref<InstanceType<typeof AMap> | null>(null)
const mapCenter = computed<[number, number]>(() => {
  // 如果有选择的省份，使用省份坐标
  if (userStore.selectedProvince) {
    return userStore.selectedProvince.coordinates
  }
  // 否则使用默认位置（北京）
  return [116.397428, 39.90923]
})
const mapZoom = ref(12) // 增加默认缩放级别，显示更大的地图区域
const currentTravelPath = ref<{
  from: [number, number]
  to: [number, number]
  color?: string
}>()
const mapFallbackMode = ref(false) // 地图降级模式

// 道路信息
const currentRoad = ref('')
const currentSegment = ref<{ index: number, total: number } | null>(null)

// 计算属性
const allCountries = computed(() => getAllCountries())

const recentLocations = computed(() => {
  return userStore.userData.visitedLocations.slice(-5).reverse()
})

const mapProvinces = computed(() => {
  return provinces.map(p => ({
    coordinates: p.coordinates,
    name: p.name,
    color: p.color
  }))
})

const currentPosition = computed(() => {
  // 优先使用模拟中的位置
  if (userStore.currentSimulatedPosition) {
    return userStore.currentSimulatedPosition
  }
  
  // 如果没有模拟位置，使用当前位置
  if (userStore.currentLocation) {
    return userStore.currentLocation.coordinates
  }
  
  return undefined
})

const traveledPath = computed(() => {
  return userStore.traveledPath
})

const detailedLocation = computed(() => {
  if (!currentPosition.value) return null
  return formatLocation(currentPosition.value)
})

const fullAddress = computed(() => {
  if (!currentPosition.value) return null
  return getFullAddress(currentPosition.value)
})

const mountInfo = computed(() => {
  if (!userStore.selectedProvince) return undefined
  
  return {
    type: userStore.selectedProvince.mount,
    icon: userStore.selectedProvince.icon,
    color: userStore.selectedProvince.color
  }
})

// 方法
const initMap = () => {
  // 直接从环境变量获取API Key
  let apiKey = import.meta.env.VITE_AMAP_API_KEY
  
  // 如果环境变量中的Key无效，使用备用测试Key
  if (!apiKey || apiKey === 'your_amap_api_key_here') {
    console.warn('⚠️ 环境变量API Key未配置或为默认值')
    
    // 尝试使用备用测试Key（仅用于测试）
    // 注意：生产环境应该使用自己的API Key
    const testKeys = [
      'ba512535f4f46cbcec76a1398f9ec400', // 当前Key（可能权限不对）
      'e4d6c3b9a8f7e5d4c3b2a1f0e9d8c7b6', // 示例格式
      'test_key_for_development_only'     // 开发测试
    ]
    
    // 这里可以添加逻辑测试多个Key
    // 暂时使用第一个Key，但显示警告
    apiKey = testKeys[0]
    console.warn('📱 使用备用API Key进行测试:', apiKey.substring(0, 8) + '...')
    ElMessage.warning('使用测试API Key，地图功能可能受限')
  }
  
  if (!apiKey) {
    console.error('❌ 无法获取有效的API Key')
    ElMessage.error('地图API Key配置错误')
    // 不设置isMapReady，让地图组件显示错误
    return
  }
  
  amapApiKey.value = apiKey
  console.log('✅ 使用API Key:', apiKey.substring(0, 8) + '...')
  isMapReady.value = true
}

const handleMapReady = (_map: any) => {
  console.log('地图加载完成')
  // 如果正在旅行，更新地图显示
  if (userStore.travelStatus.isTraveling && userStore.currentLocation && userStore.destination) {
    updateMapPath()
  }
}

const handleMapFallback = (event: any) => {
  console.warn('地图降级:', event)
  mapFallbackMode.value = true
  ElMessage.warning('地图服务暂时不可用，使用模拟模式')
}

const handleMockMapReady = () => {
  console.log('模拟地图加载完成')
  ElMessage.info('使用模拟地图模式')
}

const forceRetryMap = () => {
  console.log('强制重试地图加载')
  mapFallbackMode.value = false
  initMap()
}

const useMockMap = () => {
  console.log('切换到模拟地图')
  mapFallbackMode.value = true
  isMapReady.value = true
  ElMessage.info('已切换到模拟地图模式')
}

const handleMapClick = (event: any) => {
  console.log('地图点击:', event)
}

const handleMarkerClick = (data: any) => {
  console.log('标记点击:', data)
}

const handlePositionUpdate = (position: [number, number]) => {
  console.log('位置更新:', position)
  // 这里可以添加额外的位置更新逻辑
}

const startNewTravel = async () => {
  if (!userStore.selectedProvince) {
    ElMessage.warning('请先选择省份')
    return
  }

  try {
    await userStore.startNewTravel()
    ElMessage.success('开始新的漫游旅程！')
    
    // 更新地图路径
    updateMapPath()
  } catch (error) {
    console.error('开始旅行失败:', error)
    ElMessage.error('开始旅行失败，请重试')
  }
}

const skipCurrentTravel = () => {
  if (!userStore.travelStatus.isTraveling) return
  
  userStore.skipToDestination()
  ElMessage.info('已跳过当前旅行')
}

const travelToCountry = () => {
  if (!selectedCountry.value) {
    ElMessage.warning('请选择国家')
    return
  }

  const countryLocations = locations.filter(loc => loc.country === selectedCountry.value)
  if (countryLocations.length === 0) {
    ElMessage.warning('该国家暂无地点数据')
    return
  }

  const randomLocation = countryLocations[Math.floor(Math.random() * countryLocations.length)]
  travelToSpecificLocation(randomLocation)
}

const travelToSpecificLocation = (location: Location) => {
  if (!userStore.selectedProvince) {
    ElMessage.warning('请先选择省份')
    return
  }

  // TODO: 实现指定目的地的旅行
  ElMessage.info('指定目的地功能开发中')
  
  // 临时：显示详情
  selectedLocation.value = location
  showLocationDialog.value = true
}

const travelToLocation = (location: Location) => {
  travelToSpecificLocation(location)
  showLocationDialog.value = false
}

const updateMapPath = () => {
  if (!userStore.currentLocation || !userStore.destination) return
  
  currentTravelPath.value = {
    from: userStore.currentLocation.coordinates,
    to: userStore.destination.coordinates,
    color: userStore.selectedProvince?.color
  }
  
  // 添加目的地标记
  if (mapComponent.value) {
    mapComponent.value.addDestinationMarker(
      userStore.destination.coordinates,
      userStore.destination.name
    )
  }
}

const viewLocation = (location: Location) => {
  selectedLocation.value = location
  showLocationDialog.value = true
}

const shareLocation = () => {
  if (!selectedLocation.value) return
  
  const text = `我在GoTravel上发现了 ${selectedLocation.value.name}（${selectedLocation.value.country}）！`
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('分享文案已复制到剪贴板')
  })
}

const getCategoryTagType = (category: string) => {
  switch (category) {
    case 'city': return 'primary'
    case 'landmark': return 'success'
    case 'nature': return 'warning'
    default: return 'info'
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'city': return '城市'
    case 'landmark': return '地标'
    case 'nature': return '自然'
    default: return category
  }
}

const getTransportLabel = (transport: string) => {
  switch (transport) {
    case 'walking': return '步行'
    case 'riding': return '骑行'
    case 'flying': return '飞行'
    case 'driving': return '驾驶'
    default: return transport
  }
}

const formatTime = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)}分钟`
  } else if (hours < 24) {
    return `${hours.toFixed(1)}小时`
  } else {
    return `${(hours / 24).toFixed(1)}天`
  }
}

const formatCoordinates = (coords: [number, number]): string => {
  const [lng, lat] = coords
  const lngStr = lng >= 0 ? `${lng.toFixed(4)}°E` : `${Math.abs(lng).toFixed(4)}°W`
  const latStr = lat >= 0 ? `${lat.toFixed(4)}°N` : `${Math.abs(lat).toFixed(4)}°S`
  return `${latStr}, ${lngStr}`
}

const formatETA = (): string => {
  if (!userStore.travelStatus.isTraveling) return '--'
  
  const remainingHours = userStore.travelStatus.time * (1 - userStore.travelStatus.progress / 100)
  return formatTime(remainingHours)
}

const getDistanceFromCurrent = (location: Location): number => {
  if (!userStore.currentLocation) return 0
  return Math.round(calculateDistance(userStore.currentLocation.coordinates, location.coordinates))
}

const toggleTravelMode = () => {
  travelMode.value = travelMode.value === 'random' ? 'specific' : 'random'
}

// 监听当前位置变化，更新地图中心
watch(currentPosition, (newPosition) => {
  if (newPosition && mapComponent.value) {
    // 调用地图的 flyTo 方法平滑移动
    mapComponent.value.flyTo(newPosition, 15)
  }
})

watch(() => userStore.routePoints, (points) => {
  if (points.length > 0) {
    // 显示第一个讲解点
    showRoutePointInfo(points[0].description)
  }
})

const showRoutePointInfo = (description: string) => {
  currentRoutePointDescription.value = description
  showRoutePointDialog.value = true
  
  // 显示通知
  ElNotification({
    title: '沿途讲解',
    message: description,
    type: 'info',
    duration: 5000,
    position: 'bottom-right'
  })
}

// 初始化
onMounted(() => {
  if (!userStore.selectedProvince) {
    ElMessage.warning('请先选择省份')
    setTimeout(() => {
      window.location.href = '/select'
    }, 1500)
    return
  }
  
  // 初始化地图
  initMap()
  
  // 如果用户已选择省份但不在旅行中，自动开始新旅行
  if (userStore.selectedProvince && !userStore.travelStatus.isTraveling) {
    setTimeout(() => {
      startNewTravel()
    }, 2000)
  }
})
</script>

<style scoped>
.travel-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 状态栏 */
.status-bar {
  background: white;
  box-shadow: var(--card-shadow);
  padding: 16px 0;
  position: sticky;
  top: 64px; /* App header height */
  z-index: 900;
}

.status-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.province-badge {
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  min-width: 60px;
  text-align: center;
}

.mount-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.mount-label {
  color: var(--text-secondary);
}

.mount-name {
  font-weight: 500;
  color: var(--text-primary);
}

.travel-stats {
  display: flex;
  gap: 24px;
}

.stat {
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-bottom: 2px;
}

.stat-value {
  font-weight: 500;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 旅行进度条 */
.travel-progress-bar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 0;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.from-to {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.location {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.progress-stats {
  display: flex;
  gap: 16px;
  font-size: 0.875rem;
  opacity: 0.9;
}

.progress-bar-container {
  flex: 1;
}

/* 地图区域 */
.map-container {
  flex: 1;
  background: #f0f2f5;
  position: relative;
  min-height: 70vh; /* 改为视口高度的70%，提供更大的地图区域 */
  height: calc(100vh - 200px); /* 动态计算高度，减去顶部状态栏和底部控制面板 */
}

.amap-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.map-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  z-index: 1;
}

.placeholder-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  max-width: 400px;
}

.placeholder-icon {
  font-size: 4rem;
  color: var(--primary-color);
  margin-bottom: 16px;
}

.loading-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
}

.map-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  max-width: 300px;
}

.overlay-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.location-info,
.destination-info,
.route-points {
  margin-bottom: 0;
}

.location-info h4,
.destination-info h4,
.route-points h4 {
  margin: 0 0 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.location-info p,
.destination-info p {
  margin: 0;
  font-weight: 500;
  color: var(--text-primary);
}

.coordinates,
.distance,
.eta {
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.eta {
  color: var(--primary-color);
  font-weight: 500;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: #f9f9f9;
  transition: background-color 0.2s;
}

.point-item.current {
  background: #e3f2fd;
  border-left: 3px solid var(--primary-color);
}

.point-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
}

.point-info {
  flex: 1;
}

.point-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.point-distance {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* 讲解点弹窗 */
.route-point-dialog {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: 90%;
  max-width: 400px;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.dialog-body {
  padding: 24px;
}

.point-description {
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.point-actions {
  display: flex;
  justify-content: center;
}

/* 控制面板 */
.control-panel {
  background: white;
  border-top: 1px solid var(--border-color);
  padding: 24px 0;
}

.panel-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.travel-controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.control-section h4,
.destination-select h4 {
  margin: 0 0 16px;
  color: var(--text-primary);
}

.control-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.destination-select {
  margin-top: 8px;
}

.select-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.recent-travels h4 {
  margin: 0 0 16px;
  color: var(--text-primary);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recent-item:hover {
  background: #f0f0f0;
}

.recent-item .location-info {
  flex: 1;
}

.recent-item .location-name {
  font-weight: 500;
  color: var(--text-primary);
}

.recent-item .location-country {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.recent-item .location-distance {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* 详情弹窗 */
.location-detail {
  padding: 8px 0;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.location-title h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.location-country {
  margin: 4px 0 0;
  color: var(--text-secondary);
}

.location-description {
  margin: 24px 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.location-coordinates {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 24px;
  font-family: monospace;
}

.location-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .status-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .travel-stats {
    justify-content: space-between;
  }
  
  .progress-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .progress-stats {
    justify-content: space-between;
  }
  
  .panel-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .map-overlay {
    position: relative;
    top: auto;
    left: auto;
    max-width: none;
    margin: 20px;
  }
  
  .route-point-dialog {
    width: 95%;
  }
}
</style>