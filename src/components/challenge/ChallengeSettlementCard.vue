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
        :src="`${FILE_URL}/${props.settlementData.image}`"
        :alt="`${props.settlementData.name}`"
        class="challenge-card otd-box-shadow"
      />
    </div>
    <div class="right">
      <h8>{{ props.settlementData.name }} 챌린지</h8>
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
  gap: 20px;
  justify-content: center;
  .left {
    .challenge-card {
      width: 100px;
    }
  }
  .right {
  }
}

h8 {
  font-size: 15px;
  font-weight: 700;
  color: #222;
  align-self: center;
  margin-bottom: 8px;
}
span {
  font-size: 13px;
  color: #444;
  width: 100%;
}
</style>
