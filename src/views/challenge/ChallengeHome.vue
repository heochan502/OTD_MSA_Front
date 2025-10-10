<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  getSelectedAll,
  postMissionRecord,
  settlement,
} from '@/services/challenge/challengeService';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { useChallengeStore } from '@/stores/challenge/challengeStore.js';
import Progress from '@/components/challenge/Progress.vue';
import { useAuthenticationStore } from '@/stores/user/authentication';

const challengeStore = useChallengeStore();
const authentication = useAuthenticationStore();
const router = useRouter();

const state = reactive({
  weeklyChallenge: [],
  competitionChallenge: [],
  personalChallenge: [],
  dailyMission: [],
  user: { xp: 0, point: 0 },
  missionComplete: [],
  success: 0,
  tier: '',
});

const tierImg = {
  브론즈: '/otd/image/challenge/bronze.png',
  실버: '/otd/image/challenge/silver.png',
  골드: '/otd/image/challenge/gold.png',
  다이아: '/otd/image/challenge/diamond.png',
  default: '',
};
const myTier = computed(() => authentication.state.signedUser.challengeRole);

const myTierImg = computed(() => tierImg[myTier.value] || tierImg.default);
const toChallengeList = () => {
  router.push('challenge/alllist');
};

const toList = async (type) => {
  router.push({
    name: `Challenge${type}List`,
    state: {
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
  const res = await getSelectedAll();
  state.weeklyChallenge = res.data.weeklyChallenge || [];
  state.competitionChallenge = res.data.competitionChallenge || [];
  state.personalChallenge = res.data.personalChallenge || [];
  state.dailyMission = res.data.dailyMission || [];
  state.user = res.data.user || { xp: 0, point: 0 };
  state.missionComplete = res.data.missionComplete || [];
  state.success = res.data.success;

  challengeStore.state.progressChallenge = res.data;
  totalXp.value = res.data.user?.xp ?? 0;
  // state.tier = authentication.state.signedUser.challengeRole;
  console.log('res', res.data);
  setMissionState();
  console.log('로그 데이터', state);
  authentication.setPoint(state.user.point);
  authentication.setChallengeRole(res.data.user?.challengeRole);
});

const totalXp = ref(0);
const totalLevel = computed(() => Math.trunc(totalXp.value / 100));
const leftXp = computed(() => totalXp.value % 100);
const leftLevel = computed(
  () => setTargetLevel(totalLevel.value) - totalLevel.value
);

// const setTargetLevel = (level) => {
//   if (level < 5) {
//     return 5;
//   } else if (level < 10) {
//     return 10;
//   } else if (level < 15) {
//     return 15;
//   }
//   return 20;
// };
const setTargetLevel = (level) => Math.ceil((level + 1) / 5) * 5;

const missionDone = ref([]);

const setMissionState = () => {
  const completedIds = state.missionComplete.map((m) => `${m.cdId}`);
  missionDone.value = state.dailyMission.map((mission) => ({
    ...mission,
    done: completedIds.includes(mission.cdId),
  }));
  // console.log('ids', completedIds);
  // console.log('missionDone', missionDone);
};

// 로그인 제대로 되면 수정(userId 안보냄)
const completeMission = async (mission) => {
  if (mission.done) {
    return;
  } else {
    mission.done = true;
    await postMissionRecord(mission.cdId);
    authentication.setPoint(
      authentication.state.signedUser.point + mission.cdReward
    );
    state.user.point = authentication.state.signedUser.point;
    // window.location.reload();
  }
};

const levelMent = () => {
  switch (myTier.value) {
    case '다이아':
      return '다이아처럼 빤짝빤짝 !';
    case '골드':
      return `다이아까지 Lv${leftLevel.value} 남았어요!`;
    case '실버':
      return `골드까지 Lv${leftLevel.value} 남았어요!`;
    case '브론즈':
      return `실버까지 Lv${leftLevel.value} 남았어요!`;
  }
};

const FILE_URL = import.meta.env.VITE_BASE_URL;
const BASE_URL = import.meta.env.BASE_URL;

// 정산 테스트용
const settlementButton = async () => {
  const params = {
    startDate: '2025-09-01',
    endDate: '2025-09-30',
    type: 'personal',
  };
  const res = await settlement(params);
  console.log(res);
  // 테스트용
  if (res.data?.user) {
    authentication.setChallengeRole(res.data.user.challengeRole);
    authentication.setPoint(res.data.user.point);

    state.user = res.data.user; // state.user도 최신으로 교체
    totalXp.value = res.data.user.xp;
  } else {
    const refresh = await getSelectedAll();
    authentication.setChallengeRole(refresh.data.user.challengeRole);
    authentication.setPoint(refresh.data.user.point);

    state.user = refresh.data.user; // 최신 데이터로 교체
    totalXp.value = refresh.data.user.xp;
  }
};
</script>

<template>
  <div class="wrap">
    <!-- 내정보 -->
    <!-- <div @click="settlementButton()">월간 정산</div> -->
    <div>
      <div class="first-title">내 정보</div>
      <div>
        <div class="info">
          <img :src="myTierImg" alt="tier" class="tier-img" />
          <div class="info-right">
            <span>Lv {{ totalLevel }}</span>
            <span>{{ ' ' + levelMent() }}</span>
            <Progress
              class="progress"
              :indata-progress="leftXp"
              bar-type="xp"
            ></Progress>
          </div>
        </div>
      </div>
      <div class="sub-wrap">
        <div class="point-wrap otd-list-box-style">
          <img class="image" src="/image/main/point.png" alt="포인트" />
          <div class="box otd-body-2">
            <span>보유한 포인트 </span>
            <span>{{ Number(state.user?.point).toLocaleString() }}P</span>
          </div>
        </div>
        <div class="success-challenge otd-list-box-style">
          <img
            class="image"
            src="/image/challenge/success-challenge.png"
            alt=""
          />
          <div class="box otd-body-2">
            <span>성공한 챌린지 </span>
            <span>{{ state.success }}개</span>
          </div>
        </div>
      </div>
    </div>
    <div class="daily">
      <div class="title">일일 미션</div>
      <div class="mission-box">
        <div
          v-for="mission in missionDone"
          @click="completeMission(mission)"
          class="mission-card otd-list-box-style"
          :class="{ 'mission-done': mission.done }"
        >
          <img
            :src="`${FILE_URL}/${mission.cdImage}`"
            :alt="`${mission.cdName}`"
            class="mission-image"
          />
          <span>{{ mission.cdName }}</span
          ><span>{{ mission.cdReward }}P</span>
          <img
            :src="`${BASE_URL}image/challenge/challenge_mission_${
              mission.done ? 'checked' : 'box'
            }.png`"
            alt="checkbox"
            class="img"
          />
        </div>
      </div>
    </div>
    <!-- 월간 챌린지 -->
    <div>
      <div class="monthly">
        <div class="title">진행중인 월간 챌린지</div>
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
            @click="detail(challenge.cdId, challenge.type, challenge.name)"
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
            @click="detail(challenge.cdId, challenge.type, challenge.name)"
          ></ChallengeCard>
          <div
            v-for="n in Math.max(0, 2 - state.personalChallenge.length)"
            :key="'d-' + n"
            class="empty-card otd-list-box-style"
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
.daily {
  .mission-box {
    width: 351px;
    height: 170px;
    .mission-card {
      margin-bottom: 10px;
      width: 311px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 15px;
      cursor: pointer;
      .mission-image {
        width: 25px;
      }
      .img {
        width: 25px;
      }
    }
    .mission-done {
      pointer-events: none;
      cursor: default;
      opacity: 0.5;
    }
  }
}
.monthly {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  margin-top: 15px;
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
  // margin-bottom: 15px;
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
.sub-wrap {
  display: flex;
  justify-content: space-between;
}
.point-wrap,
.success-challenge {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 168px;
  height: 68px;
  .image {
    width: 30px;
  }
  .box {
    font-weight: 500;
    display: flex;
    flex-direction: column;
  }
}
.info {
  display: flex;
  gap: 15px;
  .tier-img {
    width: 100px;
  }
  .info-right {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    .progress {
      // width: 70%;
    }
  }
}
</style>
