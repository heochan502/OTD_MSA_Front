<script setup>
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

// 닉네임중복검사
const checkNicknameDuplicateAction = async () => {
  const nickname = additionalInfo.value.nickname; // accountInfo -> additionalInfo로 수정

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
    isLoading.value = true
    const response = await checkUidDuplicate(nickname)  // import된 서비스 함수 호출
    
    validation.value.nickname.checked = true
    validation.value.nickname.available = response.data.result.isAvailable
    
    if (response.data.result.isAvailable) {
      validation.value.nickname.message = '사용 가능한 닉네임입니다.';
      validation.value.nickname.isValid = true;
    } else {
      validation.value.nickname.message = '이미 사용중인 닉네임입니다.';
      validation.value.nickname.isValid = false;
    }
  } catch (error) {
    console.error('닉네임 중복 검사 오류:', error);
    generalError.value = '중복 확인 중 오류가 발생했습니다.';
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
    // uid -> nickname
    validation.value.nickname.message = '';
  }
};


</script>

<template>
 <!-- 닉네임 입력 및 중복검사 -->
 <div class="form-group">
            <label for="nickname"></label>
            <div class="input-wrapper">
              <input
                type="text"
                id="nickname"
                placeholder="닉네임을 입력해 주세요 (2~10자)"
                v-model="additionalInfo.nickname"
                :class="{
                  'input-field-with-button': true,
                  error:
                    validation.nickname.touched && !validation.nickname.isValid,
                  success:
                    validation.nickname.touched &&
                    validation.nickname.isValid &&
                    validation.nickname.available,
                }"
                @blur="validation.nickname.touched = true"
                maxlength="10"
              />
              <button
                type="button"
                class="btn-small"
                @click="checkNicknameDuplicateAction"
                :disabled="isLoading"
              >
                <span v-if="isLoading">확인중...</span>
                <span v-else>중복확인</span>
              </button>
            </div>
            <div
              v-if="validation.nickname.touched && validation.nickname.message"
              :class="[
                'field-message',
                validation.nickname.isValid && validation.nickname.available
                  ? 'field-success'
                  : 'field-error',
              ]"
            >
              {{ validation.nickname.message }}
            </div>
          </div>
    
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>