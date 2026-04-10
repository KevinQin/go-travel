<template>
  <div class="about-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>关于 GoTravel</h1>
        <p class="page-subtitle">骑上家乡坐骑，漫游全球的趣味地理探索游戏</p>
      </div>

      <!-- 项目介绍 -->
      <section class="intro-section">
        <div class="intro-content">
          <div class="intro-text">
            <h2>项目理念</h2>
            <p>
              GoTravel 是一个结合地理探索、文化认知和趣味互动的轻量级游戏。
              我们希望通过轻松有趣的方式，让用户了解全球各地的文化特色，
              同时增强对家乡的认同感和归属感。
            </p>
            <p>
              每个省份都有独特的坐骑代表，用户在虚拟漫游中积累里程和成就，
              为家乡在排行榜上争取荣誉。
            </p>
          </div>
          <div class="intro-image">
            <div class="image-placeholder">
              <el-icon><Global /></el-icon>
              <p>探索世界，从家乡出发</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 功能特色 -->
      <section class="features-section">
        <h2>核心特色</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><MapLocation /></el-icon>
            </div>
            <h3>全球漫游</h3>
            <p>探索全球100+个著名城市、地标和自然景观</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <h3>省份归属</h3>
            <p>34个省级行政区，每个都有独特的坐骑和文化特色</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <h3>排行榜竞争</h3>
            <p>为家乡争取荣誉，参与省份间的友好竞争</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Star /></el-icon>
            </div>
            <h3>成就系统</h3>
            <p>收集独特成就，记录你的探索之旅</p>
          </div>
        </div>
      </section>

      <!-- 技术栈 -->
      <section class="tech-section">
        <h2>技术架构</h2>
        <div class="tech-stack">
          <div class="tech-category">
            <h3>前端</h3>
            <div class="tech-tags">
              <el-tag type="primary">Vue 3</el-tag>
              <el-tag type="success">TypeScript</el-tag>
              <el-tag type="warning">Vite</el-tag>
              <el-tag type="danger">Element Plus</el-tag>
              <el-tag type="info">Pinia</el-tag>
            </div>
          </div>
          <div class="tech-category">
            <h3>地图服务</h3>
            <div class="tech-tags">
              <el-tag>高德地图 API</el-tag>
              <el-tag>天地图（备用）</el-tag>
            </div>
          </div>
          <div class="tech-category">
            <h3>数据存储</h3>
            <div class="tech-tags">
              <el-tag type="primary">LocalStorage</el-tag>
              <el-tag type="success">Supabase（计划）</el-tag>
              <el-tag type="warning">PostgreSQL</el-tag>
            </div>
          </div>
          <div class="tech-category">
            <h3>部署</h3>
            <div class="tech-tags">
              <el-tag type="danger">Vercel</el-tag>
              <el-tag type="info">GitHub Pages</el-tag>
              <el-tag>Docker</el-tag>
            </div>
          </div>
        </div>
      </section>

      <!-- 开发路线图 -->
      <section class="roadmap-section">
        <h2>开发路线图</h2>
        <div class="roadmap-timeline">
          <div class="timeline-item" v-for="item in roadmap" :key="item.version">
            <div class="timeline-header">
              <div class="version-badge">{{ item.version }}</div>
              <div class="timeline-date">{{ item.date }}</div>
            </div>
            <div class="timeline-content">
              <h4>{{ item.title }}</h4>
              <ul class="feature-list">
                <li v-for="feature in item.features" :key="feature">{{ feature }}</li>
              </ul>
              <div class="status-badge" :class="item.status">
                {{ getStatusText(item.status) }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="faq-section">
        <h2>常见问题</h2>
        <el-collapse v-model="activeFaq">
          <el-collapse-item title="如何选择省份？" name="1">
            <p>首次访问时，系统会引导你选择省份。每个省份只能选择一次，选择后不可更改。</p>
          </el-collapse-item>
          <el-collapse-item title="数据保存在哪里？" name="2">
            <p>当前版本数据保存在浏览器本地存储（LocalStorage）。清除浏览器数据会丢失进度。</p>
          </el-collapse-item>
          <el-collapse-item title="如何参与排行榜？" name="3">
            <p>选择省份后，你的漫游数据会自动计入该省份的排行榜。数据每5分钟更新一次。</p>
          </el-collapse-item>
          <el-collapse-item title="可以更换省份吗？" name="4">
            <p>目前不支持更换省份。如果需要更换，可以清除浏览器数据重新开始。</p>
          </el-collapse-item>
          <el-collapse-item title="未来会收费吗？" name="5">
            <p>GoTravel 将保持免费。未来可能通过虚拟商品或品牌合作实现可持续发展。</p>
          </el-collapse-item>
        </el-collapse>
      </section>

      <!-- 联系与反馈 -->
      <section class="contact-section">
        <div class="contact-card">
          <div class="contact-content">
            <h3>反馈与建议</h3>
            <p>我们非常重视用户的反馈。如果你有任何建议或发现了问题，请通过以下方式联系我们：</p>
            <div class="contact-methods">
              <div class="contact-method">
                <el-icon><Message /></el-icon>
                <span>邮箱：contact@gotravel.com</span>
              </div>
              <div class="contact-method">
                <el-icon><ChatDotRound /></el-icon>
                <span>GitHub Issues</span>
              </div>
              <div class="contact-method">
                <el-icon><QuestionFilled /></el-icon>
                <span>用户反馈表单（开发中）</span>
              </div>
            </div>
          </div>
          <div class="contact-image">
            <el-icon><Service /></el-icon>
          </div>
        </div>
      </section>

      <!-- 开源声明 -->
      <section class="opensource-section">
        <el-alert
          title="开源项目"
          type="success"
          :closable="false"
          show-icon
        >
          <p>
            GoTravel 是一个开源项目，源代码托管在 GitHub 上。
            欢迎开发者参与贡献，共同完善这个有趣的探索游戏。
          </p>
          <div class="opensource-links">
            <el-button type="primary" size="small" @click="openGitHub">
              <el-icon><Star /></el-icon>
              Star on GitHub
            </el-button>
            <el-button size="small" @click="openIssues">
              <el-icon><ChatDotRound /></el-icon>
              提交 Issue
            </el-button>
          </div>
        </el-alert>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeFaq = ref(['1'])

const roadmap = [
  {
    version: 'v1.0',
    date: '2024年4月',
    title: 'MVP版本',
    features: [
      '省份选择功能',
      '基础漫游系统',
      '排行榜展示',
      '响应式设计'
    ],
    status: 'completed'
  },
  {
    version: 'v1.1',
    date: '2024年5月',
    title: '功能增强',
    features: [
      '高德地图集成',
      '坐骑动画效果',
      '成就系统',
      '社交分享'
    ],
    status: 'in-progress'
  },
  {
    version: 'v1.2',
    date: '2024年6月',
    title: '数据持久化',
    features: [
      '用户账户系统',
      '云端数据同步',
      '多设备支持',
      '数据导出'
    ],
    status: 'planned'
  },
  {
    version: 'v2.0',
    date: '2024年Q3',
    title: '扩展功能',
    features: [
      '微信小程序版',
      'AR坐骑体验',
      '教育内容模块',
      '多语言支持'
    ],
    status: 'planned'
  }
]

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'in-progress': return '进行中'
    case 'planned': return '计划中'
    default: return status
  }
}

const openGitHub = () => {
  ElMessage.info('GitHub仓库准备中...')
  // window.open('https://github.com/yourusername/gotravel', '_blank')
}

const openIssues = () => {
  ElMessage.info('Issue页面准备中...')
  // window.open('https://github.com/yourusername/gotravel/issues', '_blank')
}
</script>

<style scoped>
.about-view {
  padding: 40px 0 80px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-header h1 {
  font-size: 3rem;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

/* 项目介绍 */
.intro-section {
  margin-bottom: 80px;
}

.intro-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.intro-text h2 {
  font-size: 2rem;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.intro-text p {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.intro-image {
  display: flex;
  justify-content: center;
}

.image-placeholder {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.image-placeholder .el-icon {
  font-size: 6rem;
  margin-bottom: 16px;
}

.image-placeholder p {
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  max-width: 200px;
}

/* 功能特色 */
.features-section {
  margin-bottom: 80px;
}

.features-section h2 {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 48px;
  color: var(--text-primary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-item {
  text-align: center;
  padding: 32px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s;
}

.feature-item:hover {
  transform: translateY(-4px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 1.5rem;
}

.feature-item h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.feature-item p {
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 技术栈 */
.tech-section {
  margin-bottom: 80px;
}

.tech-section h2 {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 48px;
  color: var(--text-primary);
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.tech-category {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--card-shadow);
}

.tech-category h3 {
  font-size: 1.25rem;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 路线图 */
.roadmap-section {
  margin-bottom: 80px;
}

.roadmap-section h2 {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 48px;
  color: var(--text-primary);
}

.roadmap-timeline {
  max-width: 800px;
  margin: 0 auto;
}

.timeline-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--card-shadow);
  border-left: 4px solid var(--primary-color);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.version-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
}

.timeline-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.timeline-content h4 {
  font-size: 1.125rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.feature-list {
  margin: 0 0 16px 20px;
  color: var(--text-secondary);
}

.feature-list li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.in-progress {
  background: #e3f2fd;
  color: #1565c0;
}

.status-badge.planned {
  background: #f5f5f5;
  color: #616161;
}

/* 常见问题 */
.faq-section {
  margin-bottom: 80px;
}

.faq-section h2 {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 32px;
  color: var(--text-primary);
}

/* 联系与反馈 */
.contact-section {
  margin-bottom: 80px;
}

.contact-card {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 16px;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.contact-content {
  flex: 1;
}

.contact-content h3 {
  font-size: 2rem;
  margin-bottom: 16px;
}

.contact-content p {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 32px;
  line-height: 1.6;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.125rem;
}

.contact-image .el-icon {
  font-size: 8rem;
  opacity: 0.2;
}

/* 开源声明 */
.opensource-section {
  margin-bottom: 40px;
}

.opensource-links {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .intro-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .image-placeholder {
    width: 200px;
    height: 200px;
  }
  
  .contact-card {
    flex-direction: column;
    text-align: center;
    gap: 32px;
    padding: 32px;
  }
  
  .contact-image {
    order: -1;
  }
  
  .contact-method {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-stack {
    grid-template-columns: 1fr;
  }
  
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>