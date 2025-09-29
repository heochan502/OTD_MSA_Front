<script setup>
import { onMounted, reactive } from 'vue';
//import { getPointHistory } from '@/services/point/pointService';
import { useAuthenticationStore } from '@/stores/user/authentication';

const authStore = useAuthenticationStore();

const state = reactive({
  loading: false,
  error: null,
  user: {
    nickName: '',
    totalPoint: 0
  },
  pointHistory: []
});

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '날짜 오류';
  }
};

// DB에서 포인트 내역 가져오기
onMounted(async () => {
  state.loading = true;
  state.error = null;

  try {
    const res = await getPointHistory();
    
    if (!res || res.status !== 200) {
      throw new Error('포인트 내역을 불러올 수 없습니다.');
    }

    console.log('point history data', res.data);

    // DB에서 받은 데이터 구조에 맞게 설정
    state.user = {
      nickName: res.data.user?.nickName || '사용자',
      totalPoint: res.data.user?.totalPoint || 0
    };

    // 전체 포인트 내역
    state.pointHistory = res.data.pointHistory || [];

  } catch (error) {
    console.error('포인트 데이터 로드 실패:', error);
    state.error = error.message || '데이터를 불러오는 중 오류가 발생했습니다.';
  } finally {
    state.loading = false;
  }
});
</script>

<template>
  <div class="wrap">
    <!-- 상단: 전체 포인트 -->
    <div class="point-summary">
      <div class="first-title">{{ userInfo.nickName }}님의 포인트</div>
      <div class="total-point">
        <span class="point-number">{{ state.user.totalPoint.toLocaleString('ko-KR') }}</span>
        <span class="point-unit">P</span>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="state.loading" class="loading-section">
      <div class="spinner"></div>
      <p>포인트 내역을 불러오고 있습니다...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="state.error" class="error-section">
      <p>{{ state.error }}</p>
      <button @click="location.reload()" class="retry-btn">다시 시도</button>
    </div>

    <!-- 하단: 포인트 내역 리스트 -->
    <div v-else>
      <div class="title">포인트 적립 내역</div>
      
      <div v-if="state.pointHistory.length > 0" class="point-list">
        <div
          v-for="point in state.pointHistory"
          :key="point.ch_id"
          class="point-item"
        >
          <div class="point-info">
            <div class="point-reason">{{ point.reason }}</div>
            <div class="point-date">{{ formatDate(point.createdAt) }}</div>
          </div>
          <div class="point-amount">+{{ point.point }}P</div>
        </div>
      </div>

      <!-- 포인트 내역이 없을 때 -->
      <div v-else class="empty-state">
        <div class="empty-icon">💎</div>
        <h3>아직 포인트 적립 내역이 없어요</h3>
        <p>챌린지를 완료하고 포인트를 모아보세요!</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrap {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.first-title {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.title {
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.point-summary {
  background: #393e46;
  border-radius: 15px;
  padding: 10px;
  margin-bottom: 25px;
  color: white;
  text-align: center;

  .first-title {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 15px;
  }

  .total-point {
    .point-number {
      font-size: 48px;
      font-weight: bold;
    }
    .point-unit {
      font-size: 32px;
      margin-left: 8px;
    }
  }
}

.loading-section, .error-section {
  text-align: center;
  padding: 40px 20px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  .retry-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 10px;
    
    &:hover {
      background: #0056b3;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.point-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.point-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8f9fa;
  }

  .point-info {
    flex: 1;
    
    .point-reason {
      font-size: 16px;
      color: #333;
      font-weight: 500;
      margin-bottom: 6px;
    }
    
    .point-date {
      font-size: 13px;
      color: #999;
    }
  }

  .point-amount {
    color: #28a745;
    font-weight: bold;
    font-size: 20px;
    white-space: nowrap;
    margin-left: 15px;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  background: white;
  border-radius: 12px;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  h3 {
    margin-bottom: 10px;
    color: #333;
  }
}

@media (max-width: 768px) {
  .point-summary {
    padding: 25px 20px;
    
    .total-point {
      .point-number {
        font-size: 36px;
      }
      .point-unit {
        font-size: 24px;
      }
    }
  }
  
  .point-item {
    padding: 15px;
    
    .point-info .point-reason {
      font-size: 14px;
    }
    
    .point-amount {
      font-size: 18px;
    }
  }
}
</style>