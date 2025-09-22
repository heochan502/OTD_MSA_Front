<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthenticationStore } from '@/stores/user/authentication';
import {
  getUserProfile,
  patchUserProfilePic,
  deleteUserProfilePic,
  changePassword,
} from '@/services/userService';

// 스토어
const authStore = useAuthenticationStore();

// 반응형 데이터
const isLoading = ref(true);
const isUploading = ref(false);
const isChangingPassword = ref(false);
const error = ref('');
const profileData = ref(null);
const showPasswordModal = ref(false);
const fileInput = ref(null);

// 비밀번호 변경 폼
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 컴퓨티드
const profileImageUrl = computed(() => {
  if (profileData.value?.pic) {
    return `http://localhost:8080/uploads/profile/${profileData.value.userId}/${profileData.value.pic}`;
  }
  return '/default-profile.png'; // 기본 프로필 이미지
});

const passwordsMatch = computed(() => {
  return passwordForm.value.newPassword === passwordForm.value.confirmPassword;
});

const canSubmitPassword = computed(() => {
  return (
    passwordForm.value.currentPassword &&
    passwordForm.value.newPassword &&
    passwordForm.value.confirmPassword &&
    passwordsMatch.value &&
    passwordForm.value.newPassword.length >= 10
  );
});

// 메서드
const loadProfile = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const response = await getUserProfile({
      profile_user_id: authStore.state.signedUser.userId,
    });

    if (response.data.resultCode === 1) {
      profileData.value = response.data.resultData;
    } else {
      throw new Error(
        response.data.message || '프로필 정보를 불러올 수 없습니다.'
      );
    }
  } catch (err) {
    console.error('프로필 로딩 에러:', err);
    error.value =
      err.message || '프로필 정보를 불러오는 중 오류가 발생했습니다.';
  } finally {
    isLoading.value = false;
  }
};

const refreshProfile = () => {
  loadProfile();
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 크기 제한 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('파일 크기는 5MB 이하여야 합니다.');
    return;
  }

  // 파일 타입 확인
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드 가능합니다.');
    return;
  }

  isUploading.value = true;

  try {
    const formData = new FormData();
    formData.append('pic', file);

    const response = await patchUserProfilePic(formData);

    if (response.data.resultCode === 1) {
      // 스토어의 프로필 이미지 업데이트
      authStore.setSigndUserPic(response.data.resultData);

      // 프로필 데이터 새로고침
      await loadProfile();

      alert('프로필 이미지가 성공적으로 변경되었습니다.');
    } else {
      throw new Error(response.data.message || '이미지 업로드에 실패했습니다.');
    }
  } catch (err) {
    console.error('이미지 업로드 에러:', err);
    alert(err.message || '이미지 업로드 중 오류가 발생했습니다.');
  } finally {
    isUploading.value = false;
    // 파일 인풋 초기화
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const deleteImage = async () => {
  if (!confirm('프로필 이미지를 삭제하시겠습니까?')) {
    return;
  }

  isUploading.value = true;

  try {
    const response = await deleteUserProfilePic();

    if (response.data.resultCode === 1) {
      // 스토어의 프로필 이미지 업데이트
      authStore.setSigndUserPic(null);

      // 프로필 데이터 새로고침
      await loadProfile();

      alert('프로필 이미지가 삭제되었습니다.');
    } else {
      throw new Error(response.data.message || '이미지 삭제에 실패했습니다.');
    }
  } catch (err) {
    console.error('이미지 삭제 에러:', err);
    alert(err.message || '이미지 삭제 중 오류가 발생했습니다.');
  } finally {
    isUploading.value = false;
  }
};

const changePassword = async () => {
  if (!canSubmitPassword.value) return;

  isChangingPassword.value = true;

  try {
    const response = await changePassword(passwordForm.value);

    if (response.data.resultCode === 1) {
      alert('비밀번호가 성공적으로 변경되었습니다.');
      closePasswordModal();
    } else {
      throw new Error(response.data.message || '비밀번호 변경에 실패했습니다.');
    }
  } catch (err) {
    console.error('비밀번호 변경 에러:', err);
    alert(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
  } finally {
    isChangingPassword.value = false;
  }
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
};

const handleImageError = (event) => {
  event.target.src = '/default-profile.png';
};

// 포맷팅 함수들
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
};

const formatBirthDate = (birthDate) => {
  if (!birthDate) return '';
  return new Date(birthDate).toLocaleDateString('ko-KR');
};

const formatGender = (gender) => {
  const genderMap = { M: '남성', F: '여성', OTHER: '기타' };
  return genderMap[gender] || gender;
};

const formatDate = (dateTime) => {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString('ko-KR');
};

// 라이프사이클
onMounted(() => {
  loadProfile();
});
</script>

<template>
  <div class="user-profile">
    <div class="profile-header">
      <h2>프로필 관리</h2>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>프로필 정보를 불러오는 중...</p>
    </div>

    <!-- 프로필 정보 -->
    <div v-else-if="profileData" class="profile-content">
      <!-- 프로필 이미지 섹션 -->
      <div class="profile-image-section">
        <div class="image-container">
          <img
            :src="profileImageUrl"
            :alt="profileData.nickName + '의 프로필 이미지'"
            class="profile-image"
            @error="handleImageError"
          />
          <div class="image-overlay">
            <button
              @click="triggerFileInput"
              class="change-image-btn"
              :disabled="isUploading"
            >
              {{ isUploading ? '업로드 중...' : '이미지 변경' }}
            </button>
          </div>
        </div>

        <div class="image-controls">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            style="display: none"
          />
          <button
            v-if="profileData.pic"
            @click="deleteImage"
            class="delete-btn"
            :disabled="isUploading"
          >
            이미지 삭제
          </button>
        </div>
      </div>

      <!-- 사용자 정보 -->
      <div class="profile-info">
        <div class="info-group">
          <label>사용자 ID</label>
          <p>{{ profileData.userId }}</p>
        </div>

        <div class="info-group">
          <label>아이디</label>
          <p>{{ profileData.uid }}</p>
        </div>

        <div class="info-group">
          <label>닉네임</label>
          <p>{{ profileData.nickName || '설정되지 않음' }}</p>
        </div>

        <div class="info-group">
          <label>이메일</label>
          <p>{{ profileData.email }}</p>
        </div>

        <div class="info-group" v-if="profileData.phone">
          <label>전화번호</label>
          <p>{{ formatPhoneNumber(profileData.phone) }}</p>
        </div>

        <div class="info-group" v-if="profileData.birthDate">
          <label>생년월일</label>
          <p>{{ formatBirthDate(profileData.birthDate) }}</p>
        </div>

        <div class="info-group" v-if="profileData.gender">
          <label>성별</label>
          <p>{{ formatGender(profileData.gender) }}</p>
        </div>

        <div class="info-group">
          <label>가입일</label>
          <p>{{ formatDate(profileData.createdAt) }}</p>
        </div>

        <div class="info-group" v-if="profileData.lastLoginAt">
          <label>최근 로그인</label>
          <p>{{ formatDate(profileData.lastLoginAt) }}</p>
        </div>
      </div>

      <!-- 액션 버튼들 -->
      <div class="profile-actions">
        <button @click="showPasswordModal = true" class="action-btn primary">
          비밀번호 변경
        </button>
        <button @click="refreshProfile" class="action-btn secondary">
          정보 새로고침
        </button>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadProfile" class="retry-btn">다시 시도</button>
    </div>

    <!-- 비밀번호 변경 모달 -->
    <div
      v-if="showPasswordModal"
      class="modal-overlay"
      @click="closePasswordModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>비밀번호 변경</h3>
          <button @click="closePasswordModal" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="changePassword" class="password-form">
          <div class="form-group">
            <label for="currentPassword">현재 비밀번호</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              :disabled="isChangingPassword"
            />
          </div>

          <div class="form-group">
            <label for="newPassword">새 비밀번호</label>
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              required
              title="영문자, 숫자, 특수기호로 구성되며 10자 이상이어야 합니다."
              :disabled="isChangingPassword"
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">새 비밀번호 확인</label>
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              :disabled="isChangingPassword"
            />
            <small
              v-if="
                passwordForm.newPassword &&
                passwordForm.confirmPassword &&
                !passwordsMatch
              "
              class="error-text"
            >
              비밀번호가 일치하지 않습니다.
            </small>
          </div>

          <div class="modal-actions">
            <button
              type="submit"
              class="submit-btn"
              :disabled="!canSubmitPassword || isChangingPassword"
            >
              {{ isChangingPassword ? '변경 중...' : '변경하기' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.profile-header h2 {
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00d5df;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.profile-content {
  display: grid;
  gap: 2rem;
}

.profile-image-section {
  text-align: center;
}

.image-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #00d5df;
  transition: opacity 0.3s;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.change-image-btn {
  background: white;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.change-image-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.change-image-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}

.profile-info {
  display: grid;
  gap: 1rem;
}

.info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.info-group label {
  font-weight: 600;
  color: #666;
  min-width: 100px;
}

.info-group p {
  margin: 0;
  color: #333;
  text-align: right;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
}

.action-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #00d5df;
  color: white;
}

.action-btn.primary:hover {
  background: #00bcc7;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background: #5a6268;
}

.error-state {
  text-align: center;
  padding: 3rem;
  color: #dc3545;
}

.retry-btn {
  background: #00d5df;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  margin-top: 1rem;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.password-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #00d5df;
}

.form-group input:disabled {
  background: #f8f9fa;
  opacity: 0.6;
}

.help-text {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
  display: block;
}

.error-text {
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.submit-btn {
  background: #00d5df;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .user-profile {
    margin: 1rem;
    padding: 1rem;
  }

  .profile-actions {
    flex-direction: column;
  }

  .modal-content {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
