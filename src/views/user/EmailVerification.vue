<script setup>
import { ref } from 'vue'
import { sendEmailVerification, verifyEmailCode } from '@/services/emailService'

const email = ref('')
const verificationCode = ref('')
const isLoading = ref(false)
const codeSent = ref(false)
const isVerified = ref(false)
const countdown = ref(0)

const sendVerificationCode = async () => {
  isLoading.value = true
  try {
    await sendEmailVerification({ email: email.value })
    codeSent.value = true
    startCountdown()
  } catch (error) {
    alert(error.message)
  } finally {
    isLoading.value = false
  }
}

const verifyCode = async () => {
  isLoading.value = true
  try {
    await verifyEmailCode({ 
      email: email.value, 
      code: verificationCode.value 
    })
    isVerified.value = true
  } catch (error) {
    alert(error.message)
  } finally {
    isLoading.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}
</script>
<template>
  <div class="email-verification">
    <div class="input-group">
      <input 
        v-model="email" 
        type="email" 
        placeholder="이메일을 입력하세요"
        :disabled="isLoading"
      />
      <button 
        @click="sendVerificationCode" 
        :disabled="!email || isLoading || countdown > 0"
        class="send-btn"
      >
        {{ countdown > 0 ? `${countdown}초 후 재전송` : '인증코드 발송' }}
      </button>
    </div>
    
    <div v-if="codeSent" class="verification-group">
      <input 
        v-model="verificationCode" 
        type="text" 
        placeholder="인증코드 6자리"
        maxlength="6"
        :disabled="isLoading"
      />
      <button 
        @click="verifyCode" 
        :disabled="!verificationCode || isLoading"
        class="verify-btn"
      >
        인증 확인
      </button>
    </div>
    
    <div v-if="isVerified" class="success-message">
      ✅ 이메일 인증이 완료되었습니다!
    </div>
  </div>
</template>
