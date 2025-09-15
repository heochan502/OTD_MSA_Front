<script setup>
import { onMounted, reactive } from 'vue';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { useRouter } from 'vue-router';

import {
  getSelectedAll,
  getChallenge,
} from '@/services/challenge/ChallengeService';

import Calendar from '@/components/challenge/Calendar.vue';

const router = useRouter();

const state = reactive({
  weeklyChallenge: [],
  monthlyChallenge: [],
  dailyChallenge: [],
});

const toChallengeList = () => {
  router.push('challenge/list');
};

const toList = async (keyword) => {
  const res = await getChallenge(keyword);
  console.log(res);
};

onMounted(async () => {
  const res = await getSelectedAll(1);
  state.weeklyChallenge = res.data.weeklyChallenge;
  state.monthlyChallenge = res.data.monthlyChallenge;
  state.dailyChallenge = res.data.dailyChallenge;
  console.log(res.data);
});
</script>

<template>
  <div class="wrap">
    <!-- 일간 미션 -->
    <div class="daily">
      <div class="first-title">진행중인 일일 미션</div>
      <div class="route-list" @click="toChallengeList">
        > 미션 / 챌린지 목록 보기
      </div>
    </div>
    <div class="challenge-card">
      <!-- <ChallengeCard></ChallengeCard>
      <div
        v-for="n in Math.max(0, 2 - state.dailyMission.length)"
        :key="'dm-' + n"
        class="empty-card"
        @click="toList"
      >
        <span
          >새로운 미션에 <br />
          도번해보세요!</span
        >
      </div> -->
    </div>
    <!-- 주간 챌린지 -->
    <div>
      <div>
        <div class="title">진행중인 주간 챌린지</div>
        <div class="weekly">
          <!-- <div class="route-list" @click="toChallengeList">
          > 챌린지 목록 보기
        </div> -->
          <!-- 주간 챌린지 -->
          <div class="challenge-card">
            <ChallengeCard
              v-for="challenge in state.weeklyChallenge"
              :id="challenge.id"
              :image="challenge.image"
              :name="challenge.name"
              :reward="challenge.reward"
            ></ChallengeCard>
            <div
              v-for="n in Math.max(0, 2 - state.weeklyChallenge.length)"
              :key="'w-' + n"
              class="empty-card"
            >
              <span @click="toList('weekly')"
                >새로운 챌린지에 <br />
                도전해보세요!</span
              >
            </div>
          </div>
          <ChallengeCard
            v-for="challenge in state.weeklyChallenge"
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
          ></ChallengeCard>
        </div>
        <!-- 월간 챌린지 -->
        <div>
          <div class="title">진행중인 월간 챌린지</div>
          <!-- 경쟁 -->
          <div>
            <div class="sub-title">> 경쟁 챌린지</div>
            <div class="challenge-card">
              <ChallengeCard
                v-for="challenge in state.monthlyChallenge"
                :key="challenge.id"
                :id="challenge.id"
                :image="challenge.image"
                :name="challenge.name"
                :reward="challenge.reward"
              ></ChallengeCard>
              <div
                v-for="n in Math.max(0, 2 - state.monthlyChallenge.length)"
                :key="'m-' + n"
                class="empty-card"
              >
                <span @click="toList('monthly')"
                  >새로운 챌린지에 <br />
                  도전해보세요!</span
                >
              </div>
            </div>
          </div>
          <!-- 개인 -->
          <div>
            <div class="sub-title">> 개인 챌린지</div>
            <div class="challenge-card">
              <ChallengeCard
                v-for="challenge in state.dailyChallenge"
                :key="challenge.id"
                :id="challenge.id"
                :image="challenge.image"
                :name="challenge.name"
                :reward="challenge.reward"
              ></ChallengeCard>
              <div
                v-for="n in Math.max(0, 2 - state.dailyChallenge.length)"
                :key="'d-' + n"
                class="empty-card"
              >
                <span @click="toList('daily')"
                  >새로운 챌린지에 <br />
                  도전해보세요!</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Calendar></Calendar>
  </div>
</template>

<style lang="scss" scoped>
.weekly,
.daily {
  display: flex;
  justify-content: space-between;
  // align-items: center;
  .route-list {
    margin-top: 5px;
    font-size: 12px;
  }
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
.challenge-card {
  display: grid;
  grid-template-columns: repeat(2, 168px); // 가로 2칸
  gap: 15px;
}
.empty-card {
  display: flex;
  margin-bottom: 15px;
  width: 168px;
  height: 121px;
  border-radius: 10px;
  background-color: #e6e6e6;
  border: 1px dashed #989898;
  cursor: pointer;
  font-size: 12px;
  align-items: center;
  justify-content: center;
}
</style>
