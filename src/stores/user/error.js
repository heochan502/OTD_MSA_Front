import { defineStore } from 'pinia'

export const useErrorStore = defineStore('error', () => {
  const error = ref(null)
  const isVisible = ref(false)
  
  const setError = (errorMessage) => {
    error.value = errorMessage
    isVisible.value = true
    
    // 5초 후 자동 숨김
    setTimeout(() => {
      isVisible.value = false
    }, 5000)
  }
  
  const clearError = () => {
    error.value = null
    isVisible.value = false
  }
  
  return { error, isVisible, setError, clearError }
})