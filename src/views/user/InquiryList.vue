<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyInquiries } from '@/services/user/inquiryService';
import InquiryDetailModal from '@/components/user/InquiryDetailModal.vue';

const router = useRouter();

const inquiries = ref([]);
const loading = ref(false);
const showDetailModal = ref(false);
const selectedInquiryId = ref(null);

const loadInquiries = async () => {
  loading.value = true;
  try {
    const data = await getMyInquiries();
    inquiries.value = data;
    if (data.length > 0) {
    }
  } catch (error) {
    console.error('문의 내역 로딩 오류:', error);
  } finally {
    loading.value = false;
  }
};

const viewDetail = (inquiryId) => {
  selectedInquiryId.value = Number(inquiryId);
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedInquiryId.value = null;
};

const goBack = () => {
  router.back();
};

const goToInquiry = () => {
  router.push('/user/email/inquiry');
};

const getStatusClass = (status) => {
  if (!status) return 'pending';

  const upperStatus = status.toString().toUpperCase();
  const statusMap = {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    '00': 'pending',
    '01': 'resolved',
    대기중: 'pending',
    '대기 중': 'pending',
    완료: 'resolved',
  };
  return statusMap[upperStatus] || statusMap[status] || 'pending';
};

const getStatusText = (status) => {
  if (!status) return '대기중';

  if (status === '대기 중' || status === '대기중') {
    return '대기중';
  }
  if (status === '완료') {
    return '완료';
  }

  const upperStatus = status.toString().toUpperCase();
  const statusTextMap = {
    PENDING: '대기중',
    RESOLVED: '완료',
    '00': '대기중',
    '01': '완료',
  };

  return statusTextMap[upperStatus] || statusTextMap[status] || '대기중';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

onMounted(() => {
  loadInquiries();
});
</script>

<template>
  <div class="inquiry-list-container">
    <!-- 상단 버튼 그룹 -->
    <div class="top-buttons">
      <button @click="goBack" class="back-btn">← 뒤로가기</button>
      <button @click="loadInquiries" class="refresh-btn">
        <span>새로고침</span>
      </button>
    </div>

    <div class="header">
      <h2>문의 내역</h2>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">
      <p>문의 내역을 불러오는 중...</p>
    </div>

    <!-- 문의 내역이 없을 때 -->
    <div v-else-if="inquiries.length === 0" class="empty-state">
      <p>아직 문의 내역이 없습니다.</p>
      <button @click="goToInquiry" class="create-btn">문의하기</button>
    </div>

    <!-- 문의 목록 -->
    <div v-else class="inquiry-list">
      <div
        v-for="inquiry in inquiries"
        :key="inquiry.id"
        class="inquiry-item"
        @click="viewDetail(inquiry.id)"
      >
        <div class="inquiry-header">
          <h3>{{ inquiry.subject }}</h3>
          <span :class="['status', getStatusClass(inquiry.status)]">
            {{ getStatusText(inquiry.status) }}
          </span>
        </div>
        <div class="inquiry-date">
          {{ formatDate(inquiry.createdAt) }}
        </div>
      </div>
    </div>

    <!-- 상세보기 모달 -->
    <InquiryDetailModal
      v-if="showDetailModal"
      :inquiry-id="selectedInquiryId"
      @close="closeDetailModal"
    />
  </div>
</template>

<style scoped>
.inquiry-list-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.top-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
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

.refresh-btn {
  padding: 10px 20px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background-color: #059669;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 20px;
}

.create-btn {
  padding: 12px 30px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.create-btn:hover {
  background-color: #2563eb;
}

.inquiry-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.inquiry-item {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.inquiry-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.inquiry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.inquiry-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
}

.status.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status.resolved {
  background-color: #d1fae5;
  color: #065f46;
}

.inquiry-date {
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .inquiry-list-container {
    padding: 15px;
  }

  .header h2 {
    font-size: 20px;
  }

  .inquiry-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .status {
    margin-left: 0;
  }
}
</style>
