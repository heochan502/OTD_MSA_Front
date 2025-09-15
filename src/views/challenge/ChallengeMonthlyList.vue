<script setup>
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { reactive, onMounted} from 'vue';
import { getChallenge } from '@/services/challenge/ChallengeService';

const state = reactive({
  ChallengeList: [],
});

onMounted(async () => {
  const type = history.state.type;
  const year = history.state.year;
  const month = history.state.month;

  console.log('type', type);
  const res = await getChallenge(1, year, month, type);
  console.log('resmonthdata', res.data);
  state.ChallengeList = res.data;
});
</script>

<template>
  <div>
    <div v-for="challenge in state.ChallengeList" :key="id">
      <ChallengeCard
        class="challenge-card"
        :key="challenge.id"
        :id="challenge.id"
        :image="challenge.image"
        :name="challenge.name"
        :reward="challenge.reward"
      ></ChallengeCard>
    </div>
    <!-- <div v-for="(list, category) in state.ChallengeList" :key="category">
      <div class="sub-title">{{ `> ${category}` }}</div>
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
    </div> -->
  </div>
</template>

<style scoped></style> 
