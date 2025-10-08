<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';
import AlertModal from '@/components/user/Modal.vue';

const router = useRouter();
const authStore = useAuthenticationStore();

const state = reactive({
  memo: {
    id: 0,
    title: '',
    content: '',
    createdAt: ''
  },
  isLoading: false
});

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

// 입력 검증 함수
const validateInput = () => {
  if (!state.memo.title.trim()) {
    showModal('입력 오류', '제목을 입력해주세요.', 'warning');
    return false;
  }
  if (!state.memo.content.trim()) {
    showModal('입력 오류', '내용을 입력해주세요.', 'warning');
    return false;
  }
  return true;
};

// 직접 이메일 전송 함수
const sendEmailInquiry = async () => {
  if (!validateInput()) return;

  // 로그인 확인
  if (!authStore.state.isSigned || !authStore.state.signedUser.userId) {
    showModal(
      '로그인 필요', 
      '로그인이 필요한 서비스입니다.', 
      'warning',
      () => router.push('/login')
    );
    return;
  }

  state.isLoading = true;

  try {
    const emailData = {
      subject: state.memo.title,
      message: state.memo.content,
      senderName: authStore.state.signedUser.nickName || '웹사이트 방문자',
      senderEmail: authStore.state.signedUser.email, 
      timestamp: new Date().toISOString()
    };

    const response = await fetch('http://localhost:8080/api/OTD/email/sendMunhe', { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('서버 응답:', text);
      
      if (response.status === 401) {
        showModal(
          '세션 만료',
          '로그인 세션이 만료되었습니다.\n다시 로그인해주세요.',
          'warning',
          async () => {
            await authStore.logout();
            router.push('/login');
          }
        );
        return;
      }
      
      showModal('전송 실패', '문의 전송 중 오류가 발생했습니다.', 'error');
      return;
    }

    const result = await response.json();

    if (result.result?.success) {
      showModal(
        '전송 완료',
        result.message || '문의가 성공적으로 전송되었습니다!',
        'success',
        () => {
          state.memo.title = '';
          state.memo.content = '';
        }
      );
    } else {
      showModal('전송 실패', result.message || '문의 전송에 실패했습니다.', 'error');
    }
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    showModal(
      '전송 오류',
      '문의 전송 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      'error'
    );
  } finally {
    state.isLoading = false;
  }
};
</script>

<template>
  <div class="detail">
    <div class="mb-3" v-if="state.memo.createdAt">
      등록일시: {{ state.memo.createdAt }}
    </div>
    <div class="mb-3">
      <label for="title" class="form-label">제목</label>
      <input 
        type="text" 
        id="title" 
        class="form-control p-3" 
        v-model="state.memo.title" 
        placeholder="문의 제목을 입력해주세요"
        :disabled="state.isLoading"
      />
    </div>
    <div class="mb-3">
      <label for="content" class="form-label">내용</label>
      <textarea 
        id="content" 
        class="form-control p-3" 
        v-model="state.memo.content"
        rows="8"
        placeholder="문의 내용을 자세히 입력해주세요"
        :disabled="state.isLoading"
      ></textarea>
    </div>
    
    <button 
      type="button" 
      class="btn btn-primary w-100 py-3" 
      @click="sendEmailInquiry"
      :disabled="state.isLoading"
    >
      <span v-if="state.isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ state.isLoading ? '전송 중...' : '문의하기' }}
    </button>

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
.detail {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: 100vh;
}

.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.form-control:disabled {
  background-color: #f8f9fa;
  opacity: 0.8;
}
</style>