<script setup>
import { ref, onMounted } from 'vue';
import { getInquiryDetail } from '@/services/user/inquiryService';

const props = defineProps({
  inquiryId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close']);

const inquiry = ref(null);
const loading = ref(false);

const loadInquiryDetail = async () => {
  loading.value = true;
  try {
    const data = await getInquiryDetail(props.inquiryId);

    inquiry.value = data.data || data;
  } catch (error) {
    console.error('문의 상세 조회 실패:', error);
    alert('문의 상세 정보를 불러오는데 실패했습니다.');
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  emit('close');
};

const getStatusClass = (status) => {
  const statusMap = {
    'PENDING': 'pending',
    'COMPLETED': 'completed'
  };
  return statusMap[status] || 'pending';
};

const getStatusText = (status) => {
  const statusTextMap = {
    'PENDING': '대기중',
    'COMPLETED': '완료'
  };

  if (status === '대기 중' || status === '완료') {
    return status;
  }

  return statusTextMap[status] || '알 수 없음';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

onMounted(() => {
  loadInquiryDetail();
});
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>문의 상세 내역</h3>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>

      <div v-if="loading" class="loading">
        <p>불러오는 중...</p>
      </div>

      <div v-else-if="inquiry" class="modal-body">
        <div class="detail-row">
          <label>문의 번호</label>
          <span>{{ inquiry.id }}</span>
        </div>

        <div class="detail-row">
          <label>상태</label>
          <span :class="['status-badge', getStatusClass(inquiry.status)]">
            {{ getStatusText(inquiry.status) }}
          </span>
        </div>

        <div class="detail-row">
          <label>제목</label>
          <span class="subject">{{ inquiry.subject }}</span>
        </div>

        <div class="detail-row">
          <label>작성자</label>
          <span>{{ inquiry.senderName }}</span>
        </div>

        <div class="detail-row">
          <label>이메일</label>
          <span>{{ inquiry.senderEmail }}</span>
        </div>

        <div class="detail-row">
          <label>작성일시</label>
          <span>{{ formatDate(inquiry.createdAt) }}</span>
        </div>

        <div class="detail-content">
          <label>문의 내용</label>
          <div class="content-box">
            {{ inquiry.content }}
          </div>
        </div>

        <!-- 답변 섹션 추가 -->
        <div v-if="inquiry.reply" class="reply-section">
          <div class="reply-header">
            <h4>관리자 답변</h4>
            <div class="reply-info">
              <span v-if="inquiry.adminName" class="admin-name">
                {{ inquiry.adminName }}
              </span>
              <span v-if="inquiry.replyAt" class="reply-date">
                {{ formatDate(inquiry.replyAt) }}
              </span>
            </div>
          </div>
          <div class="reply-content">
            {{ inquiry.reply }}
          </div>
        </div>

        <!-- 답변 대기 메시지 -->
        <div v-else class="no-reply">
          <p>아직 답변이 등록되지 않았습니다.</p>
        </div>
      </div>

      <div v-else class="error">
        <p>문의 내역을 불러올 수 없습니다.</p>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="confirm-btn">확인</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 32px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.loading {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.error {
  padding: 40px;
  text-align: center;
  color: #ef4444;
}

.modal-body {
  padding: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.detail-row label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
  font-size: 14px;
}

.detail-row span {
  color: #6b7280;
  flex: 1;
}

.subject {
  font-weight: 500;
  color: #1f2937;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.completed {
  background-color: #d1fae5;
  color: #065f46;
}

.detail-content {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.detail-content label {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
}

.content-box {
  background-color: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: #374151;
  min-height: 100px;
}

/* 답변 섹션 스타일 */
.reply-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #eff6ff;
  border-radius: 8px;
  border: 2px solid #3b82f6;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #bfdbfe;
}

.reply-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1e40af;
  margin: 0;
}

.reply-info {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.admin-name {
  color: #3b82f6;
  font-weight: 500;
}

.reply-date {
  color: #6b7280;
}

.reply-content {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: #1f2937;
  min-height: 80px;
}

/* 답변 대기 메시지 */
.no-reply {
  margin-top: 30px;
  padding: 20px;
  background-color: #f3f4f6;
  border-radius: 8px;
  text-align: center;
  border: 1px dashed #d1d5db;
}

.no-reply p {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.confirm-btn {
  padding: 10px 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.confirm-btn:hover {
  background-color: #2563eb;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .detail-row label {
    min-width: auto;
  }

  .reply-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .reply-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style>