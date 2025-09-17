<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  rankingDetail: {
    type: Array,
    default: () => [],
    // rank: '',
    // memebrId: 0,
    // prifileImage: '',
    // nickName: '',
    // data: '',
  },
});
</script>

<template>
  <div>
    <div class="box otd-box-style otd-border">
      <div class="rank otd-subtitle-2">{{ props.rankingDetail.rank }}위</div>
      <div class="image">{{ props.rankingDetail.profileImage }}</div>
      <div class="nick-name otd-body-2">{{ props.rankingDetail.nickName }}</div>
      <div class="value otd-body-3">{{ props.rankingDetail.totalRecord }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 15px;
  width: 311px;
  height: 57px;
}
</style>
