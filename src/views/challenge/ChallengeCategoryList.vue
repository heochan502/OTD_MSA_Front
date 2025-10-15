<script setup>
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
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
const challengeType = ref('');

const lockDialog = ref(false);
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
    console.log(challenge);
    dialog.value = true;
  }
};

const BASE = import.meta.env.BASE_URL; // 보통 '/otd/' 들어옴

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
  console.log(state.selectedChallenge.id);
  const params = {
    cdId: state.selectedChallenge.id,
    type: state.selectedChallenge.type,
  };

  const res = await postChallenge(params);

  if (res && res.status === 200) {
    // 성공하면 저장 완료 모달 열기
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
  console.log('dialog', dialog.value);
  setTimeout(() => {
    window.location.reload();
  }, 500);
};

onMounted(async () => {
  challengeType.value = window.history.state.type;
  console.log('type', challengeType.value);
  // challengeType.value = window.history.state.type;
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

  <div v-if="challengeType === 'competition'" class="wrap">
    <div v-for="(list, category) in state.challengeList" :key="category">
      <div class="otd-category">{{ `${category}` }}</div>
      <Swiper
        :modules="[Autoplay]"
        :slides-per-view="2"
        :space-between="15"
        loop
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
      >
        <SwiperSlide v-for="challenge in list" :key="challenge.id">
          <div class="challenge-card-wrapper" @click="handleClick(challenge)">
            <ChallengeCard
              class="challenge-card"
              :key="challenge.id"
              :id="challenge.id"
              :image="challenge.image"
              :name="challenge.name"
              :reward="challenge.reward"
              :available="challenge.available"
            ></ChallengeCard>
            <div v-if="!challenge.available" class="overlay">
              <img :src="lockImg(challenge.tier)" alt="잠금" class="lock" />
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
  <!-- 도전 불가 모달 -->
  <v-dialog v-model="stopDialog" max-width="300" min-height="100">
    <v-card>
      <v-card-title class="text-h8">알림</v-card-title>
      <v-card-text>
        <div class="challenge-info">챌린지는 2개까지만 도전 가능합니다</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="dark" text @click="stopDialog = false">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 도전 가능 모달 -->
  <v-dialog v-model="dialog" max-width="300" min-height="100">
    <v-card>
      <v-card-title class="text-h8">도전하기</v-card-title>
      <v-card-text>
        <div class="challenge-info">
          {{
            state.selectedChallenge?.name +
            `(${state.selectedChallenge.goal}${state.selectedChallenge.unit})`
          }}
          챌린지에 도전 하시겠습니까?
        </div>
        <div class="warning">
          ⚠️ 한 번 시작한 챌린지는 <strong>취소할 수 없습니다.</strong>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="dark" text @click="dialog = false">아니오</v-btn>
        <v-btn color="primary" text @click="confirmYes()">네</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 저장완료시 모달 -->
  <v-dialog v-model="successDialog" max-width="380" min-height="100">
    <v-card>
      <v-card-title class="text-h8">저장 완료</v-card-title>
      <v-card-text>
        {{
          state.selectedChallenge?.name +
          ' 챌린지가 성공적으로 저장되었습니다! 홈 화면으로 돌아가시겠습니까?'
        }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="dark" text @click="comeBackList()">아니오</v-btn>
        <v-btn color="primary" text @click="comeBackHome()">네</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 잠금 상태 모달 -->
  <v-dialog v-model="lockDialog" max-width="380" min-height="100">
    <v-card>
      <v-card-title class="text-h8">⚠️</v-card-title>
      <v-card-text>
        이 챌린지는 <strong>{{ state.selectedChallenge?.tier }}</strong> 등급
        이상만 참여 가능합니다.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="lockDialog = false">확인</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.wrap {
  display: flex;
  justify-content: center;
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
:deep(.swiper) {
  overflow: hidden;
}
:deep(.swiper-wrapper) {
  display: flex;
  cursor: grab;
}
.warning {
  margin-top: 10px;
  color: #e53935;
  font-size: 0.85rem;
}
.challenge-info {
  margin-bottom: 8px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 168px); // 2열
  gap: 15px; // 카드 사이 여백
  justify-items: center; // 가운데 정렬
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
  border-radius: 10px;
  align-items: center;
  pointer-events: none; /* 클릭은 부모로 통과 */
}
.lock {
  width: 100%;
  border-radius: 10px;
}
</style>
