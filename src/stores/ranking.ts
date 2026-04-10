import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RankingItem, Province } from '@/types'
import { provinces } from '@/data/provinces'

export const useRankingStore = defineStore('ranking', () => {
  // 模拟排行榜数据
  const rankings = ref<RankingItem[]>([
    { provinceId: 51, provinceName: '四川', participants: 1250, totalDistance: 85000, visitedCountries: 45 },
    { provinceId: 44, provinceName: '广东', participants: 980, totalDistance: 72000, visitedCountries: 38 },
    { provinceId: 11, provinceName: '北京', participants: 850, totalDistance: 68000, visitedCountries: 42 },
    { provinceId: 31, provinceName: '上海', participants: 790, totalDistance: 65000, visitedCountries: 40 },
    { provinceId: 42, provinceName: '湖北', participants: 620, totalDistance: 52000, visitedCountries: 35 },
    { provinceId: 33, provinceName: '浙江', participants: 580, totalDistance: 48000, visitedCountries: 32 },
    { provinceId: 32, provinceName: '江苏', participants: 550, totalDistance: 46000, visitedCountries: 30 },
    { provinceId: 13, provinceName: '河北', participants: 480, totalDistance: 42000, visitedCountries: 28 },
    { provinceId: 41, provinceName: '河南', participants: 450, totalDistance: 40000, visitedCountries: 26 },
    { provinceId: 21, provinceName: '辽宁', participants: 380, totalDistance: 35000, visitedCountries: 24 }
  ])

  // 当前排序类型
  const sortBy = ref<'participants' | 'distance' | 'countries'>('participants')

  // 排序后的排行榜
  const sortedRankings = computed(() => {
    return [...rankings.value].sort((a, b) => b[sortBy.value] - a[sortBy.value])
  })

  // 获取省份信息
  const getProvinceInfo = (provinceId: number): Province | undefined => {
    return provinces.find(p => p.id === provinceId)
  }

  // 添加参与者（模拟）
  const addParticipant = (provinceId: number) => {
    const index = rankings.value.findIndex(item => item.provinceId === provinceId)
    if (index !== -1) {
      rankings.value[index].participants += 1
    } else {
      const province = getProvinceInfo(provinceId)
      if (province) {
        rankings.value.push({
          provinceId,
          provinceName: province.name,
          participants: 1,
          totalDistance: 0,
          visitedCountries: 0
        })
      }
    }
  }

  // 添加里程（模拟）
  const addDistance = (provinceId: number, distance: number) => {
    const index = rankings.value.findIndex(item => item.provinceId === provinceId)
    if (index !== -1) {
      rankings.value[index].totalDistance += distance
    }
  }

  // 添加访问国家（模拟）
  const addVisitedCountry = (provinceId: number) => {
    const index = rankings.value.findIndex(item => item.provinceId === provinceId)
    if (index !== -1) {
      rankings.value[index].visitedCountries += 1
    }
  }

  // 切换排序
  const setSortBy = (type: 'participants' | 'distance' | 'countries') => {
    sortBy.value = type
  }

  // 获取用户省份排名
  const getUserProvinceRank = (provinceId: number): number => {
    const sorted = sortedRankings.value
    const index = sorted.findIndex(item => item.provinceId === provinceId)
    return index !== -1 ? index + 1 : 0
  }

  return {
    rankings,
    sortBy,
    sortedRankings,
    getProvinceInfo,
    addParticipant,
    addDistance,
    addVisitedCountry,
    setSortBy,
    getUserProvinceRank
  }
})