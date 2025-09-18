<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getSelectedAll } from '@/services/challenge/ChallengeService';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { useChallengeStore } from '@/stores/challenge/challengeStore';
import Progress from '@/components/challenge/Progress.vue';

const challengeStore = useChallengeStore();

const router = useRouter();

const year = challengeStore.state.year;
const month = challengeStore.state.month;

const totalXp = ref();
const totalLevel = computed(() => Math.floor(totalXp / 100));
const leftXp = computed(() => totalXp % 100);
const leftLevel = computed(() => setTargetLevel(totalLevel) - totalLevel);

const state = reactive({
  weeklyChallenge: [],
  competitionChallenge: [],
  personalChallenge: [],
  dailyMission: [],
  user: {},
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

const detail = (id, type) => {
  console.log('type', type);
  if (type == 'personal') {
    router.push({
      name: 'ChallengeDay',
      params: { id },
    });
  } else {
    router.push({
      name: 'ChallengePer',
      params: { id },
    });
  }
};

onMounted(async () => {
  console.log('date', year, month);
  const res = await getSelectedAll(1, year, month);
  state.weeklyChallenge = res.data.weeklyChallenge;
  state.competitionChallenge = res.data.competitionChallenge;
  state.personalChallenge = res.data.personalChallenge;
  state.dailyMission = res.data.dailyMission;
  state.user = res.data.user;
  challengeStore.state.progressChallenge = res.data;
  totalLevel.value = res.data.user.level;
});

const setTargetLevel = (level) => {
  if (level < 5) {
    return 5;
  } else if (level < 10) {
    return 10;
  } else if (level < 15) {
    return 15;
  }
};

</script>

<template>
  <div class="wrap">
    <!-- 내정보 -->
    <div>
      <div>내 정보</div>
      <div>
        <div>티어 이미지</div>
        <div>
          <span>{{totalLevel}}레벨</span><span>silver</span>
          <span>승급까지 {{leftLevel}}레벨 남았어요!</span>
        </div>
        <Progress></Progress>
      </div>
      <div>
        <div>
          <img src="" alt="" />
          <span>보유한 포인트</span>
          <span>5,000P</span>
        </div>
        <div>
          <img src="" alt="" />
          <span>성공한 챌린지</span>
          <span>5개</span>
        </div>
      </div>
    </div>
    <div>
      <div>일일 미션</div>
      <div>
        <div>
          <img src="" alt="" />
          <span>아침에 일어나서 물 한 잔</span>
          <span>5P</span>
          <input type="checkbox" />
        </div>
        <div>
          <img src="" alt="" />
          <span>가벼운 스트레칭 5분</span>
          <span>5P</span>
          <input type="checkbox" />
        </div>
        <div>
          <img src="" alt="" />
          <span>명상 1분</span>
          <span>5P</span>
          <input type="checkbox" />
        </div>
      </div>
    </div>
    <!-- 월간 챌린지 -->
    <div>
      <div class="monthly">
        <div class="first-title">진행중인 월간 챌린지</div>
        <div class="route-list" @click="toChallengeList">
          > 미션 / 챌린지 목록 보기
        </div>
      </div>
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
            @click="detail(challenge.cdId, challenge.type)"
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
            @click="detail(challenge.cdId, challenge.type)"
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
              @click="detail(challenge.cdId, challenge.type)"
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
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.monthly {
  display: flex;
  justify-content: space-between;
  // align-items: center;
  .route-list {
    margin-top: 10px;
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
  text-align: center;
}
</style>
