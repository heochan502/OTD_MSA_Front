<script setup>
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { reactive, onMounted, ref } from 'vue';
import {
  getMapChallenge,
  postChallenge,
} from '@/services/challenge/challengeService';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay } from 'swiper/modules';
import 'swiper/css/autoplay';

const dialog = ref(false);
const successDialog = ref(false);
const state = reactive({
  challengeList: [],
  selectedChallenge: null,
});
const openDialog = (challenge) => {
  state.selectedChallenge = challenge;
  console.log(challenge);
  dialog.value = true;
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
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    alert('저장에 실패했습니다. 다시 시도해주세요.');
  }
};
onMounted(async () => {
  const type = history.state.type;

  console.log('type', type);
  const res = await getMapChallenge(type);
  console.log('monthdata', res.data);
  state.challengeList = res.data;
});
</script>

<template>
  <div class="wrap">
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
  <v-dialog v-model="dialog" max-width="300" min-height="100">
    <v-card>
      <v-card-title class="text-h8">확인</v-card-title>
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
          state.selectedChallenge?.name + ' 챌린지가 성공적으로 저장되었습니다!'
        }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click="successDialog = false">확인</v-btn>
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
