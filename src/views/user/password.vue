<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Modal from '@/components/user/Modal.vue';

const router = useRouter();
const basePath = import.meta.env.VITE_BASE_URL;

// Step 관리 (1: 이메일, 2: 코드, 3: 비밀번호)
const currentStep = ref(1);

// 폼 데이터
const email = ref('');
const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// 상태
const isEmailSent = ref(false);
const isCodeVerified = ref(false);
const emailTimer = ref(0);
const isLoading = ref(false);
const generalError = ref('');

// 모달 상태
const showSuccessModal = ref(false);

// 비밀번호 표시 상태
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const validation = ref({
  email: { touched: false, isValid: false, message: '' },
  password: { touched: false, isValid: false, message: '' },
  confirmPassword: { touched: false, isValid: false, message: '' }
});

// 유효성 검사 함수들
const validateEmail = (email) => {
  if (!email) return { isValid: false, message: '이메일을 입력해주세요.' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  return { isValid: true, message: '' };
};

const validatePassword = (password) => {
  if (!password) return { isValid: false, message: '비밀번호를 입력해주세요.' };
  if (password.length < 8) return { isValid: false, message: '비밀번호는 8자 이상이어야 합니다.' };

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);    
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~;]/.test(password); 

  if (!hasLetter) {
    return { isValid: false, message: '영문자(대문자 또는 소문자)를 포함해야 합니다.' };
  }
  if (!hasNumber) {
    return { isValid: false, message: '숫자를 포함해야 합니다.' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: '특수문자를 포함해야 합니다.' };
  }

  return { isValid: true, message: '사용 가능한 비밀번호입니다.' };
};

const validateConfirmPassword = (confirm, original) => {
  if (!confirm) return { isValid: false, message: '비밀번호 확인을 입력해주세요.' };
  if (confirm !== original) return { isValid: false, message: '비밀번호가 일치하지 않습니다.' };
  return { isValid: true, message: '비밀번호가 일치합니다.' };
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
    const response = await fetch(`${basePath}/api/OTD/email/send-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    });

    if (response.ok) {
      isEmailSent.value = true;
      emailTimer.value = 300;
      validation.value.email.isValid = true;
      validation.value.email.message = '인증코드가 발송되었습니다.';
      currentStep.value = 2;
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

// Step 2: 인증코드 확인
const verifyCode = async () => {
  if (verificationCode.value.length !== 6) return;

  isLoading.value = true;
  try {
    const response = await fetch(`${basePath}/api/OTD/email/verify-password-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        code: verificationCode.value,
      }),
    });

    const result = await response.json();

    if (response.ok && result.result?.verified === true) {
      isCodeVerified.value = true;
      currentStep.value = 3;
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

// Step 3: 비밀번호 변경
const resetPassword = async () => {
  const passwordValidation = validatePassword(newPassword.value);
  const confirmValidation = validateConfirmPassword(confirmPassword.value, newPassword.value);
  
  validation.value.password.touched = true;
  validation.value.confirmPassword.touched = true;
  validation.value.password.isValid = passwordValidation.isValid;
  validation.value.password.message = passwordValidation.message;
  validation.value.confirmPassword.isValid = confirmValidation.isValid;
  validation.value.confirmPassword.message = confirmValidation.message;
  
  if (!passwordValidation.isValid || !confirmValidation.isValid) return;

  isLoading.value = true;
  try {
    const response = await fetch(`${basePath}/api/OTD/email/password-reset`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        newPassword: newPassword.value,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showSuccessModal.value = true; // 모달 표시
    } else {
      generalError.value = result.message || '비밀번호 변경에 실패했습니다.';
      setTimeout(() => (generalError.value = ''), 3000);
    }
  } catch (error) {
    generalError.value = '네트워크 오류가 발생했습니다.';
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// 모달 확인 버튼 클릭 시 페이지 이동
const handleModalConfirm = () => {
  showSuccessModal.value = false;
  router.push('/user/ModifiProfile');
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

const handlePasswordInput = () => {
  if (validation.value.password.touched) {
    const result = validatePassword(newPassword.value);
    validation.value.password.isValid = result.isValid;
    validation.value.password.message = result.message;
  }
  
  if (validation.value.confirmPassword.touched && confirmPassword.value) {
    const result = validateConfirmPassword(confirmPassword.value, newPassword.value);
    validation.value.confirmPassword.isValid = result.isValid;
    validation.value.confirmPassword.message = result.message;
  }
};

const handleConfirmPasswordInput = () => {
  if (validation.value.confirmPassword.touched) {
    const result = validateConfirmPassword(confirmPassword.value, newPassword.value);
    validation.value.confirmPassword.isValid = result.isValid;
    validation.value.confirmPassword.message = result.message;
  }
};

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    router.back();
  }
};
</script>

<template>
  <div class="password-reset-container">
    <div class="header">
      <button @click="handleBack" class="back-button" aria-label="뒤로가기">
        <svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="page-title">비밀번호 재설정</h2>
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
        <div class="step-label">비밀번호</div>
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
            class="input-field"
          />
          <p class="field-hint timer-hint">
            <span v-if="emailTimer > 0">남은 시간: {{ timerDisplay }}</span>
            <span v-else class="expired">인증 시간이 만료되었습니다</span>
          </p>
        </div>

        <button
          type="button"
          class="btn-submit"
          @click="verifyCode"
          :disabled="verificationCode.length !== 6 || isLoading"
        >
          <span v-if="isLoading">확인 중...</span>
          <span v-else>인증 확인</span>
        </button>
      </div>

      <!-- Step 3: 비밀번호 변경 -->
      <div v-if="currentStep === 3">
        <p class="description">새로운 비밀번호를 입력해주세요.</p>

        <div class="form-group">
          <label for="newPassword">새 비밀번호</label>
          <div class="input-wrapper">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="newPassword"
              placeholder="새 비밀번호를 입력하세요"
              v-model="newPassword"
              @input="handlePasswordInput"
              @blur="validation.password.touched = true"
              :class="{
                'input-field': true,
                error: validation.password.touched && !validation.password.isValid,
                success: validation.password.touched && validation.password.isValid,
              }"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="input-icon-button"
            >
              <svg
                v-if="!showPassword"
                class="icon-sm"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                class="icon-sm"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            </button>
          </div>
          <div
            v-if="validation.password.touched && validation.password.message"
            :class="['field-message', validation.password.isValid ? 'field-success' : 'field-error']"
          >
            {{ validation.password.message }}
          </div>
          <p class="field-hint">8자 이상, 영문, 숫자, 특수문자 포함</p>
        </div>

        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <div class="input-wrapper">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              v-model="confirmPassword"
              @input="handleConfirmPasswordInput"
              @blur="validation.confirmPassword.touched = true"
              :class="{
                'input-field': true,
                error: validation.confirmPassword.touched && !validation.confirmPassword.isValid,
                success: validation.confirmPassword.touched && validation.confirmPassword.isValid,
              }"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="input-icon-button"
            >
              <svg
                v-if="!showConfirmPassword"
                class="icon-sm"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <svg
                v-else
                class="icon-sm"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              </svg>
            </button>
          </div>
          <div
            v-if="validation.confirmPassword.touched && validation.confirmPassword.message"
            :class="['field-message', validation.confirmPassword.isValid ? 'field-success' : 'field-error']"
          >
            {{ validation.confirmPassword.message }}
          </div>
        </div>

        <button
          type="button"
          class="btn-submit"
          @click="resetPassword"
          :disabled="isLoading || !validation.password.isValid || !validation.confirmPassword.isValid"
        >
          <span v-if="isLoading">변경 중...</span>
          <span v-else>비밀번호 변경</span>
        </button>
      </div>
    </div>

    <!-- 성공 모달 -->
    <Modal
      :show="showSuccessModal"
      title="비밀번호 변경 완료"
      message="비밀번호가 성공적으로 변경되었습니다."
      type="success"
      confirm-text="확인"
      @confirm="handleModalConfirm"
      @close="handleModalConfirm"
    />
  </div>
</template>

<style scoped>
.password-reset-container {
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

.icon-sm {
  width: 20px;
  height: 20px;
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

.input-wrapper {
  position: relative;
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

.input-wrapper .input-field {
  padding-right: 45px;
}

.input-field:focus {
  outline: none;
  border-color: #393e46;
  box-shadow: 0 0 0 3px rgba(57, 62, 70, 0.1);
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

.input-icon-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  padding: 4px;
}

.input-icon-button:hover {
  color: #333;
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

@media (max-width: 600px) {
  .form-container {
    padding: 20px 16px;
  }

  .input-field {
    padding: 12px 14px;
    font-size: 14px;
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
}
</style>