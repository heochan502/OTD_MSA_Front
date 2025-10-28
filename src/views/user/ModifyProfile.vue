<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { deleteUser } from '@/services/user/userService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import AlertModal from '@/components/user/Modal.vue';

const router = useRouter();
const authenticationStore = useAuthenticationStore();

// 모달 상태
const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info',
  onConfirm: null,
  onCancel: null
});

const showModal = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
  modalState.value = {
    show: true,
    title,
    message,
    type,
    onConfirm,
    onCancel
  };
};

const goBack = () => {
  router.back();
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

const handleModalCancel = () => {
  if (modalState.value.onCancel) {
    modalState.value.onCancel();
  }
  closeModal();
};

const userId = authenticationStore.state.signedUser?.userId;

const remove = async () => {
  showModal(
    '회원 탈퇴',
    '정말 회원 탈퇴하시겠습니까?',
    'confirm',
    async () => {
      try {
        const res = await deleteUser(userId);
        if (res.status === 200) {
          showModal(
            '탈퇴 완료',
            '회원 탈퇴가 완료되었습니다.',
            'success',
            async () => {
              await authenticationStore.logout();
              localStorage.clear();
              sessionStorage.clear();
              router.push('/user/login');
            }
          );
        } else {
          showModal('탈퇴 실패', '회원 탈퇴에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('회원탈퇴 에러:', error);
        showModal('오류 발생', '오류가 발생했습니다.', 'error');
      }
    }
  );
};
</script>

<template>
  <div class="profile-container">
    <div class="settings-section">
      <h3 class="section-title">정보수정</h3>
      
      <div class="settings-list">
        <router-link to="/user/nickname" class="settings-item">
          <div class="settings-icon">👤</div>
          <span>닉네임수정</span>
          <div class="arrow">›</div>
        </router-link>
      </div>
      
      <div class="settings-list">
        <router-link to="/user/email" class="settings-item">
          <div class="settings-icon">📧</div>
          <span>이메일수정</span>
          <div class="arrow">›</div>
        </router-link>
      </div>
      
      <div class="settings-list">
        <router-link to="/user/modifypassword" class="settings-item">
          <div class="settings-icon">🔒</div>
          <span>비밀번호 재설정</span>
          <div class="arrow">›</div>
        </router-link>
      </div>
      
      <div class="settings-list">
        <button @click="remove" class="settings-item">
          <div class="settings-icon">🚪</div>
          <span>회원탈퇴</span>
          <div class="arrow">›</div>
        </button>
      </div>
      <div class="top-buttons">
      <button @click="goBack" class="back-btn">
        ← 뒤로가기
      </button>
     
    </div>
    </div>

    <!-- Alert 모달 컴포넌트 -->
    <AlertModal
      :show="modalState.show"
      :title="modalState.title"
      :message="modalState.message"
      :type="modalState.type"
      @close="closeModal"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: 100vh;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.settings-section {
  margin-bottom: 30px;
}

.settings-list {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  margin-bottom: 12px;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  text-decoration: none;
  color: #333;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
}

.settings-item:hover {
  background: #f8f9fa;
}

.settings-icon {
  font-size: 20px;
}

.settings-item span {
  flex: 1;
  font-weight: 500;
}

.arrow {
  font-size: 18px;
  color: #ccc;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 448px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.modal-description {
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.modal-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-buttons {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover {
  background: #2563eb;
}
.top-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: flex-end;
}
.back-btn {
  padding: 10px 20px;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #4b5563;
}

</style>