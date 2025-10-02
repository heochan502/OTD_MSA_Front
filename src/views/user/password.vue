<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const basePath = import.meta.env.VITE_BASE_URL

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const isTokenValid = ref(false)
const isCheckingToken = ref(true)
const errorMessage = ref('')

const validation = ref({
  password: {
    touched: false,
    isValid: false,
    message: ''
  },
  confirmPassword: {
    touched: false,
    isValid: false,
    message: ''
  }
})

// 비밀번호 유효성 검사
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: '비밀번호를 입력해주세요.' }
  }
  
  if (password.length < 8) {
    return { isValid: false, message: '비밀번호는 8자 이상이어야 합니다.' }
  }
  
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return { 
      isValid: false, 
      message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.' 
    }
  }
  
  return { isValid: true, message: '사용 가능한 비밀번호입니다.' }
}

// 비밀번호 확인 검사
const validateConfirmPassword = (confirm, original) => {
  if (!confirm) {
    return { isValid: false, message: '비밀번호 확인을 입력해주세요.' }
  }
  
  if (confirm !== original) {
    return { isValid: false, message: '비밀번호가 일치하지 않습니다.' }
  }
  
  return { isValid: true, message: '비밀번호가 일치합니다.' }
}

// 토큰 유효성 검사
const checkToken = async () => {
  isCheckingToken.value = true
  
  try {
    const response = await fetch(`${basePath}/api/OTD/password/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.value })
    })
    
    if (response.ok) {
      isTokenValid.value = true
    } else {
      isTokenValid.value = false
      errorMessage.value = '유효하지 않거나 만료된 링크입니다.'
    }
  } catch (error) {
    console.error('토큰 검증 오류:', error)
    isTokenValid.value = false
    errorMessage.value = '네트워크 오류가 발생했습니다.'
  } finally {
    isCheckingToken.value = false
  }
}

// 비밀번호 재설정 제출
const handleSubmit = async () => {
  // 유효성 검사
  const passwordValidation = validatePassword(newPassword.value)
  const confirmValidation = validateConfirmPassword(confirmPassword.value, newPassword.value)
  
  validation.value.password.touched = true
  validation.value.confirmPassword.touched = true
  validation.value.password.isValid = passwordValidation.isValid
  validation.value.password.message = passwordValidation.message
  validation.value.confirmPassword.isValid = confirmValidation.isValid
  validation.value.confirmPassword.message = confirmValidation.message
  
  if (!passwordValidation.isValid || !confirmValidation.isValid) {
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await fetch(`${basePath}/api/OTD/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        newPassword: newPassword.value
      })
    })
    
    if (response.ok) {
      alert('비밀번호가 성공적으로 변경되었습니다.')
      router.push('/login')
    } else {
      const error = await response.json()
      errorMessage.value = error.message || '비밀번호 변경에 실패했습니다.'
    }
  } catch (error) {
    console.error('비밀번호 변경 오류:', error)
    errorMessage.value = '네트워크 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 비밀번호 입력 시 실시간 검증
const handlePasswordInput = () => {
  if (validation.value.password.touched) {
    const result = validatePassword(newPassword.value)
    validation.value.password.isValid = result.isValid
    validation.value.password.message = result.message
  }
  
  // 비밀번호 확인도 함께 재검증
  if (validation.value.confirmPassword.touched && confirmPassword.value) {
    const result = validateConfirmPassword(confirmPassword.value, newPassword.value)
    validation.value.confirmPassword.isValid = result.isValid
    validation.value.confirmPassword.message = result.message
  }
}

const handleConfirmPasswordInput = () => {
  if (validation.value.confirmPassword.touched) {
    const result = validateConfirmPassword(confirmPassword.value, newPassword.value)
    validation.value.confirmPassword.isValid = result.isValid
    validation.value.confirmPassword.message = result.message
  }
}

// 컴포넌트 마운트 시 토큰 확인
onMounted(() => {
  token.value = route.query.token || ''
  
  if (!token.value) {
    isTokenValid.value = false
    isCheckingToken.value = false
    errorMessage.value = '유효하지 않은 접근입니다.'
  } else {
    checkToken()
  }
})
</script>

<template>
  <div class="reset-password-container">
    <div class="reset-card">
      <h1 class="title">비밀번호 재설정</h1>
      
      <!-- 토큰 확인 중 -->
      <div v-if="isCheckingToken" class="loading-state">
        <div class="spinner"></div>
        <p>링크를 확인하고 있습니다...</p>
      </div>
      
      <!-- 토큰 유효하지 않음 -->
      <div v-else-if="!isTokenValid" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-text">{{ errorMessage }}</p>
        <p class="error-hint">비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.</p>
        <button @click="router.push('/login')" class="btn-go-login">
          로그인 페이지로 이동
        </button>
      </div>
      
      <!-- 비밀번호 재설정 폼 -->
      <div v-else class="form-container">
        <p class="description">
          새로운 비밀번호를 입력해주세요.<br />
          안전한 비밀번호로 설정하시기 바랍니다.
        </p>
        
        <div v-if="errorMessage" class="error-banner">
          <span class="error-icon">⚠</span>
          {{ errorMessage }}
        </div>
        
        <div class="form-group">
          <label for="newPassword">새 비밀번호</label>
          <input
            type="password"
            id="newPassword"
            placeholder="새 비밀번호를 입력하세요"
            v-model="newPassword"
            @input="handlePasswordInput"
            @blur="validation.password.touched = true"
            :class="{
              'input-field': true,
              'error': validation.password.touched && !validation.password.isValid,
              'success': validation.password.touched && validation.password.isValid
            }"
          />
          <div
            v-if="validation.password.touched && validation.password.message"
            :class="[
              'field-message',
              validation.password.isValid ? 'field-success' : 'field-error'
            ]"
          >
            {{ validation.password.message }}
          </div>
          <p class="field-hint">
            8자 이상, 대소문자, 숫자, 특수문자 포함
          </p>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
            v-model="confirmPassword"
            @input="handleConfirmPasswordInput"
            @blur="validation.confirmPassword.touched = true"
            :class="{
              'input-field': true,
              'error': validation.confirmPassword.touched && !validation.confirmPassword.isValid,
              'success': validation.confirmPassword.touched && validation.confirmPassword.isValid
            }"
          />
          <div
            v-if="validation.confirmPassword.touched && validation.confirmPassword.message"
            :class="[
              'field-message',
              validation.confirmPassword.isValid ? 'field-success' : 'field-error'
            ]"
          >
            {{ validation.confirmPassword.message }}
          </div>
        </div>
        
        <button
          type="button"
          class="btn-submit"
          @click="handleSubmit"
          :disabled="isLoading || !validation.password.isValid || !validation.confirmPassword.isValid"
        >
          <span v-if="isLoading">변경 중...</span>
          <span v-else>비밀번호 변경</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.reset-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 480px;
  width: 100%;
  padding: 40px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
}

.description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 24px 0;
  text-align: center;
}

/* 로딩 상태 */
.loading-state {
  text-align: center;
  padding: 40px 0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #666;
  font-size: 14px;
}

/* 에러 상태 */
.error-state {
  text-align: center;
  padding: 20px 0;
}

.error-state .error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-text {
  font-size: 18px;
  font-weight: 600;
  color: #f44336;
  margin: 0 0 8px 0;
}

.error-hint {
  color: #666;
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.btn-go-login {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-go-login:hover {
  background: #5568d3;
  transform: translateY(-2px);
}

/* 에러 배너 */
.error-banner {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 폼 스타일 */
.form-container {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: #fff;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field.error {
  border-color: #f44336;
  background-color: #fff5f5;
}

.input-field.success {
  border-color: #4CAF50;
  background-color: #f0fdf4;
}

.field-message {
  font-size: 13px;
  font-weight: 500;
  margin-top: 6px;
  transition: all 0.2s ease;
}

.field-error {
  color: #f44336;
}

.field-success {
  color: #4CAF50;
}

.field-hint {
  font-size: 12px;
  color: #999;
  margin: 6px 0 0 0;
}

.btn-submit {
  width: 100%;
  padding: 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-submit:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 600px) {
  .reset-card {
    padding: 30px 20px;
  }
  
  .title {
    font-size: 24px;
  }
}
</style>