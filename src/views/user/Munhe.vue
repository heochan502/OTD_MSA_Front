<script setup>
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const state = reactive({
  memo: {
    id: 0,
    title: '',
    content: '',
    createdAt: ''
  },
  isLoading: false
});

onMounted(() => {
  const passData = history.state.data;
  console.log('passData:', passData);
  if(passData) {
    state.memo = JSON.parse(passData);
  }
});

// 입력 검증 함수
const validateInput = () => {
    if (!state.memo.title.trim()) {
        alert('제목을 입력해주세요.');
        return false;
    }
    if (!state.memo.content.trim()) {
        alert('내용을 입력해주세요.');
        return false;
    }
    return true;
}

// 직접 이메일 전송 함수
const sendEmailInquiry = async () => {
    // 입력 검증
    if (!validateInput()) {
        return;
    }

    state.isLoading = true;
    
    try {
        const emailData = {
            subject: state.memo.title,
            message: state.memo.content,
            senderName: '웹사이트 방문자',
            timestamp: new Date().toISOString()
        };

        // 직접 fetch 요청
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
        });

        const result = await response.json();
        
        if (result.resultData === 1) {
            alert('문의가 성공적으로 전송되었습니다!');
            // 폼 초기화
            state.memo.title = '';
            state.memo.content = '';
        } else {
            alert(result.resultMessage || '문의 전송에 실패했습니다.');
        }
    } catch (error) {
        console.error('이메일 전송 오류:', error);
        alert('문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        state.isLoading = false;
    }
}
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