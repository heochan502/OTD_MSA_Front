<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { updateEmail } from '@/services/user/emailService';

const router = useRouter();
const authStore = useAuthenticationStore();
const basePath = import.meta.env.VITE_BASE_URL;

const email = ref('');
const verificationCode = ref('');
const isEmailSent = ref(false);
const isEmailVerified = ref(false);
const emailTimer = ref(0);
const isLoading = ref(false);
const generalError = ref('');

const validation = ref({
  email: {
    touched: false,
    isValid: false,
    message: ''
  }
});

// 이메일 유효성 검사
const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: '이메일을 입력해주세요.' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  }
  
  return { isValid: true, message: '' };
};

// 이메일 타이머 관리
let timerInterval = null;
watch(emailTimer, (newValue) => {
  if (newValue > 0 && !timerInterval) {
    timerInterval = setInterval(() => {
      emailTimer.value--;
      if (emailTimer.value <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }, 1000);
  }
});

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
});

// 타이머 표시 형식
const timerDisplay = computed(() => {
  const minutes = Math.floor(emailTimer.value / 60);
  const seconds = emailTimer.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// 이메일 인증번호 전송
const sendVerificationEmail = async () => {
  if (!email.value) return;

  const validationResult = validateEmail(email.value);
  if (!validationResult.isValid) {
    validation.value.email.touched = true;
    validation.value.email.isValid = false;
    validation.value.email.message = validationResult.message;
    return;
  }

  isLoading.value = true;
  try {
    const response = await fetch(
      `${basePath}/api/OTD/email/send-verification`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value }),
      }
    );

    if (response.ok) {
      isEmailSent.value = true;
      emailTimer.value = 300;
      validation.value.email.isValid = true;
      validation.value.email.message = '인증코드가 발송되었습니다.';
    } else {
      const error = await response.json();
      generalError.value = error.message || '이메일 발송에 실패했습니다.';
      setTimeout(() => (generalError.value = ''), 3000);
    }
  } catch (error) {
    generalError.value = '네트워크 오류가 발생했습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// 이메일 인증번호 확인
const verifyEmailCode = async () => {
  if (verificationCode.value.length !== 6) return;

  isLoading.value = true;
  try {
    const response = await fetch(`${basePath}/api/OTD/email/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value,
      }),
    });

    const result = await response.json();

    if (response.ok && result.result?.verified === true) {
      isEmailVerified.value = true;
      validation.value.email.message = '이메일 인증이 완료되었습니다.';
    } else {
      generalError.value = result.message || '인증코드가 일치하지 않습니다.';
      setTimeout(() => (generalError.value = ''), 3000);
    }
  } catch (error) {
    generalError.value = '네트워크 오류가 발생했습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// 이메일 변경 제출
const handleSubmit = async () => {
  if (!isEmailVerified.value) {
    generalError.value = '이메일 인증을 완료해주세요.';
    setTimeout(() => (generalError.value = ''), 3000);
    return;
  }

  try {
    isLoading.value = true;
    await updateEmail(email.value);
    
    authStore.state.signedUser.email = email.value;
    
    alert('이메일이 성공적으로 변경되었습니다.');
    router.push('/user/profile');
  } catch (error) {
    console.error('이메일 변경 오류:', error);
    generalError.value = '이메일 변경에 실패했습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// 뒤로가기
const handleBack = () => {
  router.back();
};

// 이메일 입력 변경 시
watch(() => email.value, () => {
  isEmailSent.value = false;
  isEmailVerified.value = false;
  verificationCode.value = '';
  if (validation.value.email.touched) {
    const result = validateEmail(email.value);
    validation.value.email.isValid = result.isValid;
    validation.value.email.message = result.message;
  }
});
</script>

<template>
  <div class="email-edit-container">
    <div class="header">
      <button @click="handleBack" class="back-button" aria-label="뒤로가기">
        <svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="page-title">이메일 수정</h2>
      <div class="placeholder"></div>
    </div>

    <div v-if="generalError" class="error-banner">
      <span class="error-icon">⚠</span>
      {{ generalError }}
    </div>
    
    <div class="form-container">
      <div class="form-group">
        <label for="email">이메일</label>
        <input
          type="email"
          id="email"
          placeholder="이메일을 입력해 주세요"
          v-model="email"
          :class="{
            'input-field': true,
            error: validation.email.touched && !validation.email.isValid,
            success: isEmailVerified,
          }"
          @blur="validation.email.touched = true"
          :disabled="isEmailVerified"
        />
        <div
          v-if="validation.email.touched && validation.email.message"
          :class="[
            'field-message',
            validation.email.isValid || isEmailVerified ? 'field-success' : 'field-error',
          ]"
        >
          {{ validation.email.message }}
        </div>
        <p class="field-hint">
          새로운 이메일 주소를 입력하고 인증을 완료해주세요.
        </p>
      </div>

      <button
        type="button"
        class="btn-verify"
        @click="sendVerificationEmail"
        :disabled="!email || isLoading || emailTimer > 0 || isEmailVerified"
      >
        <span v-if="isLoading">발송 중...</span>
        <span v-else-if="emailTimer > 0">재발송 ({{ timerDisplay }})</span>
        <span v-else-if="isEmailVerified">인증 완료</span>
        <span v-else>인증번호 전송</span>
      </button>

      <div v-if="isEmailSent" class="verification-section">
        <div class="form-group">
          <label for="verificationCode">인증번호</label>
          <input
            type="text"
            id="verificationCode"
            placeholder="인증번호 6자리를 입력해주세요"
            v-model="verificationCode"
            maxlength="6"
            class="input-field"
            :disabled="isEmailVerified"
          />
          <p class="field-hint timer-hint">
            <span v-if="emailTimer > 0">남은 시간: {{ timerDisplay }}</span>
            <span v-else class="expired">인증 시간이 만료되었습니다</span>
          </p>
        </div>

        <button
          type="button"
          class="btn-verify-code"
          @click="verifyEmailCode"
          :disabled="verificationCode.length !== 6 || isLoading || isEmailVerified"
        >
          <span v-if="isLoading">확인 중...</span>
          <span v-else-if="isEmailVerified">✓ 인증 완료</span>
          <span v-else>인증번호 확인</span>
        </button>
      </div>

      <button 
        type="button" 
        class="btn-submit"
        :disabled="!isEmailVerified || isLoading"
        @click="handleSubmit"
      >
        <span v-if="isLoading">변경중...</span>
        <span v-else>변경하기</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.email-edit-container {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  color: #333;
  transition: color 0.2s ease;
}

.back-button:hover {
  color: #000;
}

.icon-md {
  width: 24px;
  height: 24px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.placeholder {
  width: 32px;
}

.error-banner {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 20px;
  margin: 16px 20px;
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

.error-icon {
  font-weight: bold;
}

.form-container {
  padding: 24px 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.input-field {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: #fff;
}

.input-field:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.input-field:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
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
  padding: 4px 0;
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
  color: #666;
  margin: 0;
  padding: 0;
}

.timer-hint {
  font-weight: 500;
  color: #4CAF50;
}

.timer-hint .expired {
  color: #f44336;
}

.btn-verify,
.btn-verify-code {
  width: 100%;
  padding: 14px 16px;
  background: #555;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.btn-verify:hover:not(:disabled),
.btn-verify-code:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
}

.btn-verify:disabled,
.btn-verify-code:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #999;
  transform: none;
}

.verification-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.btn-submit {
  width: 100%;
  padding: 16px;
  background: #393e46;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 24px;
}

.btn-submit:hover:not(:disabled) {
  background: #2a2e35;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(57, 62, 70, 0.3);
}

.btn-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 600px) {
  .form-container {
    padding: 20px 16px;
  }

  .input-field {
    padding: 12px 14px;
    font-size: 14px;
  }

  .btn-verify,
  .btn-verify-code {
    padding: 12px 14px;
    font-size: 14px;
  }
}
</style>