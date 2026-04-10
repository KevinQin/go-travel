<template>
  <div class="rankings-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>省份排行榜</h1>
        <p class="page-subtitle">为你的家乡争取荣誉，竞争全球漫游霸主！</p>
      </div>

      <!-- 用户省份状态 -->
      <div class="user-province-status" v-if="userStore.selectedProvince">
        <div class="status-card">
          <div class="status-header">
            <div class="province-info">
              <div class="province-icon" :style="{ backgroundColor: userStore.selectedProvince.color }">
                {{ userStore.selectedProvince.name.charAt(0) }}
              </div>
              <div>
                <h3>我的省份：{{ userStore.selectedProvince.name }}</h3>
                <p class="mount-info">坐骑：{{ userStore.selectedProvince.icon }}</p>
              </div>
            </div>
            <div class="rank-badge" :class="getRankClass(userRank)">
              第 {{ userRank }} 名
            </div>
          </div>
          
          <div class="status-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userStore.visitedCount }}</div>
              <div class="stat-label">访问地点</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStore.userData.totalDistance.toLocaleString() }}</div>
              <div class="stat-label">总里程(km)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStore.visitedCountries.length }}</div>
              <div class="stat-label">访问国家</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ provinceRanking?.participants || 0 }}</div>
              <div class="stat-label">本省参与者</div>
            </div>
          </div>
          
          <div class="status-actions">
            <el-button type="primary" @click="$router.push('/travel')">
              <el-icon><Promotion /></el-icon>
              继续漫游
            </el-button>
            <el-button @click="shareRanking">
              <el-icon><Share /></el-icon>
              分享排名
            </el-button>
          </div>
        </div>
      </div>

      <!-- 排行榜切换 -->
      <div class="ranking-tabs">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="参与人数榜" name="participants">
            <ranking-table 
              :data="sortedRankings"
              :sort-by="'participants'"
              :user-province-id="userStore.selectedProvince?.id"
            />
          </el-tab-pane>
          <el-tab-pane label="总里程榜" name="distance">
            <ranking-table 
              :data="sortedRankings"
              :sort-by="'distance'"
              :user-province-id="userStore.selectedProvince?.id"
            />
          </el-tab-pane>
          <el-tab-pane label="访问国家榜" name="countries">
            <ranking-table 
              :data="sortedRankings"
              :sort-by="'countries'"
              :user-province-id="userStore.selectedProvince?.id"
            />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 排行榜说明 -->
      <div class="ranking-info">
        <el-alert
          title="排行榜规则"
          type="info"
          :closable="false"
          show-icon
        >
          <ul class="info-list">
            <li><strong>参与人数榜：</strong>按每个省份的参与者数量排名</li>
            <li><strong>总里程榜：</strong>按每个省份所有参与者的总里程排名</li>
            <li><strong>访问国家榜：</strong>按每个省份参与者访问的不同国家数量排名</li>
            <li>数据每5分钟更新一次</li>
            <li>排行榜仅统计已选择省份的用户数据</li>
          </ul>
        </el-alert>
      </div>

      <!-- 省份分布地图（模拟） -->
      <div class="distribution-map">
        <h3>省份参与分布</h3>
        <div class="map-simulation">
          <div class="map-grid">
            <div 
              v-for="ranking in topProvinces" 
              :key="ranking.provinceId"
              class="map-province"
              :style="{
                backgroundColor: getProvinceColor(ranking.provinceId),
                opacity: getProvinceOpacity(ranking)
              }"
              :title="`${ranking.provinceName}: ${ranking.participants}人参与`"
            >
              <span class="province-abbr">{{ getProvinceAbbr(ranking.provinceName) }}</span>
            </div>
          </div>
          <div class="map-legend">
            <div class="legend-item">
              <div class="legend-color" style="background-color: #4CAF50; opacity: 0.2"></div>
              <span>低参与度</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #4CAF50; opacity: 0.5"></div>
              <span>中参与度</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background-color: #4CAF50; opacity: 0.8"></div>
              <span>高参与度</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 激励提示 -->
      <div class="motivation-section" v-if="userStore.selectedProvince">
        <div class="motivation-card" :style="{ borderColor: userStore.selectedProvince.color }">
          <div class="motivation-content">
            <h3>为 {{ userStore.selectedProvince.name }} 加油！</h3>
            <p>你距离前一名还差 {{ getDistanceToNextRank() }} {{ getRankUnit() }}，继续漫游提升排名！</p>
            <el-button 
              type="primary" 
              :style="{ backgroundColor: userStore.selectedProvince.color }"
              @click="$router.push('/travel')"
            >
              <el-icon><Promotion /></el-icon>
              立即漫游
            </el-button>
          </div>
          <div class="motivation-icon">
            <el-icon><Trophy /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRankingStore } from '@/stores/ranking'
import RankingTable from '@/components/RankingTable.vue'
import { provinces } from '@/data/provinces'
import { ElMessage } from 'element-plus'
import type { RankingItem } from '@/types'

const userStore = useUserStore()
const rankingStore = useRankingStore()

const activeTab = ref<'participants' | 'distance' | 'countries'>('participants')

// 计算属性
const sortedRankings = computed(() => {
  rankingStore.setSortBy(activeTab.value)
  return rankingStore.sortedRankings
})

const userRank = computed(() => {
  if (!userStore.selectedProvince) return 0
  return rankingStore.getUserProvinceRank(userStore.selectedProvince.id)
})

const provinceRanking = computed(() => {
  if (!userStore.selectedProvince) return null
  return rankingStore.rankings.find(r => r.provinceId === userStore.selectedProvince?.id)
})

const topProvinces = computed(() => {
  return sortedRankings.value.slice(0, 12)
})

// 方法
const handleTabChange = (tab: any) => {
  activeTab.value = tab
}

const getRankClass = (rank: number) => {
  if (rank <= 3) return 'rank-gold'
  if (rank <= 10) return 'rank-silver'
  return 'rank-bronze'
}

const getProvinceColor = (provinceId: number) => {
  const province = provinces.find(p => p.id === provinceId)
  return province?.color || '#4CAF50'
}

const getProvinceOpacity = (ranking: RankingItem) => {
  const maxParticipants = Math.max(...rankingStore.rankings.map(r => r.participants))
  return 0.2 + (ranking.participants / maxParticipants) * 0.6
}

const getProvinceAbbr = (name: string) => {
  if (name.length <= 2) return name
  return name.substring(0, 2)
}

const getDistanceToNextRank = () => {
  if (!userStore.selectedProvince || userRank.value <= 1) return 0
  
  const currentIndex = sortedRankings.value.findIndex(r => r.provinceId === userStore.selectedProvince?.id)
  if (currentIndex <= 0) return 0
  
  const current = sortedRankings.value[currentIndex]
  const next = sortedRankings.value[currentIndex - 1]
  
  switch (activeTab.value) {
    case 'participants':
      return next.participants - current.participants
    case 'distance':
      return (next.totalDistance - current.totalDistance).toLocaleString()
    case 'countries':
      return next.visitedCountries - current.visitedCountries
    default:
      return 0
  }
}

const getRankUnit = () => {
  switch (activeTab.value) {
    case 'participants': return '人'
    case 'distance': return 'km'
    case 'countries': return '个国家'
    default: return ''
  }
}

const shareRanking = () => {
  if (!userStore.selectedProvince) return
  
  const text = `我在GoTravel上代表 ${userStore.selectedProvince.name} 排名第 ${userRank.value}！快来为家乡加油！`
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('分享文案已复制到剪贴板')
  })
}

// 初始化
onMounted(() => {
  if (!userStore.selectedProvince) {
    ElMessage.warning('请先选择省份查看排行榜')
    setTimeout(() => {
      window.location.href = '/select'
    }, 1500)
  }
})
</script>

<style scoped>
.rankings-view {
  padding: 40px 0 80px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
}

/* 用户省份状态 */
.user-province-status {
  margin-bottom: 40px;
}

.status-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.province-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.province-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.province-info h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.icon-info {
  margin: 4px 0 0;
  color: var(--text-secondary);
}

.rank-badge {
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.125rem;
  color: white;
}

.rank-gold {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.rank-silver {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
}

.rank-bronze {
  background: linear-gradient(135deg, #CD7F32, #A0522D);
}

.status-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.status-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 排行榜切换 */
.ranking-tabs {
  margin-bottom: 40px;
}

/* 排行榜说明 */
.ranking-info {
  margin-bottom: 40px;
}

.info-list {
  margin: 8px 0 0 20px;
  color: var(--text-secondary);
}

.info-list li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* 分布地图 */
.distribution-map {
  margin-bottom: 40px;
}

.distribution-map h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--text-primary);
}

.map-simulation {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.map-province {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.map-province:hover {
  transform: scale(1.05);
}

.province-abbr {
  font-weight: bold;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

/* 激励提示 */
.motivation-section {
  margin-top: 40px;
}

.motivation-card {
  background: white;
  border: 2px solid;
  border-radius: 12px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--card-shadow);
}

.motivation-content {
  flex: 1;
}

.motivation-content h3 {
  font-size: 1.5rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.motivation-content p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.motivation-icon {
  font-size: 4rem;
  color: var(--primary-color);
  opacity: 0.3;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .status-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .rank-badge {
    align-self: flex-start;
  }
  
  .status-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .map-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .motivation-card {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .motivation-icon {
    order: -1;
  }
}

@media (max-width: 480px) {
  .map-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .status-stats {
    grid-template-columns: 1fr;
  }
}
</style>