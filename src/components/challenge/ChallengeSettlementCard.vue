<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  settlementData: {},
});

const FILE_URL = import.meta.env.VITE_BASE_URL;
</script>

<template>
  <div class="settlement-card">
    <div class="left">
      <img
        :src="`${FILE_URL}${props.settlementData.image}`"
        :alt="`${props.settlementData.name}`"
        class="challenge-card otd-box-shadow"
      />
    </div>
    <div class="right">
      <div>{{ props.settlementData.name }} 챌린지</div>
      <div>
        <span>획득 포인트 : {{ props.settlementData.reward }}P</span>
        <br />
        <span>획득 경험치 : {{ props.settlementData.xp }}XP</span>
      </div>
      <div v-if="props.settlementData.extraReward > 0">
        + {{ props.settlementData.extraReward }}P
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settlement-card {
  display: flex;
  .left {
    .challenge-card {
      width: 100px;
    }
  }
  .right {
  }
}
</style>
