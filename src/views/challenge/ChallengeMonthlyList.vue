<script setup>
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { reactive, onMounted } from 'vue';
import { getMapChallenge } from '@/services/challenge/ChallengeService';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css/autoplay';

const state = reactive({
  ChallengeList: [],
});

onMounted(async () => {
  const type = history.state.type;
  const year = history.state.year;
  const month = history.state.month;

  console.log('type', type);
  const res = await getMapChallenge(1, year, month, type);
  console.log('monthdata', res.data);
  state.ChallengeList = res.data;
});
</script>

<template>
  <div class="wrap">
    <div v-for="(list, category) in state.ChallengeList" :key="category">
      <div class="otd-category">{{ `${category}` }}</div>
      <Swiper
        :modules="[Autoplay]"
        :slides-per-view="2"
        :space-between="15"
        loop
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
      >
        <SwiperSlide v-for="challenge in list">
          <ChallengeCard
            class="challenge-card"
            :key="challenge.id"
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
            :reward="challenge.reward"
          ></ChallengeCard>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<style scoped>
:deep(.swiper) {
  overflow: hidden;
}
:deep(.swiper-wrapper) {
  display: flex;
  cursor: grab;
}
</style>
