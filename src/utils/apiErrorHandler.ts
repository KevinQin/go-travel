/**
 * API错误处理工具
 * 提供用户友好的错误提示和降级方案
 */

/**
 * 处理高德地图API错误
 * @param error 错误对象
 * @param context 错误上下文（可选）
 */
export function handleAmapApiError(error: any, context?: string): void {
  const errorMessage = error?.message || String(error)
  const errorInfo = error?.info || ''
  
  console.group('🗺️ 高德地图API错误')
  
  if (context) {
    console.log(`上下文: ${context}`)
  }
  
  console.log(`错误信息: ${errorMessage}`)
  
  // 根据错误类型提供不同的处理建议
  if (errorMessage.includes('INVALID_USER_KEY') || errorInfo.includes('INVALID_USER_KEY')) {
    console.error('❌ 问题: API Key无效或配置错误')
    console.info('💡 解决方案:')
    console.info('   1. 检查GitHub Secrets中的AMAP_API_KEY配置')
    console.info('   2. 验证API Key在高德地图控制台的状态')
    console.info('   3. 确保API Key绑定了 *.github.io 域名')
    console.info('   4. 当前使用模拟模式继续运行')
  } else if (errorMessage.includes('INSUFFICIENT_ABROAD_PRIVILEGES')) {
    console.warn('⚠️ 问题: 缺少国际路线规划权限')
    console.info('💡 解决方案:')
    console.info('   1. 国际路线使用模拟模式')
    console.info('   2. 国内路线可正常规划')
    console.info('   3. 如需完整功能，请申请国际路线权限')
  } else if (errorMessage.includes('DAILY_QUERY_OVER_LIMIT')) {
    console.warn('⚠️ 问题: API调用次数超限')
    console.info('💡 解决方案:')
    console.info('   1. 等待次日配额重置')
    console.info('   2. 使用模拟模式继续')
    console.info('   3. 考虑升级API套餐')
  } else {
    console.error('❌ 问题: 未知API错误')
    console.info('💡 解决方案:')
    console.info('   使用模拟模式继续运行')
  }
  
  console.groupEnd()
  
  // 这里可以添加用户界面提示（如果需要）
  // showUserNotification('地图服务暂时使用模拟模式，功能基本正常')
}

/**
 * 检查API Key是否有效
 * @param apiKey API Key
 * @returns 是否有效
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey || apiKey.length !== 32) {
    console.warn('API Key格式不正确，应为32位字符串')
    return false
  }
  
  try {
    // 简单的IP定位测试（轻量级API调用）
    const testUrl = `https://restapi.amap.com/v3/ip?key=${apiKey}`
    const response = await fetch(testUrl)
    const data = await response.json()
    
    return data.status === '1'
  } catch (error) {
    console.warn('API Key验证失败:', error)
    return false
  }
}

/**
 * 显示用户通知（控制台样式）
 * @param message 消息内容
 * @param type 消息类型
 */
export function showUserNotification(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
  const styles = {
    info: 'background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px;',
    warn: 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px;',
    error: 'background: #F44336; color: white; padding: 4px 8px; border-radius: 4px;'
  }
  
  console.log(`%c📢 ${message}`, styles[type])
}

/**
 * 初始化API错误监控
 */
export function initApiErrorMonitoring(): void {
  // 监听未捕获的Promise错误
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('amap') || 
        event.reason?.info?.includes('amap') ||
        event.reason?.message?.includes('高德')) {
      handleAmapApiError(event.reason, '未处理的Promise错误')
    }
  })
  
  // 监听全局错误
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('amap') || 
        event.error?.message?.includes('高德')) {
      handleAmapApiError(event.error, '全局错误')
    }
  })
  
  console.log('🗺️ API错误监控已初始化')
}

// 默认导出
export default {
  handleAmapApiError,
  validateApiKey,
  showUserNotification,
  initApiErrorMonitoring
}