<script setup>
import { defineProps } from 'vue';
import { useAuthenticationStore } from '@/stores/user/authentication';

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  reward: Number,
});
const auth = useAuthenticationStore();
const userTier = auth.state.signedUser.challengeRole;
const FILE_URL = import.meta.env.VITE_BASE_URL;
</script>

<template>
  <div class="challenge-card otd-box-shadow">
    <img
      :src="`${FILE_URL}/${props.image}`"
      :alt="`${props.name}`"
      class="challenge-img"
    />
    <div class="point-box">
      <img src="/image/main/point.png" alt="point" class="point" />
      <span class="point-text">{{ `${props.reward}P` }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.challenge-card {
  position: relative; /* ← point-box 기준 */
  width: 168px;
  height: 121px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  .challenge-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .point-box {
    display: flex;
    align-items: center;
    position: absolute;
    justify-content: space-between;
    width: 45px;
    height: 20px;
    border-radius: 10px;
    background-color: #d9d9d9;
    top: 5px;
    right: 5px;
    gap: 2px;

    .point {
      margin-left: 4px;
      width: 14px;
    }

    .point-text {
      font-size: 9px;
      color: #fafafa;
      line-height: 1;
      position: relative;
      top: -0.5px;
      margin-right: 4px;
    }
  }
}
</style>
