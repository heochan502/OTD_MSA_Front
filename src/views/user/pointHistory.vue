<script setup>
import { ref, onMounted } from 'vue';
import { getPointHistory } from '@/services/user/userService';
import { useAuthenticationStore } from '@/stores/user/authentication';

const authStore = useAuthenticationStore();
const data = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Pinia store에서 userId 가져오기
    const userId = authStore.state.signedUser.userId;
    
    console.log('가져온 userId:', userId);
    
    if (!userId || userId === 0) {
      error.value = '로그인이 필요합니다.';
      return;
    }
    
    console.log('포인트 히스토리 조회 시작...');
    const response = await getPointHistory(userId);
    console.log('포인트 히스토리 응답:', response.data);
    
    data.value = response.data.data;
    console.log('최종 데이터:', data.value);
    
  } catch (err) {
    console.error('에러 발생:', err);
    console.error('에러 응답:', err.response?.data);
    
    if (err.response?.status === 401) {
      error.value = '로그인이 필요합니다.';
    } else {
      error.value = '데이터를 불러오는데 실패했습니다.';
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="challenge-point-container">
    <!-- 총 포인트 (항상 표시) -->
    <div class="total-point">
      <h2>총 포인트</h2>
      <p class="point-value">{{ authStore.state.signedUser.point }}P</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">로딩 중...</div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 포인트 히스토리 리스트 -->
    <div v-else-if="data" class="point-history">
      <h3>포인트 내역</h3>
      <ul v-if="data.pointHistory && data.pointHistory.length > 0" class="history-list">
        <li 
          v-for="item in data.pointHistory" 
          :key="item.chId" 
          class="history-item"
        >
          <div class="item-info">
            <span class="reason">{{ item.reason }}</span>
            <span class="date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <span 
            class="point" 
            :class="item.point > 0 ? 'positive' : 'negative'"
          >
            {{ item.point > 0 ? '+' : '' }}{{ item.point }}P
          </span>
        </li>
      </ul>
      <p v-else class="no-data">포인트 내역이 없습니다.</p>
    </div>

    <!-- 데이터 없음 -->
    <div v-else class="no-data">데이터가 없습니다.</div>
  </div>
</template>

<style scoped>
.challenge-point-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
}

.error {
  color: #ef4444;
}

.total-point {
  background: #393e46;
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.total-point h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: normal;
  opacity: 0.9;
}

.point-value {
  margin: 0;
  font-size: 48px;
  font-weight: bold;
}

.point-history {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.point-history h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #f9fafb;
}

.history-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.reason {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.date {
  font-size: 14px;
  color: #999;
}

.point {
  font-size: 18px;
  font-weight: bold;
}

.point.positive {
  color: #10b981;
}

.point.negative {
  color: #ef4444;
}
</style>