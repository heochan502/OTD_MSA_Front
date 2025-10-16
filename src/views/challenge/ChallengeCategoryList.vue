<script setup>
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import Modal from '@/components/user/Modal.vue';
import { reactive, onMounted, ref } from 'vue';
import {
  getCompetitionList,
  getChallengeList,
  postChallenge,
  getSelectedAll,
} from '@/services/challenge/challengeService';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css/autoplay';
import { useRouter } from 'vue-router';

const router = useRouter();
const dialog = ref(false);
const successDialog = ref(false);
const stopDialog = ref(false);
const lockDialog = ref(false);
const challengeType = ref('');

const state = reactive({
  challengeList: [],
  selectedChallenge: null,
  totalChallenge: [],
});

const openDialog = (challenge) => {
  if (state.totalChallenge.length >= 2) {
    stopDialog.value = true;
  } else if (state.totalChallenge.length < 2) {
    state.selectedChallenge = challenge;
    dialog.value = true;
  }
};

const BASE = import.meta.env.BASE_URL;

const lockImg = (tier) => {
  switch (tier) {
    case '브론즈':
      return `${BASE}image/challenge/lock.png`;
    case '실버':
      return `${BASE}image/challenge/lock-silver.png`;
    case '골드':
      return `${BASE}image/challenge/lock-gold.png`;
    case '다이아':
      return `${BASE}image/challenge/lock-diamond.png`;
    default:
      return `${BASE}image/challenge/lock.png`;
  }
};

const openLockedDialog = (challenge) => {
  state.selectedChallenge = challenge;
  lockDialog.value = true;
};
const handleClick = (challenge) => {
  if (challenge.available) {
    openDialog(challenge);
  } else {
    openLockedDialog(challenge);
  }
};

const confirmYes = async () => {
  dialog.value = false;
  const params = {
    cdId: state.selectedChallenge.id,
    type: state.selectedChallenge.type,
  };

  const res = await postChallenge(params);
  if (res && res.status === 200) {
    successDialog.value = true;
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
};

const comeBackHome = () => {
  router.push({ name: 'ChallengeHome' });
};

const comeBackList = async () => {
  successDialog.value = false;
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

onMounted(async () => {
  challengeType.value = window.history.state.type;
  if (challengeType.value === 'competition') {
    const res = await getCompetitionList(challengeType.value);
    state.challengeList = res.data;
  } else {
    const res = await getChallengeList(challengeType.value);
    state.challengeList = res.data;
  }

  const res = await getSelectedAll();
  if (challengeType.value === 'competition') {
    state.totalChallenge = res.data.competitionChallenge;
  } else if (challengeType.value === 'personal') {
    state.totalChallenge = res.data.personalChallenge;
  } else {
    state.totalChallenge = res.data.weeklyChallenge;
  }
});
</script>

<template>
  <div
    v-if="challengeType === 'weekly' || challengeType === 'personal'"
    class="wrap card-grid"
  >
    <div
      v-for="challenge in state.challengeList"
      :key="challenge.id"
      class="challenge-card-wrapper"
      @click="handleClick(challenge)"
    >
      <ChallengeCard
        class="challenge-card"
        :id="challenge.id"
        :image="challenge.image"
        :name="challenge.name"
        :reward="challenge.reward"
        :available="challenge.available"
      />
      <div v-if="!challenge.available" class="overlay">
        <img :src="lockImg(challenge.tier)" alt="잠금" class="lock" />
      </div>
    </div>
  </div>

  <div v-if="challengeType === 'competition'" class="swiper-wrap">
    <div
      class="swiper-warp"
      v-for="(list, category) in state.challengeList"
      :key="category"
    >
      <div class="otd-category">{{ `${category}` }}</div>
      <Swiper
        :modules="[Autoplay]"
        :slides-per-view="2"
        :space-between="15"
        loop
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
      >
        <SwiperSlide v-for="challenge in list" :key="challenge.id">
          <div
            class="challenge-card-swiper-wrapper"
            @click="handleClick(challenge)"
          >
            <ChallengeCard
              class="challenge-card"
              :key="challenge.id"
              :id="challenge.id"
              :image="challenge.image"
              :name="challenge.name"
              :reward="challenge.reward"
              :available="challenge.available"
            ></ChallengeCard>
            <div v-if="!challenge.available" class="overlay-2">
              <img :src="lockImg(challenge.tier)" alt="잠금" class="lock" />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>

  <!-- 도전 불가 모달 -->
  <Modal
    :show="stopDialog"
    title="알림"
    message="챌린지는 2개까지만 도전 가능합니다."
    type="warning"
    confirm-text="확인"
    @close="stopDialog = false"
  />

  <!-- 도전 확인 모달 -->
  <Modal
    :show="dialog"
    title="도전하기"
    :message="`<strong>${state.selectedChallenge?.name}(${state.selectedChallenge?.goal}${state.selectedChallenge?.unit}) 챌린지</strong>에 도전 하시겠습니까?\n<strong style='color:#f28b82'>⚠ 한 번 시작한 챌린지는 취소할 수 없습니다.</strong>`"
    type="confirm"
    confirm-text="네"
    cancel-text="아니오"
    @confirm="confirmYes"
    @cancel="dialog = false"
    @close="dialog = false"
  />

  <!-- 저장 완료 모달 -->
  <Modal
    :show="successDialog"
    title="저장 완료"
    :message="`<strong>${state.selectedChallenge?.name} 챌린지</strong>가 성공적으로 저장되었습니다!\n홈 화면으로 돌아가시겠습니까?`"
    type="success"
    confirm-text="네"
    cancel-text="아니오"
    @confirm="comeBackHome"
    @cancel="comeBackList"
    @close="successDialog = false"
  />

  <!-- 잠금 상태 모달 -->
  <Modal
    :show="lockDialog"
    title="⚠ 참여 제한"
    :message="`이 챌린지는 <strong style='color:#00d5df;'>${state.selectedChallenge?.tier}</strong> 등급 이상만 참여 가능합니다.`"
    type="warning"
    confirm-text="확인"
    @close="lockDialog = false"
  />
</template>

<style lang="scss" scoped>
.wrap {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* competition 전체 wrapper */
.swiper-wrap {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
}

/* 중앙정렬 및 폭 제한 */
.swiper-warp {
  width: 100%;
  max-width: 391px; /* 모바일 기준 최대 폭 */
  margin: 0 auto 20px auto; /* 중앙정렬 + 아래 여백 */
  box-sizing: border-box;

  .otd-category {
    margin-bottom: 15px;
    text-align: left;
    width: 100%;
    max-width: 391px;
  }
}

/* Swiper 내부 구조 */
:deep(.swiper) {
  width: 100%;
  overflow: hidden;
}

:deep(.swiper-wrapper) {
  display: flex;
  cursor: grab;
}

/* ✅ 두 개씩 균등 정렬 */
:deep(.swiper-slide) {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  width: calc(50% - 8px) !important; /* 두 개씩 나란히 */
  box-sizing: border-box;
}

/* weekly/personal grid 구조 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 168px);
  gap: 15px;
  max-width: 391px;
  box-sizing: border-box;
  padding-bottom: 30px;
  justify-content: center;
  max-width: 100%;
}

/* 카드 고정폭 */
.challenge-card {
  width: 100%;
  max-width: 168px;
  border-radius: 10px;
}

/* 오버레이 관련 */
.challenge-card-swiper-wrapper {
  position: relative;
}
.challenge-card-wrapper {
  position: relative;
  width: 168px;
}
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  pointer-events: none;
}
.overlay-2 {
  position: absolute;
  align-items: center;
  justify-content: center;
  inset: 0;
}
.lock {
  width: 100%;
  border-radius: 10px;
}
</style>
