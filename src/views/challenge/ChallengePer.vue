<script setup>
import RankingCard from '@/components/challenge/RankingCard.vue';
import { reactive, onMounted } from 'vue';
import Progress from '@/components/challenge/Progress.vue';
import { useRoute } from 'vue-router';
import { getRank } from '@/services/challenge/ChallengeService';

const props = defineProps({
  id: Number,
  name: String,
});
const route = useRoute();
const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const state = reactive({
  name: '',
  progress: { goal: '', totalRecord: '', percent: '' },
  myRank: '',
  ranking: [],
  totalUsers: '',
});

onMounted(async () => {
  const req = { userId: 1, year: year, month: month };
  const cdId = props.id;
  const res = await getRank(cdId, req);
  state.progress.goal = res.data.goal;
  state.progress.totalRecord = res.data.totalRecord;
  state.progress.percent = res.data.percent;
  state.myRank = res.data.myRank;
  state.ranking = res.data.ranking;
  state.totalUsers = res.data.totalUsers;
  console.log('per res.data', res);
});
</script>

<template>
  <div>
    <!-- 진행률 -->
    <div>
      <div>현재 {{ state.progress.totalRecord }} 달렸어요!</div>
      <Progress :indata-progress="state.progress.percent"></Progress>
    </div>
    <!-- 랭킹 -->
    <div>
      <div>
        <div>챌린지 랭킹</div>
        <div>내 랭킹 : {{ state.myRank }}등</div>
      </div>
      <div v-for="ranking in state.ranking" :key="ranking">
        <RankingCard :ranking-detail="ranking"></RankingCard>
      </div>
      <div>{{ state.totalUsers }}명이 참여했어요!</div>
    </div>
  </div>
</template>

<style scoped></style>
