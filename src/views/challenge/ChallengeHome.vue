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
import Modal from '@/components/user/Modal.vue';

const challengeStore = useChallengeStore();
const authentication = useAuthenticationStore();
const router = useRouter();
const saveDialog = ref();
const successDialog = ref();

const state = reactive({
  weeklyChallenge: [],
  competitionChallenge: [],
  personalChallenge: [],
  dailyMission: [],
  user: { xp: 0, point: 0 },
  missionComplete: [],
  success: 0,
  tier: '',
  selectedMission: {},
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
  authentication.setXp(state.user.xp);
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
const completeMission = async () => {
  const mission = state.selectedMission;
  console.log('mission', mission);
  if (mission.done) {
    return;
  } else {
    mission.done = true;
    await postMissionRecord(mission.cdId);
    // authentication.setPoint(
    //   authentication.state.signedUser.point + mission.cdReward
    // );
    // authentication.setXp(authentication.state.signedUser.xp + mission.xp);
    // state.user.point = authentication.state.signedUser.point;
    // 발표용
    const res = await getSelectedAll();
    authentication.setPoint(res.data.user.point);
    authentication.setChallengeRole(res.data.user.challengeRole);
    authentication.setXp(res.data.user.xp);
    state.user.xp = res.data.user.xp;
    state.user.point = res.data.user.point;
    totalXp.value = res.data.user.xp;

    successDialog.value = true;
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
    <div class="title">일일 미션</div>
    <div class="daily">
      <div class="mission-box">
        <div
          v-for="mission in missionDone"
          @click="
            state.selectedMission = mission;
            saveDialog = true;
          "
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
      <div class="competition-sub-title">> 경쟁 챌린지</div>
      <div class="card-wrap">
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
      <div class="personal-sub-title">> 개인 챌린지</div>
      <div class="card-wrap">
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
      <div class="weekly-wrap">
        <div class="title">진행중인 주간 챌린지</div>
        <div class="weekly card-wrap">
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
    <!-- 저장 완료 모달 -->
    <Modal
      :show="successDialog"
      title="저장 완료"
      :message="`<strong>${state.selectedMission?.cdName} 미션</strong>이 성공적으로 완료되었습니다!`"
      type="success"
      confirm-text="확인"
      @confirm="successDialog = false"
      @close="successDialog = false"
    />
    <!-- 도전 확인 모달 -->
    <Modal
      :show="saveDialog"
      title="일일미션 완료하기"
      :message="`<strong>${state.selectedMission?.cdName} 미션</strong>을 완료 처리 할까요?\n<strong style='color:#f28b82'>⚠ 한 번 완료한 미션은 되돌릴 수 없습니다.</strong>`"
      type="confirm"
      confirm-text="네"
      cancel-text="아니오"
      @confirm="completeMission"
      @cancel="saveDialog = false"
      @close="saveDialog = false"
    />
  </div>
</template>

<style lang="scss" scoped>
.wrap {
  margin-top: 30px;
}
// 화면이 391px 이상일 때만 max-width + 중앙정렬 적용
@media (min-width: 391px) {
  .wrap {
    max-width: 391px;
    margin: 0 auto;
    margin-top: 30px;
  }
}
.daily {
  display: flex;
  justify-content: center;
  justify-items: center;
  .mission-box {
    display: flex;
    flex-direction: column;
    max-width: 351px;
    min-width: 280px;
    width: 100%;
    height: auto;
    gap: 10px;
    .mission-card {
      justify-content: space-between;
      max-width: 351px;
      min-width: 280px;
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 10px;
      padding: 0 15px;
      text-align: center;
      cursor: pointer;
      .mission-image {
        width: 25px;
        margin-right: 25px;
      }
      .img {
        width: 25px;
      }
      span {
        flex: 1;
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
    cursor: pointer;
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
.competition-sub-title,
.personal-sub-title {
  font-size: 12px;
  margin-bottom: 15px;
}

.personal-sub-title {
  margin-top: 15px;
}
.challenge-card {
  display: flex;
  // grid-template-columns: repeat(2, 168px); // 가로 2칸
  gap: 15px;
  justify-content: center;
  justify-items: center;
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
  justify-content: center;
  justify-items: center;
  gap: 15px;
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
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  max-width: 351px;
  gap: 15px;
  .tier-img {
    width: 100px;
  }
  .info-right {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
}
.weekly-wrap {
  margin-bottom: 20px;
}
@media (max-width: 360px) {
  .challenge-card {
    grid-template-columns: repeat(2, 150px); // 카드 폭 줄임
  }
}

/* 320px 이하에서는 1열로 변경 */
@media (max-width: 320px) {
  .challenge-card {
    grid-template-columns: 1fr; // 한 줄만
  }
  .empty-card {
    width: 80%; // 부모 폭 기준
    max-width: 168px;
    margin: 0 auto; // 가운데 정렬
  }
}
</style>
