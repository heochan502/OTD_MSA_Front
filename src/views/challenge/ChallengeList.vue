<script setup>
import { onMounted, reactive } from 'vue';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { getAll } from '@/services/challenge/ChallengeService';

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
  <div>
    <!-- 주간 챌린지 -->
    <div>
      <div>진행중인 주간 챌린지</div>
      <div v-for="challenge in state.weeklyChallenge" :key="challenge.id">
        <ChallengeCard
          :id="challenge.id"
          :image="challenge.image"
          :name="challenge.name"
          :reward="challenge.reward"
        ></ChallengeCard>
      </div>
    </div>
    <!-- 월간 경쟁 챌린지 -->
    <div>
      <div>월간 경쟁 챌린지</div>
      <div v-for="(list, category) in state.monthlyChallenge" :key="category">
        <div>{{ `> ${category}` }}</div>
        <div v-for="challenge in list" :key="challenge.id">
          <ChallengeCard
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
            :reward="challenge.reward"
          ></ChallengeCard>
        </div>
      </div>
      <!-- 월간 개인 챌린지 -->
      <div>
        <div>월간 개인 챌린지</div>
        <div v-for="challenge in state.dailyChallenge" :key="challenge.id">
          <ChallengeCard
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
            :reward="challenge.reward"
          ></ChallengeCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
