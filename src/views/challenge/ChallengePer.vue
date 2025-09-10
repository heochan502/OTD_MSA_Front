<script setup>
import RankingCard from '@/components/challenge/RankingCard.vue';
import { reactive } from 'vue';

const state = reactive({
  ranking: [],
});
</script>

<template>
  <div>
    <!-- 진행률 -->
    <div>
      <div>현재 ${state.} 달렸어요!</div>
      <div>progress</div>
    </div>
    <!-- 랭킹 -->
    <div>
      <div>
        <div>챌린지 랭킹</div>
        <div>내 랭킹 : ${state.}</div>
      </div>
      <div v-for="ranking in state.ranking" :key="ranking">
        <RankingCard :ranking-detail="ranking"></RankingCard>
        <div>${state.}명이 참여했어요! </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
