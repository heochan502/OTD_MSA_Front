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
    class="wrap"
  >
    <div v-for="challenge in state.challengeList" :key="challenge.id">
      <ChallengeCard
        class="challenge-card"
        :key="challenge.id"
        :id="challenge.id"
        :image="challenge.image"
        :name="challenge.name"
        :reward="challenge.reward"
        @click="openDialog(challenge)"
      ></ChallengeCard>
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
        <SwiperSlide v-for="challenge in list">
          <ChallengeCard
            class="challenge-card"
            :key="challenge.id"
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
            :reward="challenge.reward"
            @click="openDialog(challenge)"
          ></ChallengeCard>
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
</template>

<style scoped>
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
</style>
