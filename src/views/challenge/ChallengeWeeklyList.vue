<script setup>
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { reactive, onMounted, ref } from 'vue';
import { getChallenge } from '@/services/challenge/ChallengeService';

const dialog = ref(false);
const state = reactive({
  challengeList: [],
  selectedChallenge: null,
});
const openDialog = (challenge) => {
  state.selectedChallenge = challenge;
  dialog.value = true;
};
const confirmYes = async () => {
  dialog.value = false;
  console.log(state.selectedChallenge.id);
  await postChallenge(state.selectedChallenge.id);
};
onMounted(async () => {
  const type = history.state.type;
  const year = history.state.year;
  const month = history.state.month;

  console.log('type', type);
  const res = await getChallenge(1, year, month, type);
  console.log('resdata', res.data);
  state.challengeList = res.data;
});
</script>

<template>
  <div class="wrap">
    <div v-for="challenge in state.challengeList" :key="id">
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
  <v-dialog v-model="dialog" max-width="300" min-height="100">
    <v-card>
      <v-card-title class="text-h8">확인</v-card-title>
      <v-card-text
        >{{
          state.selectedChallenge?.name +
          `(${state.selectedChallenge.goal}${state.selectedChallenge.unit})`
        }}
        챌린지에 도전 하시겠습니까?</v-card-text
      >
      <v-card-actions>
        <v-spacer />
        <v-btn color="dark" text @click="dialog = false">아니오</v-btn>
        <v-btn color="primary" text @click="confirmYes()">네</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
.challenge-card {
  cursor: pointer;
}
</style>
