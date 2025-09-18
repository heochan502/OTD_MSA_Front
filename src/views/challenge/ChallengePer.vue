<script setup>
import RankingCard from '@/components/challenge/RankingCard.vue';
import { reactive, onMounted, ref } from 'vue';
import Progress from '@/components/challenge/Progress.vue';
import { getRank, putSuccess } from '@/services/challenge/ChallengeService';

const props = defineProps({
  id: Number,
  name: String,
});
const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const state = reactive({
  progress: {},
  aroundRanking: [],
  topRanking: [],
  activeTab: 'around',
});
const aroundRankingList = () => {
  state.activeTab = 'around';
};
const topRankingList = () => {
  state.activeTab = 'top';
};
const ment = ref('null');

const recordGap = ref('');
const gap = () => {
  let myIdx;

  myIdx = state.aroundRanking.findIndex(
    (r) => r.userId === state.progress.userId
  );
  const beforeIdx = myIdx - 1;
  const afterIdx = myIdx + 1;
  const myTotalRecord = state.aroundRanking[myIdx].totalRecord;
  const beforeMe = state.aroundRanking[beforeIdx].totalRecord;
  const afterMe = state.aroundRanking[afterIdx].totalRecord;

  if (state.progress.myRank === 1) {
    recordGap.value = (myTotalRecord - afterMe).toFixed(1);
    ment.value;
    console.log('af', recordGap.value);
  } else {
    recordGap.value = (beforeMe - myTotalRecord).toFixed(1);
    ment.value = `만 더 하면 ${state.progress.myRank - 1}위!`;
    console.log('be', recordGap.value);
  }
};
onMounted(async () => {
  const req = { userId: 1, year: year, month: month };
  const cdId = props.id;
  const res = await getRank(cdId, req);
  state.progress = res.data;
  state.aroundRanking = res.data.aroundRanking;
  state.topRanking = res.data.topRanking;
  console.log('per res.data', res.data);
  gap();
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
          state.progress.formattedTotalRecord == 0
            ? '아직 기록이 없어요ㅠㅠ'
            : '현재 ' + state.progress.formattedTotalRecord + ' 달렸어요!'
        }}
      </div>
      <div class="otd-body-3">
        목표 {{ state.progress.goal + state.progress.unit }}
      </div>
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
      <div class="box otd-border otd-box-style">
        <div class="button otd-body-3">
          <button class="otd-border otd-box-style" @click="aroundRankingList">
            내 순위 보기
          </button>
          <button class="otd-border otd-box-style" @click="topRankingList">
            Top5 보기
          </button>
        </div>
        <div class="card">
          <div
            v-if="state.activeTab === 'around'"
            v-for="ranking in state.aroundRanking"
            :key="ranking.userId"
          >
            <RankingCard
              :is-me="ranking.userId === state.progress.userId"
              :ranking-detail="ranking"
            ></RankingCard>
          </div>
          <div v-else v-for="(ranking, idx) in state.topRanking" :key="idx">
            <RankingCard
              :is-me="ranking.userId === state.progress.userId"
              :ranking-detail="ranking"
            ></RankingCard>
          </div>
        </div>

        <div class="info">
          <div class="otd-body-3 my-info">
            {{ recordGap + state.progress.unit + ment }}
          </div>
        </div>
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
  margin-bottom: 20px;
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
}
.card {
  display: flex;
  gap: 15px;
  border: none;

  .me {
    width: 30px;
  }
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
.info {
  position: relative;
  width: 89%;
  .my-info {
    margin: 0 0 15px 0;
  }
}
</style>
