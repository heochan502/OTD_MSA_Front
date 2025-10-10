<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { checkNicknameDuplicate, updateNickname } from '@/services/user/userService'; 
import { useAuthenticationStore } from '@/stores/user/authentication'; 
import AlertModal from '@/components/user/Modal.vue';

const router = useRouter();
const authStore = useAuthenticationStore(); 
const additionalInfo = ref({
  nickname: ''
});

const validation = ref({
  nickname: {
    touched: false,
    isValid: false,
    message: '',
    checked: false,
    available: false
  }
});

const isLoading = ref(false);
const generalError = ref('');

// 모달 상태
const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info',
  onConfirm: null
});

const showModal = (title, message, type = 'info', onConfirm = null) => {
  modalState.value = {
    show: true,
    title,
    message,
    type,
    onConfirm
  };
};

const closeModal = () => {
  modalState.value.show = false;
};

const handleModalConfirm = () => {
  if (modalState.value.onConfirm) {
    modalState.value.onConfirm();
  }
  closeModal();
};

// 닉네임 유효성 검사
const validateMemberNick = (nickname) => {
  if (!nickname) {
    return { isValid: false, message: '닉네임을 입력해주세요.' };
  }
  if (nickname.length < 2) {
    return { isValid: false, message: '닉네임은 2자 이상이어야 합니다.' };
  }
  if (nickname.length > 10) {
    return {
      isValid: false,
      message: '닉네임은 최대 10자까지 입력 가능합니다.',
    };
  }
  return { isValid: true, message: '' };
};

// 닉네임 중복검사
const checkNicknameDuplicateAction = async () => {
  const nickname = additionalInfo.value.nickname;

  if (!nickname) {
    return;
  }

  const validationResult = validateMemberNick(nickname);
  if (!validationResult.isValid) {
    validation.value.nickname.touched = true;
    validation.value.nickname.isValid = false;
    validation.value.nickname.message = validationResult.message;
    return;
  }

  try {
    isLoading.value = true;
    const response = await checkNicknameDuplicate(nickname);
    
    validation.value.nickname.checked = true;
    const isAvailable = response.data.result?.isAvailable;
    validation.value.nickname.available = isAvailable;
    
    if (isAvailable) {
      validation.value.nickname.message = '사용 가능한 닉네임입니다.';
      validation.value.nickname.isValid = true;
    } else {
      validation.value.nickname.message = '이미 사용중인 닉네임입니다.';
      validation.value.nickname.isValid = false;
    }
  } catch (error) {
    console.error('닉네임 중복 검사 오류:', error);
    generalError.value = '중복 확인 중 오류가 발생했습니다.';
    validation.value.nickname.isValid = false;
    setTimeout(() => (generalError.value = ''), 3000);
  } finally {
    isLoading.value = false;
  }
};

// 닉네임 변경 시 중복검사 상태 초기화
const resetNicknameValidation = () => {
  validation.value.nickname.checked = false;
  validation.value.nickname.available = false;
  if (
    validation.value.nickname.touched &&
    validation.value.nickname.message.includes('사용')
  ) {
    validation.value.nickname.message = '';
  }
};

// 닉네임 변경 제출
const handleSubmit = async () => {
  if (!validation.value.nickname.isValid || !validation.value.nickname.available) {
    return;
  }

  try {
    isLoading.value = true;
    const response = await updateNickname(additionalInfo.value.nickname);
    
    if (response.data?.success) {
      authStore.state.signedUser.nickName = additionalInfo.value.nickname;
      
      showModal(
        '변경 완료',
        '닉네임이 성공적으로 변경되었습니다.',
        'success',
        () => router.push('/user/profile')
      );
    } else {
      throw new Error('닉네임 변경에 실패했습니다.');
    }
  } catch (error) {
    console.error('닉네임 변경 오류:', error);
    
    let errorMessage = '닉네임 변경에 실패했습니다.';
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;
      
      if (status === 400) {
        errorMessage = message || '잘못된 요청입니다.';
      } else if (status === 401) {
        errorMessage = '로그인이 필요합니다.';
        showModal(
          '인증 오류',
          errorMessage,
          'warning',
          () => router.push('/user/login')
        );
        return;
      } else if (status === 409) {
        errorMessage = message || '이미 사용중인 닉네임입니다.';
      } else {
        errorMessage = message || '닉네임 변경에 실패했습니다.';
      }
    } else if (error.request) {
      errorMessage = '서버와 통신할 수 없습니다.';
    }
    
    showModal('변경 실패', errorMessage, 'error');
  } finally {
    isLoading.value = false;
  }
};

// 뒤로가기
const handleBack = () => {
  router.back();
};
</script>

<template>
  <div class="nickname-edit-container">
    <div class="header">
      <button @click="handleBack" class="back-button" aria-label="뒤로가기">
        <svg class="icon-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 class="page-title">닉네임 수정</h2>
      <div class="placeholder"></div>
    </div>

    <div v-if="generalError" class="error-banner">
      <span class="error-icon">⚠</span>
      {{ generalError }}
    </div>
    
    <div class="form-container">
      <div class="form-group">
        <label for="nickname">닉네임</label>
        <div class="input-wrapper">
          <input
            type="text"
            id="nickname"
            placeholder="닉네임을 입력해 주세요 (2~10자)"
            v-model="additionalInfo.nickname"
            :class="{
              'input-field-with-button': true,
              error: validation.nickname.touched && !validation.nickname.isValid,
              success: validation.nickname.touched && validation.nickname.isValid && validation.nickname.available,
            }"
            @blur="validation.nickname.touched = true"
            @input="resetNicknameValidation"
            maxlength="10"
          />
          <button
            type="button"
            class="btn-small"
            @click="checkNicknameDuplicateAction"
            :disabled="isLoading || !additionalInfo.nickname"
          >
            <span v-if="isLoading">확인중...</span>
            <span v-else>중복확인</span>
          </button>
        </div>
        <div
          v-if="validation.nickname.touched && validation.nickname.message"
          :class="[
            'field-message',
            validation.nickname.isValid && validation.nickname.available ? 'field-success' : 'field-error',
          ]"
        >
          {{ validation.nickname.message }}
        </div>
        <p class="field-hint">
          닉네임은 2자 이상 10자 이하로 입력해주세요.
        </p>
      </div>

      <button 
        type="button" 
        class="btn-submit"
        :disabled="!validation.nickname.isValid || !validation.nickname.available || isLoading"
        @click="handleSubmit"
      >
        <span v-if="isLoading">변경중...</span>
        <span v-else>변경하기</span>
      </button>
    </div>

    <!-- 모달 컴포넌트 -->
    <AlertModal
      :show="modalState.show"
      :title="modalState.title"
      :message="modalState.message"
      :type="modalState.type"
      @close="closeModal"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<style scoped>
.nickname-edit-container {
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
  margin-bottom: 24px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.input-field-with-button {
  flex: 1;
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: #fff;
}

.input-field-with-button:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.input-field-with-button.error {
  border-color: #f44336;
  background-color: #fff5f5;
}

.input-field-with-button.success {
  border-color: #4CAF50;
  background-color: #f0fdf4;
}

.btn-small {
  flex-shrink: 0;
  padding: 14px 20px;
  background: #555;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 90px;
}

.btn-small:hover:not(:disabled) {
  background: #333;
  transform: translateY(-1px);
}

.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #999;
  transform: none;
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
  margin-top: 16px;
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

/* 반응형 */
@media (max-width: 600px) {
  .form-container {
    padding: 20px 16px;
  }

  .input-field-with-button {
    padding: 12px 14px;
    font-size: 14px;
  }

  .btn-small {
    padding: 12px 16px;
    font-size: 13px;
    min-width: 80px;
  }
}
</style>