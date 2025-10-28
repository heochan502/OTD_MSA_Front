<script setup>
import { ref } from 'vue';
import ChallengeCard from './ChallengeCard.vue';

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  reward: Number,
  goal: Number,
  unit: String,
  note: String,
  exp: Number,
});
const formatNote = (note) => {};
const isFlipped = ref(false);
const toggleFlip = () => {
  isFlipped.value = !isFlipped.value;
};
</script>

<template>
  <div class="card-wrapper" @click="toggleFlip">
    <div class="card" :class="{ flipped: isFlipped }">
      <div class="card-front">
        <ChallengeCard :id="id" :image="image" :name="name" :reward="reward" />
      </div>

      <!-- 뒷면 -->
      <div class="card-back otd-border otd-shadow">
        <h8>{{ name }}</h8>
        <span class="center">보상 : {{ exp }}xp / {{ reward }}p</span>
        <span class="center">목표 : {{ goal + unit }}</span>
        <span class="center" v-if="props.note">설명 : {{ note }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-wrapper {
  width: 168px;
  height: 121px;
  .card {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s;
    border: none;
  }
  .card.flipped {
    transform: rotateY(180deg);
  }
  .card-front,
  .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }
  .card-back {
    transform: rotateY(180deg);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    border: solid 2px #5ee6eb;
    border-radius: 10px;
    background-color: #ffffff;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
    padding: 12px 16px;
    box-sizing: border-box;
    line-height: 1.5;

    h8 {
      font-size: 15px;
      font-weight: 700;
      color: #222;
      align-self: center;
      margin-bottom: 8px;
    }

    .center {
      text-align: center;
      font-weight: 600;
      margin-bottom: 6px;
    }
    /* 기본 span 스타일 */
    span {
      font-size: 13px;
      color: #444;
      width: 100%;
    }
  }
}
</style>
