<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPointHistory } from '@/services/user/userService';
import { getSelectedAll } from '@/services/challenge/challengeService';
import { useAuthenticationStore } from '@/stores/user/authentication';

const authStore = useAuthenticationStore();
const pointHistory = ref([]);
const missionComplete = ref([]);
const dailyMission = ref([]);
const loading = ref(true);
const error = ref(null);

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
    missionComplete.value = missionResponse.data.missionComplete || [];
    dailyMission.value = missionResponse.data.dailyMission || [];
    
    console.log('포인트 히스토리:', pointHistory.value);
    console.log('미션 완료:', missionComplete.value);
    console.log('일일 미션:', dailyMission.value);
    
  } catch (err) {
    console.error('에러 발생:', err);
    
    if (err.response?.status === 401) {
      error.value = '로그인이 필요합니다.';
    } else {
      error.value = '데이터를 불러오는데 실패했습니다.';
    }
  } finally {
    loading.value = false;
  }
};

// 모든 내역을 합쳐서 최신순 정렬
const allHistory = computed(() => {
  const combined = [];
  
  // 포인트 히스토리 추가
  pointHistory.value.forEach(item => {
    combined.push({
      type: 'point',
      reason: item.reason,
      point: item.point,
      createdAt: item.createdAt,
      id: `point-${item.chId}`
    });
  });
  
  // 일일 미션 완료 내역 추가
  missionComplete.value.forEach(mission => {
    // cdId 타입 통일 (문자열로 비교)
    const missionDetail = dailyMission.value.find(m => String(m.cdId) === String(mission.cdId));
    if (missionDetail) {
      combined.push({
        type: 'mission',
        reason: missionDetail.cdName,
        point: missionDetail.cdReward,
        createdAt: mission.successDate, // successDate 사용
        id: `mission-${mission.cdId}-${mission.successDate}`
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

// reason에서 타입 추출
const getReasonType = (item) => {
  if (item.type === 'mission') return 'mission';
  
  const reason = item.reason || '';
  if (reason.includes('1위_reward')) return 'rank1';
  if (reason.includes('2위_reward')) return 'rank2';
  if (reason.includes('3위_reward')) return 'rank3';
  if (reason.includes('개근_reward')) return 'perfect';
  if (reason.includes('일 이상_reward')) return 'attendance';
  
  return 'normal';
};

// reason을 사용자 친화적으로 변환
const formatReason = (item) => {
  if (item.type === 'mission') {
    return ' 일일 미션: ' + item.reason;
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
</script>

<template>
  <div class="challenge-point-container">
    <!-- 총 포인트 -->
    <div class="total-point">
      <h2>총 포인트</h2>
      <p class="point-value">{{ authStore.state.signedUser.point?.toLocaleString() }}P</p>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading">로딩 중...</div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- 전체 포인트 내역 -->
    <div v-else class="point-history">
      <h3>포인트 내역</h3>
      <ul v-if="allHistory.length > 0" class="history-list">
        <li 
          v-for="item in allHistory" 
          :key="item.id" 
          class="history-item"
          :class="{
            'mission-item': getReasonType(item) === 'mission',
            'rank-item': getReasonType(item).startsWith('rank'),
            'perfect-item': getReasonType(item) === 'perfect',
            'attendance-item': getReasonType(item) === 'attendance'
          }"
        >
          <div class="item-info">
            <span class="reason">{{ formatReason(item) }}</span>
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
  background-color: #fafafa;
}

.history-item:hover {
  background-color: #f3f4f6;
}

.history-item:last-child {
  border-bottom: none;
}

/* 일일 미션 */
.mission-item {
  background: linear-gradient(135deg, #f0fdf4 0%, #f7fef9 100%);
  border-left: 4px solid #22c55e;
}

/* 랭킹 보상 */
.rank-item {
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
  border-left: 4px solid #fbbf24;
}

/* 개근 보상 */
.perfect-item {
  background: linear-gradient(135deg, #f0fdf4 0%, #f7fef9 100%);
  border-left: 4px solid #10b981;
}

/* 출석 보상 */
.attendance-item {
  background: linear-gradient(135deg, #eff6ff 0%, #f5f9ff 100%);
  border-left: 4px solid #3b82f6;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-width: 0;
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
  flex-shrink: 0;
  margin-left: 10px;
}

.point.positive {
  color: #10b981;
}

.point.negative {
  color: #ef4444;
}
</style>