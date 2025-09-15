<script setup>
import RankingCard from "@/components/challenge/RankingCard.vue";
import { reactive, onMounted } from "vue";
import Progress from "@/components/challenge/Progress.vue";
import { useRoute } from "vue-router";

const props = defineProps({
  id: Number,
  name: String,
});
const route = useRoute();
const state = reactive({
  ranking: [],
});

onMounted(() => {
  route.meta.title = props.name;

  console.log("per", props.name);
  console.log("per", props.id);
});
</script>

<template>
  <div>
    <!-- 진행률 -->
    <div>
      <div>현재 ${state.} 달렸어요!</div>
      <Progress></Progress>
    </div>
    <!-- 랭킹 -->
    <div>
      <div>
        <div>챌린지 랭킹</div>
        <div>내 랭킹 : ${state.}</div>
      </div>
      <div v-for="ranking in state.ranking" :key="ranking">
        <RankingCard :ranking-detail="ranking"></RankingCard>
        <div>${state.}명이 참여했어요!</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
