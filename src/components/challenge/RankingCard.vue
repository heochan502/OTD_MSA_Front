<script setup>
import { defineProps, computed, onMounted } from 'vue';
import { useAuthenticationStore } from '@/stores/user/authentication';

const auth = useAuthenticationStore();
const props = defineProps({
  rankingDetail: {
    type: Object,
  },
  isMe: {
    type: Boolean,
    default: false,
  },
});
const defaultProfile = '/otd/image/main/default-profile.png';
const FILE_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = `/home/green/download/profile/${props.rankingDetail}/`;

// pic이 있으면 그걸 쓰고, 없으면 기본 이미지
const profileImage = computed(() => {
  if (props.isMe) {
    // 내 프로필은 authStore 기준
    return auth.state.signedUser.pic || defaultProfile;
  }
  // 다른 사람 프로필은 rankingDetail.pic 기준
  return props.rankingDetail?.pic
    ? `${FILE_URL}/profile/${props.rankingDetail.userId}/${props.rankingDetail.pic}`
    : defaultProfile;
});

const getBorderColor = (rank) => {
  if (rank === 1) return '#ffba57';
  if (rank === 2) return '#9e9e9e';
  if (rank === 3) return '#ce7430';
  return '#fafafa';
};
onMounted(() => {
  console.log('BASEURL', BASE_URL);
});
</script>

<template>
  <div>
    <div
      class="box otd-list-box-style otd-border"
      :class="{ 'my-rank': isMe }"
      :style="
        !isMe || props.rankingDetail.rank < 3
          ? { border: '2px solid ' + getBorderColor(props.rankingDetail.rank) }
          : {}
      "
    >
      <div class="box-wrap">
        <div class="rank otd-subtitle-2">
          <img
            v-if="props.rankingDetail.rank === 1"
            src="/image/challenge/medal1.png"
            width="30"
          />
          <img
            v-else-if="props.rankingDetail.rank === 2"
            src="/image/challenge/medal2.png"
            width="30"
          />
          <img
            v-else-if="props.rankingDetail.rank === 3"
            src="/image/challenge/medal3.png"
            width="30"
          />
          <span v-else>{{ props.rankingDetail.rank }}위</span>
        </div>
        <div class="user-info">
          <div class="profile">
            <img class="profile-image" :src="profileImage" alt="프로필이미지" />

            <div class="nick-name otd-body-2">
              {{ props.rankingDetail.nickName }}
            </div>
          </div>
        </div>
        <div class="value otd-body-3">
          {{ props.rankingDetail.formattedTotalRecord }}
        </div>
        <img
          src="/image/challenge/me.png"
          alt="myRank"
          v-if="props.isMe"
          class="me-image"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  position: relative;
  // justify-content: space-around;
  width: 311px;
  height: 57px;
  .box-wrap {
    display: flex;
    position: relative;
    align-items: center;
    width: 100%;
    gap: 15px;
    padding: 0 10px;
    justify-content: space-between;
    .me-image {
      width: 30px;
      position: absolute;
      top: -7px;
      left: -7px;
    }
    .rank {
      flex: 0 0 50px; // 고정폭
      display: flex;
      justify-content: center;
    }
  }
}
.my-rank {
  // border: 2px solid transparent;
  // background-image: linear-gradient(#fff, #fff),
  //   linear-gradient(to right, #00c3ff, #ffff1c, #ff7a18, #ff00f5);
  border: 2px solid #00d5df;
  border-radius: 10px;
  background-origin: border-box;
  background-clip: padding-box, border-box;
}
.user-info {
  flex: 1; // 남은 영역 차지
  display: flex;
  align-items: center;
  .profile {
    display: flex;
    gap: 10px;
    align-items: center;

    .profile-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
}
.value {
  flex: 0 0 80px; // 오른쪽 값 고정폭
  text-align: right;
}
</style>
