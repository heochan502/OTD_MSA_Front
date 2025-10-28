<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Modal from '@/components/user/Modal.vue';
import { sendFindIdCode, verifyFindIdCode } from '@/services/user/emailService';

const router = useRouter();
const basePath = import.meta.env.VITE_BASE_URL;

// Step 관리 (1: 이메일, 2: 코드 확인, 3: 결과)
const currentStep = ref(1);

// 폼 데이터
const email = ref('');
const verificationCode = ref('');
const foundUserId = ref('');

// 상태
const isEmailSent = ref(false);
const isCodeVerified = ref(false);
const emailTimer = ref(0);
const isLoading = ref(false);
const generalError = ref('');

// 모달 상태
const showResultModal = ref(false);

const validation = ref({
  email: { touched: false, isValid: false, message: '' }
});

// 유효성 검사 함수
const validateEmail = (email) => {
  if (!email) return { isValid: false, message: '이메일을 입력해주세요.' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  return { isValid: true, message: '' };
};

// Step 1: 이메일 인증코드 발송
const sendVerificationCode = async () => {
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
    const response = await sendFindIdCode({ email: email.value });

    if (response.status === 200) {
      isEmailSent.value = true;
      emailTimer.value = 300;
      validation.value.email.isValid = true;
      validation.value.email.message = '인증코드가 발송되었습니다.';
      currentStep.value = 2;
    }
  } catch (error) {
    generalError.value = error.response?.data?.message || '해당 이메일로 가입된 계정이 없습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// Step 2: 인증코드 확인 및 아이디 조회
const verifyCodeAndFindId = async () => {
  if (verificationCode.value.length !== 6) return;

  isLoading.value = true;
  try {
    const response = await verifyFindIdCode({
      email: email.value,
      code: verificationCode.value,
    });

    if (response.status === 200 && response.data.success) {
      isCodeVerified.value = true;
      foundUserId.value = response.data.userId;
      currentStep.value = 3;
    }
  } catch (error) {
    generalError.value = error.response?.data?.message || '인증코드가 일치하지 않습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/user/login');
};

// 비밀번호 찾기로 이동
const goToFindPassword = () => {
  router.push('/user/password');
};

// 처음으로
const resetForm = () => {
  currentStep.value = 1;
  email.value = '';
  verificationCode.value = '';
  foundUserId.value = '';
  isEmailSent.value = false;
  isCodeVerified.value = false;
  emailTimer.value = 0;
  validation.value.email = { touched: false, isValid: false, message: '' };
};

// 타이머 관리
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
  if (timerInterval) clearInterval(timerInterval);
});

const timerDisplay = computed(() => {
  const minutes = Math.floor(emailTimer.value / 60);
  const seconds = emailTimer.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    router.back();
  }
};
</script>

<template>
  <div class="find-id-container">
    <div class="header">
      <button @click="handleBack" class="back-button" aria-label="뒤로가기">
        <svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="page-title">아이디 찾기</h2>
      <div class="placeholder"></div>
    </div>

    <!-- Step Indicator -->
    <div class="step-indicator">
      <div :class="['step', { active: currentStep >= 1, completed: currentStep > 1 }]">
        <div class="step-number">1</div>
        <div class="step-label">이메일</div>
      </div>
      <div :class="['step-line', { active: currentStep >= 2 }]"></div>
      <div :class="['step', { active: currentStep >= 2, completed: currentStep > 2 }]">
        <div class="step-number">2</div>
        <div class="step-label">코드확인</div>
      </div>
      <div :class="['step-line', { active: currentStep >= 3 }]"></div>
      <div :class="['step', { active: currentStep >= 3 }]">
        <div class="step-number">3</div>
        <div class="step-label">완료</div>
      </div>
    </div>

    <div v-if="generalError" class="error-banner">
      <span class="error-icon">⚠</span>
      {{ generalError }}
    </div>

    <div class="form-container">
      <!-- Step 1: 이메일 입력 -->
      <div v-if="currentStep === 1">
        <p class="description">
          가입하신 이메일 주소를 입력해주세요.<br />
          인증코드를 전송해드립니다.
        </p>

        <div class="form-group">
          <label for="email">이메일</label>
          <input
            type="email"
            id="email"
            placeholder="이메일을 입력하세요"
            v-model="email"
            :class="{
              'input-field': true,
              error: validation.email.touched && !validation.email.isValid,
              success: validation.email.isValid,
            }"
            @blur="validation.email.touched = true"
            @keyup.enter="sendVerificationCode"
          />
          <div
            v-if="validation.email.touched && validation.email.message"
            :class="['field-message', validation.email.isValid ? 'field-success' : 'field-error']"
          >
            {{ validation.email.message }}
          </div>
        </div>

        <button
          type="button"
          class="btn-submit"
          @click="sendVerificationCode"
          :disabled="!email || isLoading"
        >
          <span v-if="isLoading">발송 중...</span>
          <span v-else>인증코드 전송</span>
        </button>
      </div>

      <!-- Step 2: 코드 확인 -->
      <div v-if="currentStep === 2">
        <p class="description">
          <strong>{{ email }}</strong>로<br />
          인증코드를 전송했습니다.
        </p>

        <div class="form-group">
          <label for="verificationCode">인증코드</label>
          <input
            type="text"
            id="verificationCode"
            placeholder="6자리 코드를 입력하세요"
            v-model="verificationCode"
            maxlength="6"
            class="input-field code-input"
            @input="verificationCode = verificationCode.replace(/\D/g, '')"
            @keyup.enter="verifyCodeAndFindId"
          />
          <p class="field-hint timer-hint">
            <span v-if="emailTimer > 0">남은 시간: {{ timerDisplay }}</span>
            <span v-else class="expired">인증 시간이 만료되었습니다</span>
          </p>
        </div>

        <button
          type="button"
          class="btn-submit"
          @click="verifyCodeAndFindId"
          :disabled="verificationCode.length !== 6 || isLoading"
        >
          <span v-if="isLoading">확인 중...</span>
          <span v-else>인증 확인</span>
        </button>

        <button
          type="button"
          class="btn-secondary"
          @click="resetForm"
        >
          다시 입력하기
        </button>
      </div>

      <!-- Step 3: 결과 표시 -->
      <div v-if="currentStep === 3" class="result-container">
        <div class="success-icon">
          <svg class="icon-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <p class="result-label">회원님의 아이디는</p>
        
        <div class="user-id-box">
          <p class="user-id">{{ foundUserId }}</p>
        </div>
        
        <p class="result-sublabel">입니다.</p>

        <div class="action-buttons">
          <button
            type="button"
            class="btn-submit"
            @click="goToLogin"
          >
            로그인하기
          </button>

          <button
            type="button"
            class="btn-secondary"
            @click="goToFindPassword"
          >
            비밀번호 찾기
          </button>

          <button
            type="button"
            class="btn-text"
            @click="resetForm"
          >
            다시 찾기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.find-id-container {
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

.icon-xl {
  width: 64px;
  height: 64px;
  color: #4CAF50;
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

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  gap: 8px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #393e46;
  color: white;
}

.step.completed .step-number {
  background: #4CAF50;
  color: white;
}

.step-label {
  font-size: 11px;
  color: #999;
  font-weight: 500;
  white-space: nowrap;
}

.step.active .step-label,
.step.completed .step-label {
  color: #333;
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e0e0e0;
  max-width: 40px;
  transition: all 0.3s ease;
}

.step-line.active {
  background: #393e46;
}

.error-banner {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 20px;
  margin: 0 20px 16px;
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

.description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 24px 0;
  text-align: center;
  font-size: 14px;
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
  border-color: #393e46;
  box-shadow: 0 0 0 3px rgba(57, 62, 70, 0.1);
}

.input-field.error {
  border-color: #f44336;
  background-color: #fff5f5;
}

.input-field.success {
  border-color: #4CAF50;
  background-color: #f0fdf4;
}

.code-input {
  text-align: center;
  font-size: 24px;
  letter-spacing: 0.5em;
  font-weight: 600;
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
  text-align: center;
}

.timer-hint .expired {
  color: #f44336;
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
  margin-top: 8px;
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

.btn-secondary {
  width: 100%;
  padding: 16px;
  background: #f3f4f6;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-text {
  width: 100%;
  padding: 12px;
  background: none;
  color: #666;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-top: 4px;
}

.btn-text:hover {
  color: #333;
  text-decoration: underline;
}

.result-container {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  animation: scaleIn 0.4s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.result-label {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.user-id-box {
  background: #f0fdf4;
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 20px;
  margin: 0 0 12px 0;
}

.user-id {
  font-size: 28px;
  font-weight: 700;
  color: #4CAF50;
  margin: 0;
  letter-spacing: 0.02em;
}

.result-sublabel {
  color: #666;
  font-size: 14px;
  margin: 0 0 32px 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 600px) {
  .form-container {
    padding: 20px 16px;
  }

  .input-field {
    padding: 12px 14px;
    font-size: 14px;
  }

  .code-input {
    font-size: 20px;
  }

  .step-indicator {
    padding: 20px 16px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 13px;
  }

  .step-label {
    font-size: 10px;
  }

  .user-id {
    font-size: 24px;
  }
}
</style>