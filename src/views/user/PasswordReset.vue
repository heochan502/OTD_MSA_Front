<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { sendPasswordResetCode, verifyPasswordResetCode, resetPassword } from '@/services/userService'

const router = useRouter()

// 반응형 데이터
const currentStep = ref(1)
const isLoading = ref(false)
const error = ref('')

// 1단계: 이메일
const email = ref('')

// 2단계: 인증코드
const resetCode = ref('')
const countdown = ref(0)
const resendCountdown = ref(0)

// 3단계: 새 비밀번호
const newPassword = ref('')
const confirmPassword = ref('')
const timeRemaining = ref(0) // 10분 타이머

// 타이머 인터벌
let countdownInterval = null
let resendInterval = null
let timeRemainingInterval = null

// 컴퓨티드
const stepText = computed(() => {
  const steps = {
    1: '1단계: 이메일 확인',
    2: '2단계: 인증코드 입력',
    3: '3단계: 새 비밀번호 설정',
    4: '완료'
  }
  return steps[currentStep.value]
})

const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value
})

const hasLetter = computed(() => /[A-Za-z]/.test(newPassword.value))
const hasNumber = computed(() => /\d/.test(newPassword.value))
const hasSpecial = computed(() => /[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(newPassword.value))
const hasMinLength = computed(() => newPassword.value.length >= 10)

const canSubmitPassword = computed(() => {
  return newPassword.value && 
         confirmPassword.value && 
         passwordsMatch.value &&
         hasLetter.value &&
         hasNumber.value &&
         hasSpecial.value &&
         hasMinLength.value
})

// 메서드
const goToStep = (step) => {
  currentStep.value = step
  error.value = ''
  
  // 타이머 정리
  clearAllTimers()
  
  if (step === 1) {
    // 모든 데이터 초기화
    email.value = ''
    resetCode.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }
}

const sendResetCode = async () => {
  if (!email.value || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await sendPasswordResetCode({ email: email.value })
    
    if (response.data.resultCode === 1) {
      currentStep.value = 2
      startCountdown(300) // 5분 카운트다운
      startResendCountdown(60) // 1분 재발송 제한
    } else {
      throw new Error(response.data.message || '인증코드 발송에 실패했습니다.')
    }
  } catch (err) {
    console.error('인증코드 발송 에러:', err)
    error.value = err.message || '인증코드 발송 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const verifyResetCode = async () => {
  if (!resetCode.value || resetCode.value.length !== 6 || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await verifyPasswordResetCode({ 
      email: email.value, 
      code: resetCode.value 
    })
    
    if (response.data.resultCode === 1) {
      currentStep.value = 3
      clearAllTimers()
      startTimeRemaining(600) // 10분 타이머
    } else {
      throw new Error(response.data.message || '인증코드가 일치하지 않습니다.')
    }
  } catch (err) {
    console.error('인증코드 확인 에러:', err)
    error.value = err.message || '인증코드 확인 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const resetPassword = async () => {
  if (!canSubmitPassword.value || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    const response = await resetPassword({
      email: email.value,
      newPassword: newPassword.value
    })
    
    if (response.data.resultCode === 1) {
      currentStep.value = 4
      clearAllTimers()
    } else {
      throw new Error(response.data.message || '비밀번호 변경에 실패했습니다.')
    }
  } catch (err) {
    console.error('비밀번호 변경 에러:', err)
    error.value = err.message || '비밀번호 변경 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const formatCode = (event) => {
  // 숫자만 허용
  event.target.value = event.target.value.replace(/\D/g, '')
  resetCode.value = event.target.value
}

const startCountdown = (seconds) => {
  countdown.value = seconds
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownInterval)
    }
  }, 1000)
}

const startResendCountdown = (seconds) => {
  resendCountdown.value = seconds
  resendInterval = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) {
      clearInterval(resendInterval)
    }
  }, 1000)
}

const startTimeRemaining = (seconds) => {
  timeRemaining.value = seconds
  timeRemainingInterval = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(timeRemainingInterval)
      error.value = '인증 시간이 만료되었습니다. 처음부터 다시 시작해주세요.'
      setTimeout(() => {
        goToStep(1)
      }, 3000)
    }
  }, 1000)
}

const clearAllTimers = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  if (resendInterval) {
    clearInterval(resendInterval)
    resendInterval = null
  }
  if (timeRemainingInterval) {
    clearInterval(timeRemainingInterval)
    timeRemainingInterval = null
  }
}

// 라이프사이클
onUnmounted(() => {
  clearAllTimers()
})
</script>
<template>
  <div class="password-reset">
    <div class="reset-container">
      <div class="reset-header">
        <h2>비밀번호 재설정</h2>
        <p class="step-indicator">{{ stepText }}</p>
      </div>

      <!-- 1단계: 이메일 입력 -->
      <div v-if="currentStep === 1" class="step email-step">
        <div class="step-content">
          <h3>이메일 확인</h3>
          <p class="description">
            가입하신 이메일 주소를 입력해주세요.<br>
            비밀번호 재설정을 위한 인증코드를 발송해드립니다.
          </p>
          
          <form @submit.prevent="sendResetCode" class="form">
            <div class="form-group">
              <label for="email">이메일 주소</label>
              <input 
                id="email"
                v-model="email" 
                type="email" 
                placeholder="example@email.com"
                required
                :disabled="isLoading"
                class="form-input"
                autocomplete="email"
              />
            </div>
            
            <button 
              type="submit" 
              :disabled="!email || isLoading"
              class="submit-btn"
            >
              {{ isLoading ? '발송 중...' : '인증코드 발송' }}
            </button>
          </form>
        </div>
      </div>

      <!-- 2단계: 인증코드 확인 -->
      <div v-if="currentStep === 2" class="step verify-step">
        <div class="step-content">
          <h3>인증코드 확인</h3>
          <p class="description">
            <strong>{{ email }}</strong>로 발송된<br>
            6자리 인증코드를 입력해주세요.
          </p>
          
          <form @submit.prevent="verifyResetCode" class="form">
            <div class="form-group">
              <label for="resetCode">인증코드</label>
              <input 
                id="resetCode"
                v-model="resetCode" 
                type="text"
                placeholder="123456"
                maxlength="6"
                required
                :disabled="isLoading"
                class="form-input code-input"
                autocomplete="one-time-code"
                @input="formatCode"
              />
              <small class="help-text">
                인증코드는 5분간 유효합니다.
                <span v-if="countdown > 0" class="countdown">
                  ({{ Math.floor(countdown / 60) }}:{{ String(countdown % 60).padStart(2, '0') }} 남음)
                </span>
              </small>
            </div>
            
            <div class="form-actions">
              <button 
                type="button"
                @click="sendResetCode"
                :disabled="isLoading || resendCountdown > 0"
                class="resend-btn"
              >
                {{ resendCountdown > 0 ? `${resendCountdown}초 후 재발송` : '인증코드 재발송' }}
              </button>
              
              <button 
                type="submit" 
                :disabled="!resetCode || resetCode.length !== 6 || isLoading"
                class="submit-btn"
              >
                {{ isLoading ? '확인 중...' : '인증 확인' }}
              </button>
            </div>
          </form>
          
          <button @click="goToStep(1)" class="back-btn">
            이메일 다시 입력
          </button>
        </div>
      </div>

      <!-- 3단계: 새 비밀번호 설정 -->
      <div v-if="currentStep === 3" class="step password-step">
        <div class="step-content">
          <h3>새 비밀번호 설정</h3>
          <p class="description">
            새로운 비밀번호를 설정해주세요.<br>
            보안을 위해 이전과 다른 비밀번호를 사용하시기 바랍니다.
          </p>
          
          <form @submit.prevent="resetPassword" class="form">
            <div class="form-group">
              <label for="newPassword">새 비밀번호</label>
              <input 
                id="newPassword"
                v-model="newPassword" 
                type="password"
                placeholder="새 비밀번호를 입력하세요"
                required
                :disabled="isLoading"
                class="form-input"
                pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).{10,}$"
                title="영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다."
                autocomplete="new-password"
              />
              <div class="password-requirements">
                <small :class="{ valid: hasLetter }">✓ 영문자 포함</small>
                <small :class="{ valid: hasNumber }">✓ 숫자 포함</small>
                <small :class="{ valid: hasSpecial }">✓ 특수문자 포함</small>
                <small :class="{ valid: hasMinLength }">✓ 10자 이상</small>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">새 비밀번호 확인</label>
              <input 
                id="confirmPassword"
                v-model="confirmPassword" 
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                required
                :disabled="isLoading"
                class="form-input"
                autocomplete="new-password"
              />
              <small 
                v-if="newPassword && confirmPassword && !passwordsMatch"
                class="error-text"
              >
                비밀번호가 일치하지 않습니다.
              </small>
            </div>
            
            <div class="time-warning" v-if="timeRemaining > 0">
              <span class="warning-icon">⚠️</span>
              인증 시간이 {{ Math.floor(timeRemaining / 60) }}분 {{ timeRemaining % 60 }}초 남았습니다.
            </div>
            
            <button 
              type="submit" 
              :disabled="!canSubmitPassword || isLoading"
              class="submit-btn"
            >
              {{ isLoading ? '변경 중...' : '비밀번호 변경' }}
            </button>
          </form>
          
          <button @click="goToStep(1)" class="back-btn">
            처음부터 다시 시작
          </button>
        </div>
      </div>

      <!-- 4단계: 완료 -->
      <div v-if="currentStep === 4" class="step success-step">
        <div class="step-content">
          <div class="success-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3>비밀번호 변경 완료</h3>
          <p class="description">
            비밀번호가 성공적으로 변경되었습니다.<br>
            새로운 비밀번호로 로그인해주세요.
          </p>
          
          <div class="actions">
            <router-link to="/user/login" class="login-btn">
              로그인 페이지로 이동
            </router-link>
          </div>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        <span class="error-icon">❌</span>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.password-reset {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.reset-container {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.reset-header {
  background: linear-gradient(135deg, #00D5DF 0%, #00bcc7 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.reset-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.step-indicator {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.step {
  padding: 2rem;
}

.step-content h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: 600;
}

.description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #00D5DF;
  box-shadow: 0 0 0 3px rgba(0, 213, 223, 0.1);
}

.form-input:disabled {
  background: #f8f9fa;
  opacity: 0.7;
}

.code-input {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5rem;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}

.countdown {
  color: #00D5DF;
  font-weight: 600;
}

.password-requirements {
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.password-requirements small {
  font-size: 0.875rem;
  color: #999;
  transition: color 0.2s;
}

.password-requirements small.valid {
  color: #28a745;
  font-weight: 600;
}

.error-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #dc3545;
}

.submit-btn {
  background: linear-gradient(135deg, #00D5DF 0%, #00bcc7 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(0, 213, 223, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 213, 223, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.resend-btn {
  background: transparent;
  color: #00D5DF;
  border: 2px solid #00D5DF;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  min-width: 150px;
}

.resend-btn:hover:not(:disabled) {
  background: #00D5DF;
  color: white;
}

.resend-btn:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.back-btn {
  background: transparent;
  color: #666;
  border: none;
  padding: 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 1rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #333;
}

.time-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.5rem;
  padding: 1rem;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.warning-icon {
  font-size: 1.2rem;
}

.success-step {
  text-align: center;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background: #d4edda;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success-icon svg {
  width: 2rem;
  height: 2rem;
  color: #28a745;
}

.actions {
  margin-top: 2rem;
}

.login-btn {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  display: inline-block;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.error-message {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .password-reset {
    padding: 1rem;
  }
  
  .reset-container {
    margin: 0;
  }
  
  .reset-header {
    padding: 1.5rem;
  }
  
  .step {
    padding: 1.5rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .password-requirements {
    grid-template-columns: 1fr;
  }
}
</style>