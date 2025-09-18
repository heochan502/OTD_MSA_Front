<script setup>
import RankingCard from '@/components/challenge/RankingCard.vue';
import { reactive, onMounted } from 'vue';
import Progress from '@/components/challenge/Progress.vue';
import { useRoute } from 'vue-router';
import { getRank, putSuccess } from '@/services/challenge/ChallengeService';

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

  if (state.progress.percent >= 100 && res.data.success == false) {
    await putSuccess(res.data.cpId);
    console.log('목표 성공');
  }
});
</script>

<template>
  <div class="wrap">
    <!-- 진행률 -->
    <div class="title-wrap">
      <div class="otd-category">
        {{
          state.progress.percent == 0
            ? '아직 기록이 없어요ㅠㅠ'
            : '현재 ' + state.progress.totalRecord + ' 달렸어요!'
        }}
      </div>
      <div class="otd-body-3">목표 {{ state.progress.goal }}</div>
    </div>
    <Progress
      class="otd-top-margin"
      :indata-progress="state.progress.percent"
    ></Progress>
    <!-- 랭킹 -->
    <div>
      <div class="sub-wrap">
        <div class="otd-category">챌린지 랭킹</div>
        <div class="otd-body-3">{{ state.totalUsers }}명이 참여했어요!</div>
      </div>
      <div class="box otd-border otd-box-style otd-top-margin">
        <div class="button otd-body-3">
          <button class="otd-border otd-box-style">내 순위 보기</button>
          <button class="otd-border otd-box-style">Top5 보기</button>
        </div>

        <div v-for="(ranking, idx) in state.ranking" :key="idx">
          <RankingCard
            :class="`card-${idx}`"
            :ranking-detail="ranking"
          ></RankingCard>
        </div>

        <div class="otd-body-3 my-rank">내 순위 : {{ state.myRank }}위</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title-wrap {
  display: flex;
  justify-content: space-between;
}
.sub-wrap {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.otd-body-3 {
  margin-top: 10px;
  font-weight: 600;
}
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 351px;
  height: 442px;
}
.button {
  display: flex;
  justify-content: space-between;
  width: 89%;
  margin: 0;
  margin-top: 15px;
  .otd-border {
    width: 90px;
    height: 25px;
    background-color: #e6e6e6;
    color: #303030;
  }
}
.card-0 {
  :deep(.box) {
    border: 2px solid #ffba57;
  }
  :deep(.rank) {
    content: url('/public/image/challenge/medal1.png');
    width: 30px;
  }
}
.card-1 {
  :deep(.box) {
    border: 2px solid #9e9e9e;
  }
  :deep(.rank) {
    content: url('/public/image/challenge/medal2.png');
    width: 30px;
  }
}
.card-2 {
  :deep(.box) {
    border: 2px solid #ce7430;
  }
  :deep(.rank) {
    content: url('/public/image/challenge/medal3.png');
    width: 30px;
  }
}
.my-rank {
  margin: 0;
  margin-bottom: 15px;
}
</style>
