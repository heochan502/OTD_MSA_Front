import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const loadingMessage = ref('')
  
  const startLoading = (message = '처리 중...') => {
    isLoading.value = true
    loadingMessage.value = message
  }
  
  const stopLoading = () => {
    isLoading.value = false
    loadingMessage.value = ''
  }
  
  return { isLoading, loadingMessage, startLoading, stopLoading }
})