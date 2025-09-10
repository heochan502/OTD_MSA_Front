<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  challengeId: 0,
  image: '',
  name: '',
  reward: 0,
});
</script>

<template>
  <div class="challenge-card">
    <img :src="`${props.image}`" :alt="`${props.name}`" class="challenge-img" />
    <div class="point-box">
      <img src="/image/main/point.png" alt="point" class="point" />
      <span class="point-text">{{ `${props.reward}P` }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.challenge-card {
  position: relative;
  width: 168px;
  height: 121px;
  border-radius: 10px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  .challenge-img {
    width: 168px;
    height: 121px;
  }
  
  .point-box {
    display: flex;
    align-items: center;
    position: absolute;
    width: 45px;
    height: 20px;
    border-radius: 10px;
    background-color: #d9d9d9;
    top: 5px;
    right: 5px;

    .point {
      width: 14px;
    }

    .point-text {
      font-size: 9px;
      color: #fafafa;
    }
  }
}
</style>
