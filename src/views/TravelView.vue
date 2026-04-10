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
              <span class="mount-name">{{ userStore.selectedProvince?.icon || '无' }}</span>
            </div>
          </div>
          
          <div class="travel-stats">
            <div class="stat">
              <span class="stat-label">里程：</span>
              <span class="stat-value">{{ userStore.userData.totalDistance.toLocaleString() }} km</span>
            </div>
            <div class="stat">
              <span class="stat-label">地点：</span>
              <span class="stat-value">{{ userStore.visitedCount }} 个</span>
            </div>
            <div class="stat">
              <span class="stat-label">国家：</span>
              <span class="stat-value">{{ userStore.visitedCountries.length }} 个</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <el-button type="primary" @click="startRandomTravel" :loading="isTraveling">
              <el-icon><Promotion /></el-icon>
              开始漫游
            </el-button>
            <el-button @click="$router.push('/rankings')">
              <el-icon><Trophy /></el-icon>
              排行榜
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="map-container">
      <!-- 高德地图组件 -->
      <AMap
        v-if="isMapReady"
        :api-key="amapApiKey"
        :center="mapCenter"
        :zoom="mapZoom"
        :provinces="mapProvinces"
        :travel-path="currentTravelPath"
        :show-controls="true"
        :show-type-switch="true"
        @map-ready="handleMapReady"
        @map-click="handleMapClick"
        @marker-click="handleMarkerClick"
      />
      
      <!-- 地图加载状态 -->
      <div v-else class="map-placeholder">
        <div class="placeholder-content">
          <el-icon class="placeholder-icon"><MapLocation /></el-icon>
          <h3>地图加载中...</h3>
          <p>正在初始化高德地图</p>
          <div class="loading-actions">
            <el-button type="primary" @click="simulateTravel">
              模拟漫游（测试用）
            </el-button>
            <el-button @click="initMap">
              重试加载
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 地图覆盖层信息 -->
      <div v-if="isMapReady && (currentLocation || destination)" class="map-overlay">
        <div class="overlay-content">
          <div class="location-info" v-if="currentLocation">
            <h4>当前位置</h4>
            <p>{{ currentLocation.name }}, {{ currentLocation.country }}</p>
          </div>
          
          <div class="destination-info" v-if="destination">
            <h4>目的地</h4>
            <p>{{ destination.name }}, {{ destination.country }}</p>
            <div class="distance" v-if="travelDistance > 0">
              距离：{{ travelDistance.toLocaleString() }} km
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
            <el-button-group>
              <el-button @click="travelMode = 'random'" :type="travelMode === 'random' ? 'primary' : ''">
                随机漫游
              </el-button>
              <el-button @click="travelMode = 'specific'" :type="travelMode === 'specific' ? 'primary' : ''">
                指定目的地
              </el-button>
            </el-button-group>
            
            <div class="destination-select" v-if="travelMode === 'specific'">
              <el-select v-model="selectedCountry" placeholder="选择国家" style="width: 200px">
                <el-option
                  v-for="country in allCountries"
                  :key="country"
                  :label="country"
                  :value="country"
                />
              </el-select>
              <el-button type="primary" :disabled="!selectedCountry" @click="travelToCountry">
                前往此国家
              </el-button>
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
        
        <div class="location-actions">
          <el-button type="primary" @click="shareLocation">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
          <el-button @click="addToFavorites">
            <el-icon><Star /></el-icon>
            收藏
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRankingStore } from '@/stores/ranking'
import { getRandomLocation, getAllCountries, locations } from '@/data/locations'
import { provinces } from '@/data/provinces'
import AMap from '@/components/map/AMap.vue'
import { ElMessage } from 'element-plus'
import type { Location } from '@/types'

const userStore = useUserStore()
const rankingStore = useRankingStore()

// 状态
const isMapReady = ref(false)
const isTraveling = ref(false)
const showAnimation = ref(false)
const travelMode = ref<'random' | 'specific'>('random')
const selectedCountry = ref('')
const showLocationDialog = ref(false)
const selectedLocation = ref<Location | null>(null)

// 地图相关
const amapApiKey = ref(import.meta.env.VITE_AMAP_API_KEY || '') // 从环境变量获取
const mapInstance = ref<any>(null)
const mapCenter = ref<[number, number]>([116.397428, 39.90923]) // 北京
const mapZoom = ref(5)
const currentTravelPath = ref<{
  from: [number, number]
  to: [number, number]
  color?: string
}>()

// 旅行数据
const currentLocation = ref<Location | null>(null)
const destination = ref<Location | null>(null)
const travelDistance = ref(0)

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

// 方法
const initMap = () => {
  // 这里应该从环境变量获取API Key
  // amapApiKey.value = import.meta.env.VITE_AMAP_API_KEY
  
  if (!amapApiKey.value) {
    ElMessage.warning('高德地图API Key未配置，使用模拟模式')
    simulateTravel()
    return
  }
  
  isMapReady.value = true
}

const simulateTravel = () => {
  isMapReady.value = true
  ElMessage.info('地图模拟模式已启用')
}

const handleMapReady = (map: any) => {
  mapInstance.value = map
  ElMessage.success('地图加载完成')
}

const handleMapClick = (event: any) => {
  console.log('地图点击:', event)
}

const handleMarkerClick = (data: any) => {
  console.log('标记点击:', data)
}

const startRandomTravel = async () => {
  if (!userStore.selectedProvince) {
    ElMessage.warning('请先选择省份')
    return
  }

  isTraveling.value = true
  showAnimation.value = true

  // 随机选择目的地
  const newDestination = getRandomLocation()
  destination.value = newDestination
  
  // 计算距离
  if (currentLocation.value) {
    const from = currentLocation.value.coordinates
    const to = newDestination.coordinates
    travelDistance.value = Math.round(
      Math.sqrt(
        Math.pow(to[0] - from[0], 2) + 
        Math.pow(to[1] - from[1], 2)
      ) * 100
    ) * 100 // 简化计算
  } else {
    travelDistance.value = Math.floor(Math.random() * 5000) + 1000
  }

  // 更新旅行路径
  if (currentLocation.value && mapInstance.value) {
    currentTravelPath.value = {
      from: currentLocation.value.coordinates,
      to: newDestination.coordinates,
      color: userStore.selectedProvince.color
    }
    
    // 飞行动画
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // 完成旅行
  completeTravel(newDestination)
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
  destination.value = randomLocation
  travelDistance.value = Math.floor(Math.random() * 3000) + 500
  
  completeTravel(randomLocation)
}

const completeTravel = (location: Location) => {
  // 更新用户数据（现在由 store 自动处理）
  // userStore.addVisitedLocation(location)
  // userStore.addDistance(travelDistance.value)
  
  // 更新排行榜
  if (userStore.selectedProvince) {
    rankingStore.addDistance(userStore.selectedProvince.id, travelDistance.value)
    rankingStore.addVisitedCountry(userStore.selectedProvince.id)
  }

  // 重置状态
  isTraveling.value = false
  showAnimation.value = false
  currentLocation.value = location
  
  // 显示成功消息
  ElMessage.success(`成功到达 ${location.name}！累计里程增加 ${travelDistance.value}km`)
  
  // 自动打开详情
  selectedLocation.value = location
  showLocationDialog.value = true
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

const addToFavorites = () => {
  ElMessage.info('收藏功能开发中')
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

// 初始化
onMounted(() => {
  if (!userStore.selectedProvince) {
    ElMessage.warning('请先选择省份')
    setTimeout(() => {
      window.location.href = '/select'
    }, 1500)
  }
  
  // 设置初始位置（用户省份坐标）
  if (userStore.selectedProvince) {
    currentLocation.value = {
      id: 0,
      name: userStore.selectedProvince.name,
      country: '中国',
      countryCode: 'CN',
      coordinates: userStore.selectedProvince.coordinates,
      description: `你的起点：${userStore.selectedProvince.name}`,
      image: '',
      category: 'city'
    }
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
}

.icon-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.travel-stats {
  display: flex;
  gap: 24px;
}

.stat {
  font-size: 0.875rem;
}

.stat-label {
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 500;
  color: var(--text-primary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 地图区域 */
.map-container {
  flex: 1;
  background: #f0f2f5;
  position: relative;
  min-height: 500px;
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
}

.location-info,
.destination-info {
  margin-bottom: 16px;
}

.location-info:last-child,
.destination-info:last-child {
  margin-bottom: 0;
}

.location-info h4,
.destination-info h4 {
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

.distance {
  margin-top: 4px;
  font-size: 0.875rem;
  color: var(--primary-color);
  font-weight: 500;
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
  gap: 16px;
}

.destination-select {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
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

.location-info {
  flex: 1;
}

.location-name {
  font-weight: 500;
  color: var(--text-primary);
}

.location-country {
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
  
  .panel-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .map-simulation {
    padding: 20px;
  }
  
  .simulation-content {
    padding: 20px;
  }
}
</style>