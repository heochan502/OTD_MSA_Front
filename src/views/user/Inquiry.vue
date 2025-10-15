<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication';
import AlertModal from '@/components/user/Modal.vue';

const router = useRouter();
const authStore = useAuthenticationStore();
const BASE_URL = import.meta.env.VITE_BASE_URL;
const state = reactive({
  memo: {
    id: 0,
    title: '',
    content: '',
    createdAt: '',
  },
  isLoading: false,
});

const modal = reactive({
  show: false,
  title: '',
  message: '',
  type: 'info',
  confirmText: '확인',
  cancelText: '취소',
  onConfirm: null,
  onCancel: null,
});

const showModal = (config) => {
  modal.show = true;
  modal.title = config.title || '';
  modal.message = config.message || '';
  modal.type = config.type || 'info';
  modal.confirmText = config.confirmText || '확인';
  modal.cancelText = config.cancelText || '취소';
  modal.onConfirm = config.onConfirm || null;
  modal.onCancel = config.onCancel || null;
};

const closeModal = () => {
  modal.show = false;
};

const handleModalConfirm = () => {
  if (modal.onConfirm) {
    modal.onConfirm();
  }
};

const handleModalCancel = () => {
  if (modal.onCancel) {
    modal.onCancel();
  }
};

const validateInput = () => {
  if (!state.memo.title.trim()) {
    showModal({
      type: 'warning',
      title: '입력 오류',
      message: '제목을 입력해주세요.',
    });
    return false;
  }
  if (!state.memo.content.trim()) {
    showModal({
      type: 'warning',
      title: '입력 오류',
      message: '내용을 입력해주세요.',
    });
    return false;
  }
  return true;
};

const goBack = () => {
  if (state.memo.title.trim() || state.memo.content.trim()) {
    showModal({
      type: 'confirm',
      title: '페이지 나가기',
      message: '작성 중인 내용이 있습니다.\n페이지를 나가시겠습니까?',
      confirmText: '나가기',
      cancelText: '취소',
      onConfirm: () => {
        router.back();
      },
    });
  } else {
    router.back();
  }
};

const sendEmailInquiry = async () => {
  if (!validateInput()) return;

  // 로그인 확인
  if (!authStore.state.isSigned || !authStore.state.signedUser?.userId) {
    showModal({
      type: 'warning',
      title: '로그인 필요',
      message: '로그인이 필요한 서비스입니다.',
      onConfirm: () => {
        router.push('/login');
      },
    });
    return;
  }

  state.isLoading = true;

  try {
    const emailData = {
      subject: state.memo.title,
      message: state.memo.content,
      senderName: authStore.state.signedUser.nickName || '웹사이트 방문자',
      senderEmail: authStore.state.signedUser.email || '',
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${BASE_URL}/api/OTD/email/sendInquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('서버 응답:', text);

      if (response.status === 401) {
        showModal({
          type: 'error',
          title: '인증 오류',
          message: '로그인 세션이 만료되었습니다.\n다시 로그인해주세요.',
          onConfirm: async () => {
            await authStore.logout();
            router.push('/login');
          },
        });
        return;
      }

      showModal({
        type: 'error',
        title: '전송 실패',
        message: '문의 전송 중 오류가 발생했습니다.',
      });
      return;
    }

    const result = await response.json();

    if (result.result?.success) {
      showModal({
        type: 'success',
        title: '전송 완료',
        message: result.message || '문의가 성공적으로 전송되었습니다!',
        onConfirm: () => {
          state.memo.title = '';
          state.memo.content = '';
        },
      });
    } else {
      showModal({
        type: 'error',
        title: '전송 실패',
        message: result.message || '문의 전송에 실패했습니다.',
      });
    }
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    showModal({
      type: 'error',
      title: '전송 오류',
      message: '문의 전송 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
    });
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

    <div class="button-group">
      <button
        type="button"
        class="btn btn-secondary"
        @click="goBack"
        :disabled="state.isLoading"
      >
        취소
      </button>
      <button
        type="button"
        class="btn btn-primary"
        @click="sendEmailInquiry"
        :disabled="state.isLoading"
      >
        <span
          v-if="state.isLoading"
          class="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        {{ state.isLoading ? '전송 중...' : '문의하기' }}
      </button>
    </div>

    <!-- 커스텀 모달 -->
    <AlertModal
      :show="modal.show"
      :title="modal.title"
      :message="modal.message"
      :type="modal.type"
      :confirmText="modal.confirmText"
      :cancelText="modal.cancelText"
      @close="closeModal"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
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

.button-group {
  display: flex;
  gap: 10px;
}

.button-group .btn {
  flex: 1;
  padding: 12px;
}
</style>
