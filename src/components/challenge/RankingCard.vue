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
    <div>
      <div>{{ props.rankingDetail.rank }}</div>
      <div>{{ props.rankingDetail.prifileImage }}</div>
      <div>{{ props.rankingDetail.nickName }}</div>
      <div>{{ props.rankingDetail.data }}</div>
    </div>
  </div>
</template>

<style scoped></style>
