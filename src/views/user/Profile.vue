<script setup>
import { useRouter } from 'vue-router';
import { logout, getUserProfile } from '@/services/user/userService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { ref, computed, reactive } from 'vue';
import { onMounted } from 'vue';

const router = useRouter();
const authStore = useAuthenticationStore();
const isLoggingOut = ref(false);

console.log(authStore.state.signedUser);

const defaultProfile = '/otd/image/main/default-profile.png';
// const BASE_URL = `home/green/download/profile/${userInfo.userId}`;

// pic이 있으면 그걸 쓰고, 없으면 기본 이미지
const profileImage = computed(() => {
  return authStore.state.signedUser?.pic &&
    authStore.state.signedUser.pic.trim() !== ''
    ? authStore.state.signedUser.pic
    : defaultProfile;
});

const loadProfile = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/user/login');
    return;
  }

  try {
    state.loading = true;
    const res = await getUserProfile();
    console.log("온데이터 : " ,res.data );
    if (res && res.status === 200) {
      const userData = res.data.result  
      Object.assign(state.form, userData);
      authStore.state.signedUser = userData 
    }
  } catch (error) {
    console.error('Profile loading error:', error);
    if (error.response && error.response.status === 401) {
      authStore.logout(); 
      router.push('/user/login');
    } else {
     
      alert('프로필 정보를 불러오는데 실패했습니다.');
    }
  } finally {
    state.loading = false;
  }
};

const userInfo = computed(() => {
  return {
    nickName: authStore.state.signedUser?.nickName || '게스트',
    email: authStore.state.signedUser?.email || '이메일을 불러올 수 없습니다',
    point: authStore.state.signedUser?.point || 0,
    pic: authStore.state.signedUser?.pic,
  };
});
// 로그아웃 버튼 클릭 시
const logoutAccount = async () => {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  const res = await logout();
  if (res === undefined || res.status !== 200) return;
  authStore.logout();
  router.push('/user/login');
};

// 포인트 포맷팅
const formatPoint = (point) => {
  return point?.toLocaleString() || '0';
};
</script>

<template>
  <div class="profile-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <router-link to="/user/ModifiProfile" class="profile-header">
        <div class="profile-image otd-shadow">
          <img :src="profileImage" :alt="userInfo.nickName" />
        </div>
        <div class="profile-info">
          <h2 class="nickname">{{ userInfo.nickName }}</h2>
          <p class="email">{{ userInfo.email }}</p>
          <div class="arrow">›</div>
        </div> 
      </router-link>
    </div>

    <!-- 활동 섹션 -->
    <div class="activity-section">
      <h3 class="section-title">나의 활동</h3>
      <div class="activity-grid">
        <router-link to="/user/posts" class="activity-item">
          <div class="activity-icon">📝</div>
          <span>내가 쓴 게시글</span>
        </router-link>
        <router-link to="/user/likes" class="activity-item">
          <div class="activity-icon">❤️</div>
          <span>나의 좋아요</span>
        </router-link>
        <router-link to="/user/comments" class="activity-item">
          <div class="activity-icon">💬</div>
          <span>내가 쓴 댓글</span>
        </router-link>
      </div>
    </div>

    <!-- 포인트 섹션 -->
    <div class="point-section">
      <div class="point-header">
        <h3 class="section-title">포인트</h3>
        <div class="point-value">{{ formatPoint(userInfo.point) }}P</div>
      </div>
      
      <!-- 포인트 기록 -->
      <div class="point-history">
        <h4 class="history-title">최근 포인트 기록</h4>
        <div class="history-item">
          <div class="history-description">30k 러닝 챌린지</div>
          <div class="history-points positive">+30P</div>
          <div class="history-date">2025.10.20</div>
        </div>
        <!-- 더 많은 기록들을 위한 공간 -->
        <router-link to="/user/point-history" class="view-all-link">
          모든 포인트 기록 보기 →
        </router-link>
      </div>
    </div>

    <!-- 설정 섹션 -->
    <div class="settings-section">
      <h3 class="section-title">설정</h3>
      <div class="settings-list">
        <router-link to="/user/signal" class="settings-item">
          <div class="settings-icon">🔔</div>
          <span>알림 설정</span>
          <div class="arrow">›</div>
        </router-link>
      </div>
    </div>

    <!-- 고객센터 섹션 -->
    <div class="support-section">
      <h3 class="section-title">고객센터</h3>
      <div class="support-list">
        <router-link to="/user/munhe" class="support-item">
          <div class="support-icon">💬</div>
          <span>1:1 문의하기</span>
          <div class="arrow">›</div>
        </router-link>
        <router-link to="/user/qna" class="support-item">
          <div class="support-icon">❓</div>
          <span>자주 묻는 질문</span>
          <div class="arrow">›</div>
        </router-link>
      </div>
    </div>

    <!-- 약관 및 로그아웃 섹션 -->
    <div class="footer-section">
      <router-link to="/user/term" class="footer-link">약관 및 보안</router-link>
      <button 
        class="logout-btn" 
        @click="logoutAccount"
        :disabled="isLoggingOut"
      >
        {{ isLoggingOut ? '로그아웃 중...' : '로그아웃' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  min-height: 100vh;
}

.profile-section {
  margin-bottom: 30px;
  
  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #ffffff;
    border-radius: 16px;
    color: white;
    
    .profile-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.3);
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .profile-info {
      flex: 1;
      
      .nickname {
        font-size: 24px;
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #393E46;
      }
      
      .email {
        font-size: 14px;
        opacity: 0.9;
        margin: 0;
        color: #393E46;
      }
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: #333;
}

.activity-section {
  margin-bottom: 30px;
  
  .activity-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    
    .activity-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 12px;
      background: #f8f9fa;
      border-radius: 12px;
      text-decoration: none;
      color: #333;
      transition: all 0.2s ease;
      
      &:hover {
        background: #e9ecef;
        transform: translateY(-2px);
      }
      
      .activity-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      span {
        font-size: 14px;
        text-align: center;
      }
    }
  }
}

.point-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #fff8e1;
  border-radius: 16px;
  border: 1px solid #ffd54f;
  
  .point-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .point-value {
      font-size: 24px;
      font-weight: bold;
      color: #f57c00;
    }
  }
  
  .point-history {
    .history-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #666;
    }
    
    .history-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #fff3c4;
      
      .history-description {
        font-weight: 500;
      }
      
      .history-points {
        font-weight: bold;
        
        &.positive {
          color: #2e7d32;
        }
        
        &.negative {
          color: #d32f2f;
        }
      }
      
      .history-date {
        color: #666;
        font-size: 14px;
      }
    }
    
    .view-all-link {
      display: block;
      text-align: center;
      margin-top: 16px;
      color: #f57c00;
      text-decoration: none;
      font-weight: 500;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.settings-section,
.support-section {
  margin-bottom: 30px;
  
  .settings-list,
  .support-list {
    background: white;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
    
    .settings-item,
    .support-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      text-decoration: none;
      color: #333;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s ease;
      
      &:hover {
        background: #f8f9fa;
      }
      
      &:last-child {
        border-bottom: none;
      }
      
      .settings-icon,
      .support-icon {
        font-size: 20px;
      }
      
      span {
        flex: 1;
        font-weight: 500;
      }
      
      .arrow {
        font-size: 18px;
        color: #ccc;
      }
    }
  }
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  
  .footer-link {
    color: #666;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      color: #333;
      text-decoration: underline;
    }
  }
  
  .logout-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background: #c82333;
      transform: translateY(-1px);
    }
    
    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
    }
  }
}

// 반응형 디자인
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .activity-grid {
    grid-template-columns: 1fr;
    
    .activity-item {
      flex-direction: row;
      text-align: left;
      
      .activity-icon {
        margin-bottom: 0;
        margin-right: 12px;
      }
    }
  }
  
  .history-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: left;
    
    .history-date {
      order: -1;
      font-size: 12px;
    }
  }
}
.profile-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .default-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    
    span {
      font-size: 32px;
      color: white;
    }
  }
}
</style>
