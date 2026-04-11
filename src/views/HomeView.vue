<template>
  <div class="home-view">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">骑上家乡坐骑，漫游全球</h1>
          <p class="hero-subtitle">选择你的省份，化身特色坐骑，开始全球冒险之旅！</p>
          
          <div class="hero-actions">
            <el-button 
              v-if="!userStore.selectedProvince" 
              type="primary" 
              size="large" 
              @click="$router.push('/select')"
              class="pulse"
            >
              <el-icon><LocationFilled /></el-icon>
              选择我的省份
            </el-button>
            <el-button 
              v-else 
              type="success" 
              size="large" 
              @click="$router.push('/travel')"
            >
              <el-icon><Promotion /></el-icon>
              开始漫游
            </el-button>
            <el-button 
              type="info" 
              size="large" 
              @click="$router.push('/rankings')"
            >
              <el-icon><Trophy /></el-icon>
              查看排行榜
            </el-button>
          </div>
        </div>
        
        <div class="hero-visual">
          <div class="mount-preview">
            <div class="mount-icon" :style="{ backgroundColor: userStore.selectedProvince?.color || '#4CAF50' }">
              <el-icon v-if="!userStore.selectedProvince"><Location /></el-icon>
              <span v-else>{{ userStore.selectedProvince.name.charAt(0) }}</span>
            </div>
            <div class="mount-info">
              <h3>{{ userStore.selectedProvince?.name || '选择省份' }}</h3>
              <p>{{ userStore.selectedProvince?.icon || '特色坐骑' }}</p>
            </div>
          </div>
          
          <div class="stats-preview">
            <div class="stat-item">
              <div class="stat-value">{{ userStore.visitedCount }}</div>
              <div class="stat-label">已访问地点</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStore.userData.totalDistance.toLocaleString() }}</div>
              <div class="stat-label">总里程(km)</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userStore.visitedCountries.length }}</div>
              <div class="stat-label">访问国家</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">特色功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><MapLocation /></el-icon>
            </div>
            <h3>全球漫游</h3>
            <p>随机或指定目的地，探索全球100+个著名城市和地标</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <h3>省份排行榜</h3>
            <p>与同省伙伴一起竞争，为家乡赢得荣誉</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Star /></el-icon>
            </div>
            <h3>成就系统</h3>
            <p>收集独特成就，记录你的探索之旅</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon><Share /></el-icon>
            </div>
            <h3>社交分享</h3>
            <p>分享你的旅行足迹，邀请朋友加入</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门省份 -->
    <section class="provinces-section">
      <div class="container">
        <h2 class="section-title">热门省份</h2>
        <div class="provinces-grid">
          <div 
            v-for="province in popularProvinces" 
            :key="province.id"
            class="province-card"
            :style="{ borderColor: province.color }"
            @click="selectProvince(province)"
          >
            <div class="province-header" :style="{ backgroundColor: province.color + '20' }">
              <div class="province-icon" :style="{ backgroundColor: province.color }">
                {{ province.name.charAt(0) }}
              </div>
              <h3>{{ province.name }}</h3>
            </div>
            <div class="province-body">
              <p class="mount-name">{{ province.icon }}</p>
              <p class="province-desc">{{ province.description }}</p>
              <el-button 
                type="link" 
                :style="{ color: province.color }"
                @click.stop="selectProvince(province)"
              >
                选择此省份
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start-section">
      <div class="container">
        <h2 class="section-title">快速开始</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>选择省份</h3>
            <p>从34个省级行政区中选择你的家乡</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>获得坐骑</h3>
            <p>每个省份都有独特的特色坐骑</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>开始漫游</h3>
            <p>点击开始，随机探索全球目的地</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>竞争排名</h3>
            <p>为你的省份在排行榜上争取荣誉</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { provinces } from '@/data/provinces'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const router = useRouter()

// 热门省份（前6个）
const popularProvinces = computed(() => provinces.slice(0, 6))

const selectProvince = async (province: any) => {
  const success = await userStore.selectProvince(province)
  if (success) {
    ElMessage.success(`已选择 ${province.name}，坐骑：${province.icon}`)
    // 使用Vue Router进行导航，自动处理基础路径
    setTimeout(() => {
      router.push('/travel')
    }, 1000)
  } else {
    ElMessage.error('选择省份失败，请重试')
  }
}
</script>

<style scoped>
.home-view {
  padding-bottom: 60px;
}

/* 英雄区域 */
.hero-section {
  background: linear-gradient(135deg, #4CAF50 0%, #2196F3 100%);
  color: white;
  padding: 80px 0;
  border-radius: 0 0 24px 24px;
}

.hero-content {
  text-align: center;
  margin-bottom: 40px;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-visual {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 24px;
}

.icon-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.icon-info h3 {
  font-size: 1.5rem;
  margin: 0;
  color: white;
}

.icon-info p {
  margin: 4px 0 0;
  opacity: 0.8;
}

.stats-preview {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 4px;
}

/* 功能特色 */
.features-section {
  padding: 80px 0;
}

.section-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 48px;
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--hover-shadow);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 1.5rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 热门省份 */
.provinces-section {
  padding: 80px 0;
  background-color: #f9f9f9;
}

.provinces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.province-card {
  background: white;
  border-radius: 12px;
  border: 2px solid;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.province-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--hover-shadow);
}

.province-header {
  padding: 20px;
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
}

.province-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.province-body {
  padding: 20px;
}

.icon-name {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.province-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
}

/* 快速开始 */
.quick-start-section {
  padding: 80px 0;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.step {
  text-align: center;
}

.step-number {
  width: 48px;
  height: 48px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0 auto 16px;
}

.step h3 {
  font-size: 1.125rem;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.step p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .hero-visual {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-preview {
    justify-content: center;
  }
  
  .features-grid,
  .provinces-grid {
    grid-template-columns: 1fr;
  }
  
  .steps {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>