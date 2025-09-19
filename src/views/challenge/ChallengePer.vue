<script setup>
import RankingCard from '@/components/challenge/RankingCard.vue';
import { reactive, onMounted, ref } from 'vue';
import Progress from '@/components/challenge/Progress.vue';
import { getRank, putSuccess } from '@/services/challenge/ChallengeService';
import { useChallengeStore } from '../../stores/challenge/challengeStore';
import { useHeaderStore } from '@/stores/challenge/headerStore';
const props = defineProps({
  id: Number,
  name: String,
});
const challengeStore = useChallengeStore();
const headerStore = useHeaderStore();
const year = challengeStore.state.year;
const month = challengeStore.state.month;

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
  const myRank = state.progress.myRank;
  const myIdx = state.aroundRanking.findIndex(
    (r) => r.userId === state.progress.userId
  );
  const myTotalRecord = Number(state.aroundRanking[myIdx].totalRecord);

  // 앞뒤 값 안전하게 가져오기
  const beforeMe = state.aroundRanking[myIdx - 1]?.totalRecord
    ? Number(state.aroundRanking[myIdx - 1].totalRecord)
    : null;
  const afterMe = state.aroundRanking[myIdx + 1]?.totalRecord
    ? Number(state.aroundRanking[myIdx + 1].totalRecord)
    : null;

  if (myRank === 1 && afterMe !== null) {
    // 1등일 때 → 아래사람과 비교
    recordGap.value = (myTotalRecord - afterMe).toFixed(1);
    ment.value = `2위와 ${recordGap.value}${state.progress.unit} 차이!`;
  } else if (beforeMe !== null) {
    // 위사람과 비교
    recordGap.value = (beforeMe - myTotalRecord).toFixed(1);
    ment.value = `${recordGap.value}${state.progress.unit}만 더 하면 ${
      myRank - 1
    }위!`;
  } else {
    ment.value = `아직 비교할 상대가 없어요 😅`;
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
  headerStore.setDetailName(res.data.name);
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
          state.progress.totalRecord == 0
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
        <div class="otd-body-3">
          {{ state.progress.totalUsers }}명이 참여했어요!
        </div>
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
            <template v-if="state.activeTab === 'around'">
              {{ ment }}
            </template>
            <template v-else-if="state.progress.myRank <= 5">
              {{ ment }}
            </template>
            <template v-else>
              나는 현재 {{ state.progress.myRank }}위에 있어요!
            </template>
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
