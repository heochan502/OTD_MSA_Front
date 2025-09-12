<script setup>
import { onMounted, reactive } from 'vue';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { getAll } from '@/services/challenge/ChallengeService';
import { Swiper, SwiperSlide } from 'swiper/vue';

const state = reactive({
  weeklyChallenge: [],
  monthlyChallenge: [],
  dailyChallenge: [],
});

onMounted(async () => {
  const res = await getAll();
  state.weeklyChallenge = res.data.weeklyChallenge;
  state.monthlyChallenge = res.data.monthlyChallenge;
  state.dailyChallenge = res.data.dailyChallenge;

  console.log('data', res.data);
});

</script>

<template>
  <div class="wrap">
    <!-- 주간 챌린지 -->
    <div>
      <div class="first-title">주간 챌린지</div>
      <Swiper :slides-per-view="2" :space-between="15" loop>
        <SwiperSlide v-for="challenge in state.weeklyChallenge">
          <ChallengeCard
            class="challenge-card"
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
            :reward="challenge.reward"
          ></ChallengeCard>
        </SwiperSlide>
      </Swiper>
    </div>
    <!-- 월간 경쟁 챌린지 -->
    <div>
      <div class="title">월간 경쟁 챌린지</div>
      <div v-for="(list, category) in state.monthlyChallenge" :key="category">
        <div class="sub-title">{{ `> ${category}` }}</div>
        <Swiper :slides-per-view="2" :space-between="15" loop>
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
      <!-- 월간 개인 챌린지 -->
      <div>
        <div class="title">월간 개인 챌린지</div>
        <Swiper :slides-per-view="2" :space-between="15" loop>
          <SwiperSlide v-for="challenge in state.dailyChallenge">
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
  </div>
</template>

<style lang="scss" scoped>
.wrap {
  user-select: none;
}
:deep(.swiper-wrapper) {
  display: flex;
  cursor: grab;
}
.first-title {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
}
.title {
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
}

.sub-title {
  font-size: 12px;
  margin-bottom: 15px;
}
</style>
