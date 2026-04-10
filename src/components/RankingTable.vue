<template>
  <div class="ranking-table">
    <!-- 表格头部 -->
    <div class="table-header">
      <div class="header-row">
        <div class="header-cell rank-cell">排名</div>
        <div class="header-cell province-cell">省份</div>
        <div class="header-cell value-cell">{{ getColumnTitle }}</div>
        <div class="header-cell trend-cell">趋势</div>
      </div>
    </div>

    <!-- 表格内容 -->
    <div class="table-body">
      <div
        v-for="(item, index) in props.data"
        :key="item.provinceId"
        class="table-row"
        :class="{
          'user-province': item.provinceId === props.userProvinceId,
          'top-three': index < 3
        }"
      >
        <!-- 排名 -->
        <div class="table-cell rank-cell">
          <div class="rank-number" :class="getRankClass(index + 1)">
            {{ index + 1 }}
          </div>
        </div>

        <!-- 省份信息 -->
        <div class="table-cell province-cell">
          <div class="province-info">
            <div class="province-icon" :style="{ backgroundColor: getProvinceColor(item.provinceId) }">
              {{ getProvinceAbbr(item.provinceName) }}
            </div>
            <div class="province-details">
              <div class="province-name">{{ item.provinceName }}</div>
              <div class="province-mount">{{ getProvinceMount(item.provinceId) }}</div>
            </div>
          </div>
        </div>

        <!-- 数值 -->
        <div class="table-cell value-cell">
          <div class="value-display">
            <div class="value-number">{{ getValue(item) }}</div>
            <div class="value-unit">{{ getValueUnit }}</div>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{
                width: `${getProgressPercentage(item)}%`,
                backgroundColor: getProvinceColor(item.provinceId)
              }"
            ></div>
          </div>
        </div>

        <!-- 趋势 -->
        <div class="table-cell trend-cell">
          <div class="trend-indicator" :class="getTrendClass()">
            <el-icon v-if="getTrendIcon()">
              <component :is="getTrendIcon()" />
            </el-icon>
            <span class="trend-text">{{ getTrendText() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 表格脚注 -->
    <div class="table-footer" v-if="props.userProvinceId">
      <div class="footer-note">
        <el-icon><InfoFilled /></el-icon>
        <span>高亮行代表你的省份</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { provinces } from '@/data/provinces'
import type { RankingItem } from '@/types'

interface Props {
  data: RankingItem[]
  sortBy: 'participants' | 'distance' | 'countries'
  userProvinceId?: number
}

const props = defineProps<Props>()

// 计算属性
const getColumnTitle = computed(() => {
  switch (props.sortBy) {
    case 'participants': return '参与人数'
    case 'distance': return '总里程(km)'
    case 'countries': return '访问国家'
    default: return '数值'
  }
})

const getValueUnit = computed(() => {
  switch (props.sortBy) {
    case 'participants': return '人'
    case 'distance': return 'km'
    case 'countries': return '国'
    default: return ''
  }
})

// 方法
const getProvinceColor = (provinceId: number) => {
  const province = provinces.find(p => p.id === provinceId)
  return province?.color || '#4CAF50'
}

const getProvinceAbbr = (name: string) => {
  if (name.length <= 2) return name
  return name.substring(0, 2)
}

const getProvinceMount = (provinceId: number) => {
  const province = provinces.find(p => p.id === provinceId)
  return province?.mount || '坐骑'
}

const getValue = (item: RankingItem) => {
  switch (props.sortBy) {
    case 'participants': return item.participants.toLocaleString()
    case 'distance': return item.totalDistance.toLocaleString()
    case 'countries': return item.visitedCountries
    default: return 0
  }
}

const getProgressPercentage = (item: RankingItem) => {
  if (props.data.length === 0) return 0
  
  const maxValue = Math.max(...props.data.map(i => {
    switch (props.sortBy) {
      case 'participants': return i.participants
      case 'distance': return i.totalDistance
      case 'countries': return i.visitedCountries
      default: return 0
    }
  }))
  
  if (maxValue === 0) return 0
  
  const currentValue = item[props.sortBy]
  return (currentValue / maxValue) * 100
}

const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-first'
  if (rank === 2) return 'rank-second'
  if (rank === 3) return 'rank-third'
  return ''
}

const getTrendClass = () => {
  // 模拟趋势（实际应从历史数据计算）
  const random = Math.random()
  if (random > 0.6) return 'trend-up'
  if (random > 0.3) return 'trend-down'
  return 'trend-stable'
}

const getTrendIcon = () => {
  const trend = getTrendClass()
  switch (trend) {
    case 'trend-up': return 'Top'
    case 'trend-down': return 'Bottom'
    default: return null
  }
}

const getTrendText = () => {
  const trend = getTrendClass()
  switch (trend) {
    case 'trend-up': return '上升'
    case 'trend-down': return '下降'
    default: return '稳定'
  }
}
</script>

<style scoped>
.ranking-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
}

/* 表格头部 */
.table-header {
  background: #f9f9f9;
  border-bottom: 1px solid var(--border-color);
}

.header-row {
  display: grid;
  grid-template-columns: 80px 1fr 200px 100px;
  padding: 16px 24px;
}

.header-cell {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 表格内容 */
.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 200px 100px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.table-row.user-province {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 4px solid var(--primary-color);
}

.table-row.top-three {
  background: linear-gradient(to right, rgba(255, 215, 0, 0.05), transparent);
}

/* 排名单元格 */
.rank-cell {
  display: flex;
  align-items: center;
}

.rank-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
}

.rank-first {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.rank-second {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  color: white;
}

.rank-third {
  background: linear-gradient(135deg, #CD7F32, #A0522D);
  color: white;
}

/* 省份单元格 */
.province-cell {
  display: flex;
  align-items: center;
}

.province-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.province-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.province-details {
  flex: 1;
}

.province-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.province-mount {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* 数值单元格 */
.value-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.value-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-number {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.value-unit {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.progress-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 趋势单元格 */
.trend-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.trend-up {
  background: rgba(76, 175, 80, 0.1);
  color: #2e7d32;
}

.trend-down {
  background: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
}

.trend-stable {
  background: rgba(158, 158, 158, 0.1);
  color: #616161;
}

.trend-text {
  font-size: 0.75rem;
}

/* 表格脚注 */
.table-footer {
  padding: 12px 24px;
  background: #f9f9f9;
  border-top: 1px solid var(--border-color);
}

.footer-note {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 响应式 */
@media (max-width: 768px) {
  .header-row,
  .table-row {
    grid-template-columns: 60px 1fr 150px 80px;
    padding: 12px 16px;
  }
  
  .rank-number {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  
  .province-icon {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
  
  .value-number {
    font-size: 1rem;
  }
  
  .trend-indicator {
    padding: 2px 8px;
  }
}

@media (max-width: 480px) {
  .header-row,
  .table-row {
    grid-template-columns: 50px 1fr;
    gap: 8px;
  }
  
  .value-cell,
  .trend-cell {
    grid-column: 1 / -1;
  }
  
  .header-cell.value-cell,
  .header-cell.trend-cell {
    display: none;
  }
}
</style>