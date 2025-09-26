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
  exp: Number,
});

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
        <span>목표 : {{ goal + unit }}</span>
        <span>경험치 : {{ exp }}xp</span>
        <span>보상 : {{ reward }}p</span>
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
    align-items: center;
    justify-content: center;
  }
}
</style>
