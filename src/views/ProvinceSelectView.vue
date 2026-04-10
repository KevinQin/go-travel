<template>
  <div class="province-select-view">
    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="container">
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索省份..."
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <el-select
            v-model="selectedTransport"
            placeholder="交通方式"
            size="large"
            clearable
            style="width: 180px;"
          >
            <el-option
              v-for="mode in transportModes"
              :key="mode.value"
              :label="mode.label"
              :value="mode.value"
            />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 省份网格 -->
    <div class="provinces-grid">
      <div class="container">
        <div class="grid-container">
          <div
            v-for="province in filteredProvinces"
            :key="province.id"
            class="province-card"
            :style="{ borderColor: province.color }"
            @click="selectProvince(province)"
          >
            <div class="card-header">
              <div class="province-badge" :style="{ backgroundColor: province.color }">
                {{ province.code }}
              </div>
              <div class="province-name">{{ province.name }}</div>
            </div>
            
            <div class="card-content">
              <div class="transport-info">
                <div class="transport-icon">{{ province.icon }}</div>
                <div class="transport-details">
                  <div class="transport-name">{{ getTransportName(province.mount) }}</div>
                  <div class="transport-speed">{{ province.speed }} km/h</div>
                </div>
              </div>
              
              <div class="province-description">
                {{ province.description }}
              </div>
            </div>
            
            <div class="card-footer">
              <div class="select-button">
                选择并开始漫游
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>准备漫游中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { provinces, getAllMountTypes, getMountConfig } from '@/data/provinces'
import { ElMessage } from 'element-plus'
import type { Province, TransportMode } from '@/types'

const router = useRouter()
const userStore = useUserStore()

// 状态
const searchQuery = ref('')
const selectedTransport = ref<MountType | ''>('')
const isLoading = ref(false)

// 计算属性
const filteredProvinces = computed(() => {
  let result = provinces

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query)
    )
  }

  // 交通方式过滤
  if (selectedTransport.value) {
    result = result.filter(p => p.transport === selectedTransport.value)
  }

  return result
})

const transportModes = computed(() => {
  const modes = getAllMountTypes()
  return modes.map(mode => {
    const config = getMountConfig(mode)
    return {
      value: mode,
      label: config.name,
      icon: config.icon
    }
  })
})

// 方法
const getTransportName = (mode: MountType) => {
  return getMountConfig(mode).name
}

const selectProvince = async (province: Province) => {
  try {
    isLoading.value = true
    
    // 选择省份（会自动开始漫游）
    const success = await userStore.selectProvince(province.id)
    
    if (success) {
      // 直接跳转到漫游页面
      router.push('/travel')
    } else {
      ElMessage.error('选择省份失败')
    }
  } catch (error) {
    console.error('选择省份出错:', error)
    ElMessage.error('发生错误，请重试')
  } finally {
    isLoading.value = false
  }
}

// 初始化
onMounted(() => {
  // 如果用户已经选择了省份，直接跳转到漫游页面
  if (userStore.selectedProvince) {
    router.push('/travel')
  }
})
</script>

<style scoped>
.province-select-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 搜索栏 */
.search-section {
  padding: 40px 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.search-box {
  display: flex;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

/* 省份网格 */
.provinces-grid {
  padding: 40px 0;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.province-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.province-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border-color: currentColor;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.province-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.province-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-content {
  margin-bottom: 20px;
}

.transport-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.transport-icon {
  font-size: 2rem;
}

.transport-details {
  flex: 1;
}

.transport-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.transport-speed {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.province-description {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.875rem;
}

.card-footer {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.select-button {
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.select-button:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-content {
  text-align: center;
}

.loading-icon {
  font-size: 4rem;
  color: var(--primary-color);
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式 */
@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
    padding: 0 16px;
  }
  
  .province-card {
    padding: 20px;
  }
}
</style>