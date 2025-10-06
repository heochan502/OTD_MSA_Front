<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import Progress from '@/components/challenge/Progress.vue';
import ProgressJs from '@/components/challenge/ProgressJs.vue';

import LineChart from '@/components/exercise/lineChart.vue';

import MealCard from '@/components/meal/MealDayCards.vue';

import BmiProg from '@/components/exercise/BmiProg.vue';
import { getMyChallenge } from '@/services/challenge/challengeService';
import { useRouter } from 'vue-router';

import { getChallengeSettlementLog } from '@/services/challenge/challengeService';
import ChallengeSettlementCard from '@/components/challenge/ChallengeSettlementCard.vue';
import { useChallengeStore } from '@/stores/challenge/challengeStore';

const state = reactive({
  monthlySettlementLog: [],
  weeklySettlementLog: [],
});

const challengeInfo = ref([
  { challenge_name: '달리기 30km', progress: 62 },
  { challenge_name: '운동시간 60시간', progress: 82 },
  { challenge_name: '팔굽혀 펴기 100개', progress: 22 },
  { challenge_name: '운동시간 50시간', progress: 72 },
  { challenge_name: '일간 미션 ', progress: 100 },
]);
const router = useRouter();

const healthInfo = ref([
  { text: '체중(kg)', value: 70.5, check: true },
  { text: '체지방률(%)', value: 15.3, check: false },
  { text: '골격근량(kg)', value: 30.2, check: false },
]);

const fields = [
  { key: 'weight', label: '체중', unit: 'kg' },
  { key: 'BFP', label: '체지방률', unit: '%' },
  { key: 'SMM', label: '골격근량', unit: 'kg' },
];
const selectedField = ref(fields[0].key);

const inbodyData = ref([
  { dataTime: '2025-09-22', weight: '62.4', BFP: '20', SMM: '23' },
  { dataTime: '2025-09-23', weight: '62.1', BFP: '20.2', SMM: '22.9' },
  { dataTime: '2025-09-24', weight: '60.9', BFP: '20.1', SMM: '23.1' },
  { dataTime: '2025-09-25', weight: '62.5', BFP: '20.5', SMM: '22.8' },
  { dataTime: '2025-09-26', weight: '62.2', BFP: '20.3', SMM: '22.9' },
  { dataTime: '2025-09-27', weight: '61.8', BFP: '19.9', SMM: '23.2' },
  { dataTime: '2025-09-28', weight: '60', BFP: '20.0', SMM: '23.0' },
]);

const today = new Date().toISOString().slice(0, 10);
const todayData = computed(() => {
  return inbodyData.value.find((item) => item.dataTime === today);
});

const healthToggle = (index) => {
  for (let i = 0; i < healthInfo.value.length; i++) {
    if (i !== index) {
      healthInfo.value[i].check = false;
    } else {
      healthInfo.value[index].check = !healthInfo.value[index].check;
    }
  }
};

const formatNumber = (n) => String(n).padStart(2, '0');
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = formatNumber(date.getMonth() + 1);
  const d = formatNumber(date.getDate());
  return `${y}-${m}-${d}`;
};

const todayDate = new Date();
const year = todayDate.getFullYear();
const month = todayDate.getMonth() + 1;

const monthlySettlementDialog = ref(false);
const weeklySettlementDialog = ref(false);

const challengeStore = useChallengeStore();

onMounted(async () => {
  await fetchMonthlySettlement(todayDate);
  await fetchWeeklySettlement(todayDate);
  console.log('state', state.monthlySettlementLog, state.weeklySettlementLog);
  const challenge = await getMyChallenge();
  challengeInfo.value = challenge.data;
  console.log('homechallenge', challengeInfo.value);
});

const challengeHome = () => {
  router.push('/challenge');
};


// 월간 정산 api호출
const fetchMonthlySettlement = async (date) => {
  const monthlyKey = formatDate(date).slice(0, 7);
  console.log('monthlykey', monthlyKey);
  console.log(
    'challengeStore.state.lastMonthCheck',
    challengeStore.state.lastMonthCheck
  );
  if (challengeStore.state.lastMonthCheck === monthlyKey) {
    return;
  } else {
    const params = {
      type: 'monthly',
      settlementDate: formatDate(new Date(year, month - 1, 1)),
    };
    const res = await getChallengeSettlementLog(params);
    state.monthlySettlementLog = res.data;
    monthlySettlementDialog.value = true;
    challengeStore.state.lastMonthCheck = monthlyKey;
  }
};

// 주간 정산 api호출
const fetchWeeklySettlement = async (date) => {
  const weeklyKey = setWeeklyKey(date);
  console.log('weeklykey', weeklyKey);
  console.log(
    'challengeStore.state.lastWeekCheck',
    challengeStore.state.lastWeekCheck
  );
  if (challengeStore.state.lastWeekCheck === weeklyKey) {
    return;
  } else {
    const params = {
      type: 'weekly',
      settlementDate: formatDate(getMonday(date)),
    };
    const res = await getChallengeSettlementLog(params);
    state.weeklySettlementLog = res.data;
    weeklySettlementDialog.value = true;
    challengeStore.state.lastWeekCheck = weeklyKey;
  }
};

// 월요일 날짜 구하기
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

// n주차 계산
const setWeeklyKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = formatNumber(d.getMonth() + 1);
  const week = Math.ceil((d.getDate() - d.getDay() + 1) / 7);
  return `${year}-${month}-W${week}`;
};
</script>

<template>
  <div>    
    <v-dialog
      v-model="monthlySettlementDialog"
      max-width="300"
      min-height="100">
      <v-card>
        <v-card-title class="text-h8"
          >지난 달 정산이 완료되었어요!</v-card-title
        >
        <v-card-text v-for="data in state.monthlySettlementLog">
          <ChallengeSettlementCard
            :settlement-data="data"
          ></ChallengeSettlementCard>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="monthlySettlementDialog = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="weeklySettlementDialog"
      max-width="300"
      min-height="100">
      <v-card>
        <v-card-title class="text-h8"
          >지난 주 정산이 완료되었어요!</v-card-title
        >
        <v-card-text v-for="data in state.weeklySettlementLog">
          <ChallengeSettlementCard
            :settlement-data="data"
          ></ChallengeSettlementCard>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="dark" text @click="weeklySettlementDialog = false"
            >확인</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="top-wrap">
      <section class="meal">
        <MealCard />
      </section>
    </div>
    <div class="wrap">
      <section class="challenge-progress otd-top-margin">
        <span class="otd-subtitle-1">챌린지 달성률</span>
        <div class="challenge-progress-card otd-top-margin">
          <div class=" ">
            <div
              v-for="value in challengeInfo"
              class="d-flex justify-content-around align-items-center challenge-progress-container"
              @click="challengeHome"
            >
              <span class="otd-body-3 space-span-start"
                >{{ value.formatedName }}
              </span>
              <!-- 차트에 해당하는 데이터를 불러와서 그값을 뿌림-->
              <Progress
                :class="{
                  'progress-chart': true,
                  'progress-chart-high': value.percent > 70,
                  'progress-chart-middle':
                    value.percent > 30 && value.percent <= 70,
                  'progress-chart-low': value.percent <= 30,
                }"
                :indata-progress="value.percent"
              />
              <span class="otd-body-3 space-span-end"
                >{{ value.percent }}%</span
              >
            </div>
          </div>
        </div>
      </section>
    </div>
    <div class="wrap">
      <section class="health-progress otd-top-margin">
        <span class="otd-subtitle-1">건강</span>
        <div class="health-card">
          <div class="otd-top-margin">
            <!-- bmi 프로그래스바  -->
            <div class="bmi-prog">
              <BmiProg />
            </div>
          </div>
        </div>
        <!-- 선형 그래프 선택 부분 -->
        <v-item-group v-model="selectedField">
          <div class="otd-top-margin item-group">
            <div v-for="(field, idx) in fields" :key="idx" class="card-wrapper">
              <v-item v-slot="{ selectedClass, toggle }" :value="field.key">
                <v-card
                  :class="[
                    ` health-button d-flex flex-column justify-center align-center text-center`,
                    { 'health-button-active': selectedClass },
                    ,
                  ]"
                  @click="toggle"
                  v-ripple="false"
                >
                  <div>
                    <span class="otd-body-3">
                      {{ field.label }}({{ field.unit }})
                    </span>
                  </div>
                  <div class="otd-subtitle-1 text-center">
                    {{ todayData?.[field.key] }}
                  </div>
                </v-card>
              </v-item>
            </div>
          </div>
        </v-item-group>

        <!-- <div class="otd-top-margin d-flex justify-content-between ">
        <button v-for="(value, index) in healthInfo" :key="index" :class="{ 'health-button': true, 'health-button-active': value.check }" @click="healthToggle(index)">

          <div class="d-flex flex-column align-items-center">
            <span class="otd-body-3">{{ value.text }}</span>
            <span class="otd-subtitle-1">{{ value.value }}</span>
          </div>
        </button>
      </div> -->

        <div class="otd-top-margin">
          <LineChart
            :selected-date="today"
            :selectedField="selectedField"
            :fields="fields"
            :logs="inbodyData"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.top-wrap {
  margin: 5px 20px;
}
.progress-section {
  display: flex;
  margin-top: 30px;
  margin-bottom: 20px;
  flex-direction: row;
}

.title-text {
  display: flex;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 15px;
  color: #303030;
}

/* 
.meal-cards {
  width: 350px;
  height: 265px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  border-radius: 12px;

}

.meal-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 170px;
  height: 125px;
  background: #fff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  font-size: 14px;
  color: #303030;
  overflow: visible;
}



.meal-top-img {
  width: 50px;
  height: 50px;
}
.meal-check-img {
  width: 27px;
  height: 22px;
}


.meal-card-bottom {
  display: flex;
  justify-content: start;
  margin-top: 5px;
  img{
    width: 91px;
    height: 17px;
  }
  .snack{
    width: 70px;
    height: 17px;
  }
} */
.challenge-progress-container {
  margin-bottom: 4px;
  cursor: pointer;
}

.challenge-progress {
  flex-direction: row;
}
.challenge-progress-card {
  width: 350px;
  height: 125px;
  padding: 10px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.progress-chart {
  width: 176px;
  height: 15px;
  box-shadow: none;
}

/* Progress.vue 커스텀 */

.progress-chart-low :deep(.progress-bar) {
  background: #ff8282;
}

.progress-chart-middle :deep(.progress-bar) {
  background: #ffb996;
}

.progress-chart-high :deep(.progress-bar) {
  background: #00d5df;
}

.space-span-start {
  width: 30%;
}
.space-span-end {
  width: 10%;
}

.health-card {
  width: 350px;
  height: 87px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.bmi-prog {
  padding: 10px;
}

.item-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
}
.health-button {
  width: 110px;
  height: 75px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
.health-button-active {
  background: #ffe864;
}
</style>
