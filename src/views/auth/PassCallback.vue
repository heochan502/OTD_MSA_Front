<script setup>
import { ref, onMounted } from 'vue'

const status = ref('processing') // processing, success, error
const errorMessage = ref('')

onMounted(() => {
  processCallback()
})

const processCallback = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')

    if (error) {
      const errorMsg = errorDescription || error
      throw new Error(errorMsg)
    }

    if (code && state) {
      // 부모 창으로 인증 성공 메시지 전송
      if (window.opener) {
        window.opener.postMessage({
          type: 'PASS_AUTH_SUCCESS',
          result: { code, state }
        }, window.location.origin)
      }
      
      status.value = 'success'
      
      // 1초 후 창 닫기
      setTimeout(() => {
        closeWindow()
      }, 1000)
    } else {
      throw new Error('인증 정보가 없습니다.')
    }
  } catch (error) {
    status.value = 'error'
    errorMessage.value = error.message || '알 수 없는 오류가 발생했습니다.'
    
    // 부모 창으로 에러 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'PASS_AUTH_ERROR',
        error: error.message
      }, window.location.origin)
    }
  }
}

const closeWindow = () => {
  if (window.opener) {
    window.close()
  } else {
    // 팝업이 아닌 경우 메인 페이지로 리다이렉트
    window.location.href = '/'
  }
}
</script>
<template>
  <div class="callback-container">
    <div class="callback-content">
      <div v-if="status === 'processing'" class="processing">
        <div class="spinner"></div>
        <h3>PASS 인증 처리 중</h3>
        <p>잠시만 기다려주세요...</p>
      </div>
      
      <div v-else-if="status === 'success'" class="success">
        <div class="success-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3>인증이 완료되었습니다</h3>
        <p>창이 자동으로 닫힙니다.</p>
      </div>
      
      <div v-else-if="status === 'error'" class="error">
        <div class="error-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h3>인증에 실패했습니다</h3>
        <p>{{ errorMessage }}</p>
        <button @click="closeWindow" class="retry-btn">창 닫기</button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #f0fdf4, #eff6ff);
  padding: 2rem;
}

.callback-content {
  background: white;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.processing {
  color: #374151;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #00D5DF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success {
  color: #047857;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background-color: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success-icon svg {
  width: 2rem;
  height: 2rem;
  color: #047857;
}

.error {
  color: #dc2626;
}

.error-icon {
  width: 4rem;
  height: 4rem;
  background-color: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.error-icon svg {
  width: 2rem;
  height: 2rem;
  color: #dc2626;
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

p {
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.retry-btn {
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #b91c1c;
}

@media (max-width: 480px) {
  .callback-content {
    padding: 2rem;
  }
  
  .spinner {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .success-icon,
  .error-icon {
    width: 3rem;
    height: 3rem;
  }
  
  .success-icon svg,
  .error-icon svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}
</style>