import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ProvinceSelectView from '@/views/ProvinceSelectView.vue'
import TravelView from '@/views/TravelView.vue'
import RankingsView from '@/views/RankingsView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/select',
      name: 'select',
      component: ProvinceSelectView
    },
    {
      path: '/travel',
      name: 'travel',
      component: TravelView
    },
    {
      path: '/rankings',
      name: 'rankings',
      component: RankingsView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    }
  ]
})

export default router