<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPointHistory } from '@/services/user/userService';
import { getSelectedAll } from '@/services/user/userService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { useRouter } from 'vue-router';
import PointPurchaseService from '@/services/pointshop/PointPurchaseService';

const authStore = useAuthenticationStore();
const pointHistory = ref([]);
const missionComplete = ref([]);
const dailyMission = ref([]);
const loading = ref(true);
const error = ref(null);
const router = useRouter();

// 페이징 관련 상태
const currentPage = ref(1);
const itemsPerPage = 10;

const fetchData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const userId = authStore.state.signedUser.userId;
    
    if (!userId || userId === 0) {
      error.value = '로그인이 필요합니다.';
      return;
    }
    
    // 포인트 히스토리 조회
    const response = await getPointHistory(userId);
    pointHistory.value = response.data.result?.pointHistory || [];
    
    // 일일 미션 완료 내역 조회
    const missionResponse = await getSelectedAll();
    const result = missionResponse.data.result;
    
    if (result) {
      missionComplete.value = result.missionComplete || [];
      dailyMission.value = result.dailyMission || [];
    } else if (missionResponse.data.missionComplete) {
      missionComplete.value = missionResponse.data.missionComplete || [];
      dailyMission.value = missionResponse.data.dailyMission || [];
    }

    // 포인트샵 구매 내역 추가
    const purchaseResponse = await PointPurchaseService.getUserPurchaseHistory();
    if (purchaseResponse?.success || purchaseResponse?.data) {
      const purchaseData = purchaseResponse.data || [];
      purchaseData.forEach((p) => {
      pointHistory.value.push({
        type: 'purchase',
        reason: `🛒 포인트샵 구매: ${p.pointItemName}`,
        point: -Math.abs(p.pointScore || 0),
        createdAt: p.purchaseAt || new Date(),
        id: `purchase-${p.purchaseId}`,
        purchaseId: p.purchaseId,
        isUsed: p.isUsed || false,
        isUsed: p.isUsed ?? p.used ?? p.usedYn === 'Y' ?? false
      });
    });
    }

  } catch (err) {
    console.error('에러 발생:', err);
    console.error('에러 응답:', err.response?.data);
    error.value =
      err.response?.status === 401
        ? '로그인이 필요합니다.'
        : '데이터를 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

// 모든 내역을 합쳐서 최신순 정렬 (전체 데이터)
const allHistory = computed(() => {
  const combined = [];

  // 포인트 히스토리 추가
  pointHistory.value.forEach((item) => {
    combined.push({
      type: item.type || 'point',
      reason: item.reason,
      point: item.point,
      createdAt: item.createdAt,
      id: item.id || `point-${item.chId}`,
      purchaseId: item.purchaseId || null,
      isUsed: item.isUsed ?? item.used ?? item.usedYn === 'Y' ?? false,
    });
  });

  // 일일 미션 완료 내역 추가 (전체)
  missionComplete.value.forEach((mission) => {
  const missionDetail = dailyMission.value.find(
    (m) => String(m.cdId) === String(mission.cdId));

  if (missionDetail) {
    const date = mission.successDate || new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];

    combined.push({
      type: 'mission',
      reason: missionDetail.cdName,
      point: missionDetail.cdReward,
      createdAt: new Date(`${date}T${time}`),
      id: `mission-${mission.cdId}-${date}`,
    });
  }
});
  
  // 최신순 정렬
  return combined.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB - dateA;
  });
});

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return allHistory.value.slice(start, end);
});

// 총 페이지 수
const totalPages = computed(() => {
  return Math.ceil(allHistory.value.length / itemsPerPage);
});

// 페이지 변경
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// 페이지 번호 배열 생성 (최대 5개 표시)
const pageNumbers = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2);
    }
  }
  
  return pages;
});

// 
const handleItemClick = (item) => {
  if (item.type === 'purchase' && item.purchaseId) {
    router.push(`/pointshop/purchase-history/detail/${item.purchaseId}`);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getReasonType = (item) => {
  if (item.type === 'mission') return 'mission';
  
  const reason = item.reason || '';
  if (reason.includes('1위_reward')) return 'rank1';
  if (reason.includes('2위_reward')) return 'rank2';
  if (reason.includes('3위_reward')) return 'rank3';
  if (reason.includes('개근_reward')) return 'perfect';
  if (reason.includes('일 이상_reward')) return 'attendance';
  if (item.type === 'purchase') return 'purchase';
  
  return 'normal';
};

const formatReason = (item) => {
  if (item.type === 'mission') {
    return '✅ 일일 미션: ' + item.reason;
  }
  
  const reason = item.reason || '';
  
  if (reason.includes('1위_reward_')) {
    return '🥇 1위 보상: ' + reason.split('1위_reward_')[1];
  }
  if (reason.includes('2위_reward_')) {
    return '🥈 2위 보상: ' + reason.split('2위_reward_')[1];
  }
  if (reason.includes('3위_reward_')) {
    return '🥉 3위 보상: ' + reason.split('3위_reward_')[1];
  }
  if (reason.includes('개근_reward_')) {
    return '🎉 개근 보상: ' + reason.split('개근_reward_')[1];
  }
  if (reason.includes('25일 이상_reward_')) {
    return '⭐ 25일 이상 보상: ' + reason.split('25일 이상_reward_')[1];
  }
  if (reason.includes('20일 이상_reward_')) {
    return '✨ 20일 이상 보상: ' + reason.split('20일 이상_reward_')[1];
  }
  if (reason.includes('competition_')) {
    return '🏆 경쟁 챌린지: ' + reason.split('competition_')[1];
  }
  if (reason.includes('weekly_')) {
    return '📅 주간 챌린지: ' + reason.split('weekly_')[1];
  }
  if (reason.includes('personal_')) {
    return '💪 개인 챌린지: ' + reason.split('personal_')[1];
  }
  
  return reason;
};

onMounted(() => {
  fetchData();
});

const goBack = () => {
  router.push('/user/profile')
};

const handleClick = (item) => {
  if (item.isUsed) return;
  if (item.type === 'purchase' && item.purchaseId) {
    router.push(`/pointshop/purchase-history/detail/${item.purchaseId}`);
  }
};

</script>

<template>
  <div class="challenge-point-container">
    <!-- 총 포인트 -->
      <div class="total-point">
        <h2>총 포인트</h2>
        <div class="point-display">
          <p class="point-value">
            {{ authStore.state.signedUser.point?.toLocaleString() || '0' }}
          </p>
          <img
            src="/image/main/point.png"
            alt="포인트 아이콘"
            class="point-icon"
          />
        </div>
      </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">로딩 중...</div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 전체 포인트 내역 -->
    <div v-else class="point-history">
      <div class="history-header">
        <h3>포인트 내역</h3>
        <span class="total-count">전체 {{ allHistory.length }}건</span>
      </div>

      <ul v-if="paginatedHistory.length > 0" class="history-list">
        <li 
          v-for="item in paginatedHistory" 
          :key="item.id" 
          class="history-item"
          :class="{
            'mission-item': getReasonType(item) === 'mission',
            'rank-item': getReasonType(item).startsWith('rank'),
            'perfect-item': getReasonType(item) === 'perfect',
            'attendance-item': getReasonType(item) === 'attendance',
            'purchase-item': getReasonType(item) === 'purchase',
            'used': item.isUsed
          }"
          @click="handleClick(item)"
        >
          <div class="item-info">
            <span class="reason">{{ formatReason(item) }}</span>
            <span class="date">{{ formatDate(item.createdAt) }}</span>
          </div>
          <span 
            class="point" 
            :class="item.point > 0 ? 'positive' : 'negative'"
          >
            {{ item.point > 0 ? '+' : '' }}{{ item.point.toLocaleString('ko-KR') }}P
          </span>
        </li>
      </ul>
      <p v-else class="no-data">포인트 내역이 없습니다.</p>

      <!-- 페이징 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          이전
        </button>
        
        <button
          v-for="page in pageNumbers"
          :key="page"
          class="page-number"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          다음
        </button>
      </div>
    </div>
    <div class="top-buttons">
      <button @click="goBack" class="back-btn">
        ← 뒤로가기
      </button>
     
    </div>
  </div>
  
  
</template>

<style scoped>
.challenge-point-container {
  max-width: 390px;
  margin: 0 auto;
  padding: 20px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 상단 카드 */
.total-point {
  background: #393e46;
  color: #ffffff;
  border-radius: 14px;
  padding: 16px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  width: 100%;
  max-width: 360px;
}
.total-point h2 {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  opacity: 0.9;
}
.point-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.point-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.point-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  transform: translateY(-6px);
}

/* 포인트 내역 전체 */
.point-history {
  background: white;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  text-align: left;
}

/* 헤더 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  text-align: left;
}
.history-header h3 {
  font-size: 16px;
  margin: 0;
}
.total-count {
  font-size: 11px;
  padding: 3px 8px;
  background: #f3f4f6;
  border-radius: 12px;
}

/* 리스트 */
.history-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.history-item {
  width: 100%;
  max-width: 390px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid #f0f0f0;
  background: #fafafa;
  transition: background-color 0.2s;
  border-radius: 8px;
  text-align: left;
  box-sizing: border-box;
}

.history-item:hover {
  background-color: #f3f4f6;
}

.history-item + .history-item {
  margin-top: 2px;
}

.history-item.used {
  position: relative;
  background: #f0f0f0;
  filter: grayscale(0.8) brightness(0.9);
  opacity: 0.9;
  transition: all 0.3s ease;
  pointer-events: none;
}

.history-item.used::after {
  content: "사용 완료";
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.5);
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  pointer-events: none;
}

/* 텍스트 */
.item-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  flex: 1;
}
.reason {
  font-size: 10px;
  font-weight: 500;
  color: #333;
}
.date {
  font-size: 8px;
  color: #999;
}
.point {
  font-size: 10px;
  font-weight: 700;
  margin-left: 8px;
}
.point.positive {
  color: #10b981;
}
.point.negative {
  color: #ef4444;
}

/* 타입별 강조 */
.mission-item {
  background: linear-gradient(135deg, #f0fdf4 0%, #f7fef9 100%);
  border-left: 2px solid #22c55e;
}
.rank-item {
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
  border-left: 2px solid #fbbf24;
}
.perfect-item {
  border-left: 2px solid #10b981;
}
.attendance-item {
  border-left: 2px solid #3b82f6;
}
.purchase-item {
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
  border-left: 2px solid #ef4444;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.15);
}

/* 페이지네이션 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
}
.page-btn,
.page-number {
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.page-number.active {
  background: #393e46;
  color: white;
  border-color: #393e46;
}

/* 뒤로가기 */
.top-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.back-btn {
  padding: 6px 12px;
  font-size: 12px;
  background-color: #6b7280;
  color: white;
  border-radius: 5px;
  border: none;
  cursor: pointer;
}
.back-btn:hover {
  background-color: #4b5563;
}
</style>