<script setup>
import { useRouter } from 'vue-router';
import {
  logout,
  getPointHistory,
  patchUserProfilePic,
  deleteUserProfilePic,
} from '@/services/user/userService';
import { getSelectedAll } from '@/services/user/userService';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { ref, computed, onMounted } from 'vue';
import { putLifeUserProfile } from '@/services/community/postService';
import AlertModal from '@/components/user/Modal.vue';

const router = useRouter();
const authStore = useAuthenticationStore();
const isLoggingOut = ref(false);
const recentHistory = ref([]);
const loadingHistory = ref(true);
const showPhotoModal = ref(false);
const selectedFile = ref(null);
const previewUrl = ref(null);
const showLogoutModal = ref(false);

const BASE_URL = import.meta.env.VITE_BASE_URL;
const defaultProfile = '/otd/image/main/default-profile.png';

const profileImage = computed(() => {
  return authStore.state.signedUser?.pic &&
    authStore.state.signedUser.pic.trim() !== ''
    ? authStore.state.signedUser.pic
    : defaultProfile;
});

const userInfo = computed(() => {
  return {
    nickName: authStore.state.signedUser?.nickName || '게스트',
    email: authStore.state.signedUser?.email || '이메일을 불러올 수 없습니다',
    point: authStore.state.signedUser?.point || 0,
    pic: authStore.state.signedUser?.pic,
    userId: authStore.state.signedUser?.userId,
  };
});

const openLogoutModal = () => {
  showLogoutModal.value = true;
};

// 모달 confirm → 실제 로그아웃 처리
const handleLogoutConfirm = async () => {
  showLogoutModal.value = false;
  isLoggingOut.value = true;
  const res = await logout();
  isLoggingOut.value = false;
  if (!res || res.status !== 200) return;
  authStore.logout();
  router.push('/user/login');
};

const modal = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  onConfirm: null,
  onCancel: null,
});

const showAlert = (config) => {
  modal.value.show = true;
  modal.value.type = config.type || 'info';
  modal.value.title = config.title || '';
  modal.value.message = config.message || '';
  modal.value.confirmText = config.confirmText || '확인';
  modal.value.cancelText = config.cancelText || '취소';
  modal.value.onConfirm = config.onConfirm || null;
  modal.value.onCancel = config.onCancel || null;
};

const closeAlert = () => {
  modal.value.show = false;
};

// 프로필 사진 클릭 시 모달 열기
const openPhotoModal = (e) => {
  e.preventDefault();
  showPhotoModal.value = true;
};

// 모달 닫기
const closePhotoModal = () => {
  showPhotoModal.value = false;
  selectedFile.value = null;
  previewUrl.value = null;
};

const triggerFileInput = () => {
  document.getElementById('photoInput').click();
};

// 프로필 사진 저장
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  } else {
    showAlert({
      type: 'warning',
      title: '파일 선택 오류',
      message: '이미지 파일만 선택할 수 있습니다.',
    });
  }
};

// 저장
const saveProfilePhoto = async () => {
  if (!selectedFile.value) {
    showAlert({
      type: 'warning',
      title: '저장 실패',
      message: '사진을 선택해주세요.',
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.append('pic', selectedFile.value);

    const response = await patchUserProfilePic(formData);
    if (response.data && response.data.result) {
      const fileName = response.data.result;
      const imagePath = `${BASE_URL}/profile/${userInfo.value.userId}/${fileName}`;
      authStore.state.signedUser.pic = imagePath;

      const lifePic = await putLifeUserProfile(imagePath);
      //console.log('lifePic', lifePic);

      showAlert({
        type: 'success',
        title: '저장 완료',
        message: '프로필 사진이 변경되었습니다.',
        onConfirm: () => (showPhotoModal.value = false),
      });
    }
  } catch (err) {
    console.error(err);
    showAlert({
      type: 'error',
      title: '저장 실패',
      message: '프로필 사진 업로드에 실패했습니다.',
    });
  }
};

// 삭제
const deleteProfilePhoto = () => {
  showAlert({
    type: 'confirm',
    title: '사진 삭제',
    message: '프로필 사진을 삭제하시겠습니까?',
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm: async () => {
      try {
        const response = await deleteUserProfilePic();
        if (response.status === 200) {
          authStore.state.signedUser.pic = null;
          previewUrl.value = null;
          showAlert({
            type: 'success',
            title: '삭제 완료',
            message: '프로필 사진이 삭제되었습니다.',
            onConfirm: () => (showPhotoModal.value = false),
          });
        }
      } catch (err) {
        console.error(err);
        showAlert({
          type: 'error',
          title: '삭제 실패',
          message: '프로필 사진 삭제에 실패했습니다.',
        });
      }
    },
  });
};

// 최근 포인트 히스토리 가져오기
const fetchRecentHistory = async () => {
  try {
    loadingHistory.value = true;
    const userId = authStore.state.signedUser?.userId;

    if (!userId || userId === 0) {
      return;
    }

    const response = await getPointHistory(userId);
    const pointHistory = response.data.result?.pointHistory || [];

    const missionResponse = await getSelectedAll();

    const result = missionResponse.data.result;
    let missionComplete = [];
    let dailyMission = [];

    if (result) {
      missionComplete = result.missionComplete || [];
      dailyMission = result.dailyMission || [];
    } else if (missionResponse.data.missionComplete) {
      missionComplete = missionResponse.data.missionComplete || [];
      dailyMission = missionResponse.data.dailyMission || [];
    }

    const combined = [];

    // 포인트 히스토리 추가
    pointHistory.forEach((item) => {
      combined.push({
        type: 'point',
        reason: formatPointReason(item.reason),
        point: item.point,
        createdAt: item.createdAt,
        id: `point-${item.chId}`,
      });
    });

    // 미션 완료 내역 추가
    missionComplete.forEach((mission) => {
      const missionDetail = dailyMission.find(
        (m) => String(m.cdId) === String(mission.cdId)
      );
      if (missionDetail) {
        combined.push({
          type: 'mission',
          reason: '✅ 일일 미션: ' + missionDetail.cdName,
          point: missionDetail.cdReward,
          createdAt: mission.successDate,
          id: `mission-${mission.cdId}-${mission.successDate}`,
        });
      }
    });

    // 최신순 정렬 후 최근 2개만
    recentHistory.value = combined
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);
  } catch (err) {
    console.error('포인트 히스토리 조회 실패 백켰나?쿠키있나?:', err);
    console.error('에러 응답:', err.response?.data);
    recentHistory.value = [];
  } finally {
    loadingHistory.value = false;
  }
};

const formatPointReason = (reason) => {
  if (!reason) return '';

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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
};

const logoutAccount = async () => {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  const res = await logout();
  if (res === undefined || res.status !== 200) return;
  authStore.logout();
  router.push('/user/login');
};

const formatPoint = (point) => {
  return point?.toLocaleString() || '0';
};

onMounted(() => {
  fetchRecentHistory();
});
</script>

<template>
  <div class="profile-container">
    <!-- 프로필 섹션 -->
    <div class="profile-section">
      <router-link to="/user/ModifyProfile" class="profile-header">
        <div class="profile-image otd-shadow" @click="openPhotoModal">
          <img :src="profileImage" :alt="userInfo.nickName" />
          <div class="photo-overlay">
            <span></span>
          </div>
        </div>
        <div class="profile-info">
          <h2 class="nickname">{{ userInfo.nickName }}</h2>
          <p class="email">{{ userInfo.email }}</p>
          <div class="arrowpic">›</div>
        </div>
      </router-link>
    </div>

    <!-- 활동 섹션 -->
    <div class="activity-section">
      <h3 class="section-title">나의 활동</h3>
      <div class="activity-grid">
        <router-link to="/user/post" class="activity-item">
          <div class="activity-icon">📝</div>
          <span>내가 쓴 게시글</span>
        </router-link>
        <router-link to="/user/like" class="activity-item">
          <div class="activity-icon">❤️</div>
          <span>나의 좋아요</span>
        </router-link>
        <router-link to="/user/comment" class="activity-item">
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

        <!-- 로딩 중 -->
        <div v-if="loadingHistory" class="loading-message">로딩 중...</div>

        <!-- 포인트 기록이 있을 때 -->
        <div v-else-if="recentHistory.length > 0">
          <div
            v-for="item in recentHistory"
            :key="item.id"
            class="history-item"
          >
            <div class="history-description">{{ item.reason }}</div>
            <div class="history-right">
              <div
                class="history-points"
                :class="item.point > 0 ? 'positive' : 'negative'"
              >
                {{ item.point > 0 ? '+' : '' }}{{ item.point }}P
              </div>
              <div class="history-date">{{ formatDate(item.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- 포인트 기록이 없을 때 -->
        <div v-else class="no-history">아직 포인트 기록이 없습니다</div>

        <router-link to="/user/pointhistory" class="view-all-link">
          모든 포인트 기록 보기 →
        </router-link>
      </div>
    </div>

    <!-- 고객센터 섹션 -->
    <div class="support-section">
      <h3 class="section-title">고객센터</h3>
      <div class="support-list">
        <router-link to="/user/email/inquiry" class="support-item">
          <div class="support-icon">💬</div>
          <span>1:1 문의하기</span>
          <div class="arrow">›</div>
        </router-link>
        <router-link to="/user/my-inquiries" class="support-item">
          <div class="support-icon">💬</div>
          <span>문의내역</span>
          <div class="arrow">›</div>
        </router-link>
      </div>
    </div>

    <!-- 약관 및 로그아웃 섹션 -->
    <div class="footer-section">
      <!-- <router-link to="/user/term" class="footer-link"
        >약관 및 보안</router-link
      > -->
      <button
        class="logout-btn"
        @click="openLogoutModal"
        :disabled="isLoggingOut"
      >
        {{ isLoggingOut ? '로그아웃 중...' : '로그아웃' }}
      </button>

      <AlertModal
        v-model:show="showLogoutModal"
        type="confirm"
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        @confirm="handleLogoutConfirm"
        @cancel="showLogoutModal = false"
      />
    </div>

    <!-- 프로필 사진 수정 모달 -->
    <div v-if="showPhotoModal" class="modal-overlay" @click="closePhotoModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>프로필 사진 변경</h3>
          <button class="close-btn" @click="closePhotoModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="photo-preview">
            <img :src="previewUrl || profileImage" :alt="userInfo.nickName" />
          </div>

          <input
            id="photoInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />

          <button class="select-photo-btn" @click="triggerFileInput">
            📁 사진 선택
          </button>

          <button
            v-if="userInfo.pic"
            class="delete-photo-btn"
            @click="deleteProfilePhoto"
          >
            🗑️ 사진 삭제
          </button>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closePhotoModal">취소</button>
            <button class="save-btn" @click="saveProfilePhoto">저장</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- AlertModal -->
  <AlertModal
    :show="modal.show"
    :title="modal.title"
    :message="modal.message"
    :type="modal.type"
    :confirmText="modal.confirmText"
    :cancelText="modal.cancelText"
    @confirm="modal.onConfirm ? modal.onConfirm() : closeAlert()"
    @cancel="modal.onCancel ? modal.onCancel() : closeAlert()"
    @close="closeAlert"
  />
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
    position: relative;

    .profile-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);

        .photo-overlay {
          opacity: 1;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .photo-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s ease;
        font-size: 28px;
      }
    }

    .profile-info {
      flex: 1;

      .nickname {
        font-size: 24px;
        font-weight: bold;
        margin: 0 0 8px 0;
        color: #393e46;
      }

      .email {
        font-size: 14px;
        opacity: 0.9;
        margin: 0;
        color: #393e46;
      }
      .arrow {
        position: absolute;
        right: 20px;
        top: 50%;
        font-size: 24px;
        color: #ccc;
      }
    }
  }
}

// 모달 스타일
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s ease;

    &:hover {
      background: #f0f0f0;
    }
  }
}

.modal-body {
  padding: 24px;

  .photo-preview {
    width: 200px;
    height: 200px;
    margin: 0 auto 24px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .select-photo-btn {
    width: 100%;
    padding: 12px;
    background: #f0f0f0;
    border: 2px dashed #ccc;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 12px;

    &:hover {
      background: #e0e0e0;
      border-color: #999;
    }
  }

  .delete-photo-btn {
    width: 100%;
    padding: 12px;
    background: #fff;
    border: 2px solid #dc3545;
    border-radius: 8px;
    font-size: 16px;
    color: #dc3545;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 24px;

    &:hover {
      background: #dc3545;
      color: white;
    }
  }

  .modal-actions {
    display: flex;
    gap: 12px;

    button {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background: #f0f0f0;
      color: #666;

      &:hover {
        background: #e0e0e0;
      }
    }

    .save-btn {
      background: #667eea;
      color: white;

      &:hover {
        background: #5568d3;
        transform: translateY(-1px);
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

    .loading-message,
    .no-history {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 14px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #fff3c4;

      &:last-of-type {
        border-bottom: none;
      }

      .history-description {
        flex: 1;
        font-weight: 500;
        font-size: 14px;
      }

      .history-right {
        display: flex;
        align-items: center;
        gap: 8px;
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
        font-size: 13px;
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

  .modal-content {
    width: 95%;
  }
}
.arrowpic {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: #ccc;
}
</style>
