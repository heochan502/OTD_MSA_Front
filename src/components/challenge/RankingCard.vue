<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  rankingDetail: {
    type: Object,
  },
  isMe: {
    type: Boolean,
    default: false,
  },
});
const getBorderColor = (rank) => {
  if (rank === 1) return '#ffba57';
  if (rank === 2) return '#9e9e9e';
  if (rank === 3) return '#ce7430';
  return '#fafafa';
};
</script>

<template>
  <div>
    <div
      class="box otd-box-style otd-border"
      :class="{ 'my-rank': isMe && props.rankingDetail.rank > 3 }"
      :style="
        !isMe || props.rankingDetail.rank < 3
          ? { border: '2px solid ' + getBorderColor(props.rankingDetail.rank) }
          : {}
      "
    >
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
      <div class="image">{{ props.rankingDetail.profileImage }}</div>
      <div class="user-info">
        <div class="profile">
          {{ props.rankingDetail.pic }}
        </div>
        <div class="nick-name otd-body-2">
          {{ props.rankingDetail.nickName }}
        </div>
      </div>
      <div class="value otd-body-3">
        {{ props.rankingDetail.formattedTotalRecord }}
      </div>
      <img
        src="/public/image/challenge/me.png"
        alt="myRank"
        v-if="props.isMe"
        class="me-image"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-around;
  gap: 15px;
  width: 311px;
  height: 57px;
  .me-image {
    width: 30px;
    position: absolute;
    top: -7px;
    left: -7px;
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
  display: flex;
  gap: 10px;
}
</style>
