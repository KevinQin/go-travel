<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <div class="logo" @click="$router.push('/')">
            <h1>GoTravel</h1>
            <span class="tagline">骑上家乡坐骑漫游全球</span>
          </div>
          <nav class="nav-links">
            <router-link to="/" class="nav-link">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </router-link>
            <router-link to="/travel" class="nav-link">
              <el-icon><Location /></el-icon>
              <span>漫游</span>
            </router-link>
            <router-link to="/rankings" class="nav-link">
              <el-icon><Trophy /></el-icon>
              <span>排行榜</span>
            </router-link>
            <router-link to="/about" class="nav-link">
              <el-icon><InfoFilled /></el-icon>
              <span>关于</span>
            </router-link>
          </nav>
          <div class="user-info" v-if="userStore.selectedProvince">
            <el-avatar :size="32" :style="{ backgroundColor: userStore.selectedProvince.color }">
              {{ userStore.selectedProvince.name.charAt(0) }}
            </el-avatar>
            <span class="province-name">{{ userStore.selectedProvince.name }}</span>
          </div>
          <div class="user-info" v-else>
            <el-button type="primary" size="small" @click="$router.push('/select')">
              选择省份
            </el-button>
          </div>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <router-view />
    </main>
    
    <footer class="app-footer">
      <div class="container">
        <p>© 2024 GoTravel - 趣味地理探索游戏</p>
        <p class="footer-links">
          <a href="#" @click.prevent="showDisclaimer">免责声明</a>
          <span class="separator">|</span>
          <a href="#" @click.prevent="showPrivacy">隐私政策</a>
          <span class="separator">|</span>
          <a href="mailto:contact@gotravel.com">联系我们</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

const showDisclaimer = () => {
  ElMessage.info('本游戏仅供娱乐，地点信息可能不准确')
}

const showPrivacy = () => {
  ElMessage.info('我们尊重用户隐私，不会收集个人敏感信息')
}
</script>

<style scoped>
.app-header {
  background: white;
  box-shadow: var(--card-shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 16px;
}

.logo {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
}

.tagline {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.nav-links {
  display: flex;
  gap: 24px;
  margin: 0 32px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
  background-color: rgba(76, 175, 80, 0.1);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  background-color: rgba(76, 175, 80, 0.1);
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.province-name {
  font-weight: 500;
  color: var(--text-primary);
}

.app-main {
  flex: 1;
  padding: 24px 0;
}

.app-footer {
  background: white;
  border-top: 1px solid var(--border-color);
  padding: 24px 0;
  text-align: center;
}

.app-footer p {
  margin: 8px 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.footer-links a {
  color: var(--secondary-color);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.separator {
  color: var(--border-color);
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    height: auto;
    padding: 12px;
  }
  
  .nav-links {
    order: 3;
    width: 100%;
    justify-content: center;
    margin: 12px 0;
    gap: 12px;
  }
  
  .user-info {
    order: 2;
  }
}
</style>