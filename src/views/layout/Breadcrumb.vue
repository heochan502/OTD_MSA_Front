<script setup>
import { useRoute, useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';
import weather from '@/components/weather/weather.vue';
import { useHeaderStore } from '@/stores/challenge/headerStore';
import { useAuthenticationStore } from '@/stores/user/authentication';
import { reissue } from '@/services/user/userService';

// 알림 스토어
import { storeToRefs } from 'pinia';
import { useNotificationStore } from '@/stores/notification/notification';

// 알림 스토어 인스턴스/배지 개수
const n = useNotificationStore();
const { unreadCount } = storeToRefs(n);

const route = useRoute();
const router = useRouter();
const headerStore = useHeaderStore();
const authentication = useAuthenticationStore();
const userInfo = computed(() => ({
  nickName: authentication.state.signedUser.nickName,
  userPoint: authentication.state.signedUser.point,
  pic: authentication.state.signedUser.pic,
  xp: authentication.state.signedUser.xp,
}));
const myRole = computed(() => authentication.state.signedUser?.userRole || '');

const categoryLabelMap = {
  free: '자유수다',
  diet: '다이어트',
  work: '운동',
  love: '연애',
};
const headerType = computed(() => route.meta.headerType ?? 'logo');
const showUserPanel = computed(() => route.meta.showUserPanel === true);

const headerTitle = computed(() => {
  if (route.name === 'ChallengePer' || route.name === 'ChallengeDay') {
    return headerStore.detailName + ' 챌린지';
  }
  const metaTitle = route.meta.title;

  // 1. meta.title이 함수라면 실행 결과 리턴
  if (typeof metaTitle === 'function') {
    return metaTitle(route);
  }
  // 2. 문자열이면 그대로 사용
  if (typeof metaTitle === 'string') {
    return metaTitle;
  }
  // 3. meta.title이 없고, 커뮤니티 카테고리 라우트라면 categoryLabelMap 활용
  if (route.name === 'CommunityCategory') {
    return categoryLabelMap[route.params.category] ?? '커뮤니티';
  }
  return '';
});

const defaultProfile = '/otd/image/main/default-profile.png';
// pic이 있으면 그걸 쓰고, 없으면 기본 이미지
const profileImage = computed(() => {
  return userInfo.value?.pic ? userInfo.value.pic : defaultProfile;
});

// 알람 클릭
const handleClick = async () => {
  // 알림 목록 새로 불러오기
  try {
    await n.load();
  } catch (err) {
    console.error('알림 불러오기 실패:', err);
  }

  // 알림 페이지로 이동
  router.push({ name: 'NotificationsView' });
};

// 포인트 포맷팅
const formatPoint = (point) => {
  return point?.toLocaleString() || '0';
};
onMounted(() => {});
</script>

<template>
  <div class="top-header">
    <!-- 로고 출력 -->
    <div class="title" v-if="route.meta.headerType === 'logo'">
      <img class="otd-logo" src="/image/main/ontoday_logo.png" alt="로고" />
      <img
        class="alram"
        src="/image/main/alarm.png"
        alt="알람"
        @click="handleClick"
      />
    </div>
    <!-- 타이틀 출력 -->
    <div class="title" v-else>
      <button class="black-btn" @click="$router.back()" aria-label="뒤로가기">
        <img class="back-btn" src="/image/main/back_icon.png" alt="뒤로가기" />
      </button>
      <div class="hearder-text">{{ headerStore.detailName }}</div>
      <img
        class="alram"
        src="/image/main/alarm.png"
        alt="알람"
        @click="handleClick"
      />
    </div>
  </div>

  <div class="user" v-if="route.name === 'Home'">
    <!-- 일반 유저 -->
    <template v-if="myRole !== 'ADMIN'">
      <div class="user-profile">
        <img class="avatar otd-shadow" :src="profileImage" alt="프로필" />
        <div class="info">
          <weather />
          <span class="otd-title">{{ userInfo.nickName }} 님</span>
        </div>
      </div>
      <div class="point otd-body-1">
        <router-link
          to="/pointshop"
          class="pointShop"
          :class="{ active: route.path.startsWith('/pointshop') }"
        >
          <div class="point-wrap">
            <img class="point-img" src="/image/main/point.png" alt="포인트" />
            <span>{{ formatPoint(userInfo.userPoint) }}</span>
          </div>
        </router-link>
      </div>
    </template>

    <!-- 관리자 -->
    <template v-else>
      <div class="admin-panel">
        <router-link to="/admin" class="admin-btn">
          관리자 페이지로 이동
        </router-link>
      </div>
    </template>
  </div>
</template>
<style scoped>
.admin-btn {
  display: inline-block;
  padding: 10px 16px;
  background: #ff595e;
  color: #fff;
  font-weight: 700;
  border-radius: 10px;
  text-decoration: none;
}
.image {
  /* position: absolute; */
  position: fixed;
  width: 390px;
  right: 1px;
  top: 1px;
}
.title {
  display: flex;
  justify-content: space-between;
  position: absolute;

  bottom: 10px;
  /* margin-top: 38px; */
  /* margin-bottom: 15px; */
  margin: 0 20px 0;

  height: 43px;
  max-width: 100%;
  min-width: 320px;

  /* background: #00D5DF; */
}
.point-img {
  width: 20px;
  height: 20px;
}
.point-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}
.otd-logo {
  max-width: 500px;
}
.hearder-text {
  color: #fafafa;
  font-size: 20px;
  font-weight: bold;
  align-self: center;
}

.back-btn {
  width: 12px;
  height: 24px;
  cursor: pointer;
}
.alram {
  align-self: center;
  width: 25px;
  height: 25px;
  right: 20%;
  cursor: pointer;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: end;
  font-size: 12px;
  row-gap: 5px;
  margin-left: 15px;
}

.top-header {
  display: flex;
  justify-content: center;

  position: relative;
  background: #00d5df;
  color: #000;
  padding-bottom: 15px;
  height: 70px;
  width: 100%;
  /* 노치 safezone 설정 */
  padding-top: env(safe-area-inset-top);
}
.user-profile {
  display: flex;
  flex-direction: row;
}

.user {
  margin: 20px;
  display: flex;
  align-items: center;

  justify-content: space-between;
}
.point {
  display: flex;
  justify-content: center;
  align-self: flex-end;
  gap: 5px;
  cursor: pointer;
}
.pointShop {
  padding-top: 2px;
  color: #303030;
  text-decoration: none;
  display: flex;
  align-items: end;
  span {
    margin-left: 7px;
  }
}

.avatar {
  /* font-size: 32px; */
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
}
</style>
