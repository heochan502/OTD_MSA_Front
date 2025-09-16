<script setup>
import { onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { getSelectedAll } from '@/services/challenge/ChallengeService';
import Calendar from '@/components/challenge/Calendar.vue';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { useChallengeStore } from '@/stores/challenge/challengeStore';

const challengeStore = useChallengeStore();

const router = useRouter();

const year = challengeStore.state.year;
const month = challengeStore.state.month;

const state = reactive({
  weeklyChallenge: [],
  competitionChallenge: [],
  personalChallenge: [],
  dailyMission: [],
});

const toChallengeList = () => {
  router.push('challenge/alllist');
};

const toList = async (type) => {
  router.push({
    name: `Challenge${type}List`,
    state: {
      year,
      month,
      type,
    },
  });
};

const detail = (id) => {
  router.push({
    name: 'ChallengeDetail',
    params: { id },
  });
};

onMounted(async () => {
  console.log('date', year, month);
  const res = await getSelectedAll(1, year, month);
  state.weeklyChallenge = res.data.weeklyChallenge;
  state.competitionChallenge = res.data.competitionChallenge;
  state.personalChallenge = res.data.personalChallenge;
  state.dailyMission = res.data.dailyMission;
  challengeStore.state.progressChallenge = res.data;
  console.log('data', res.data);
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
      <ChallengeCard
        v-for="challenge in state.dailyMission"
        :key="challenge.cdId"
        :id="challenge.cdId"
        :image="challenge.image"
        :name="challenge.name"
        :reward="challenge.reward"
        @click="detail(challenge.cdId)"
      ></ChallengeCard>
      <div
        v-for="n in Math.max(0, 2 - state.dailyMission.length)"
        :key="'dm-' + n"
        class="empty-card"
        @click="toList('daily')"
      >
        <span
          >새로운 미션에 <br />
          도전해보세요!</span
        >
      </div>
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
              :key="challenge.cdId"
              :id="challenge.cdId"
              :image="challenge.image"
              :name="challenge.name"
              :reward="challenge.reward"
              @click="detail(challenge.cdId)"
            ></ChallengeCard>
            <div
              v-for="n in Math.max(0, 2 - state.weeklyChallenge.length)"
              :key="'w-' + n"
              class="empty-card"
              @click="toList('weekly')"
            >
              <span
                >새로운 챌린지에 <br />
                도전해보세요!</span
              >
            </div>
          </div>
        </div>
        <!-- 월간 챌린지 -->
        <div>
          <div class="title">진행중인 월간 챌린지</div>
          <!-- 경쟁 -->
          <div>
            <div class="sub-title">> 경쟁 챌린지</div>
            <div class="challenge-card">
              <ChallengeCard
                v-for="challenge in state.competitionChallenge"
                :key="challenge.cdId"
                :id="challenge.cdId"
                :image="challenge.image"
                :name="challenge.name"
                :reward="challenge.reward"
                @click="detail(challenge.cdId)"
              ></ChallengeCard>
              <div
                v-for="n in Math.max(0, 2 - state.competitionChallenge.length)"
                :key="'m-' + n"
                class="empty-card"
                @click="toList('competition')"
              >
                <span
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
                v-for="challenge in state.personalChallenge"
                :key="challenge.cdId"
                :id="challenge.cdId"
                :image="challenge.image"
                :name="challenge.name"
                :reward="challenge.reward"
                @click="detail(challenge.cdId)"
              ></ChallengeCard>
              <div
                v-for="n in Math.max(0, 2 - state.personalChallenge.length)"
                :key="'d-' + n"
                class="empty-card"
                @click="toList('personal')"
              >
                <span
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
