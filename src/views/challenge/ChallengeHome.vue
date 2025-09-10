<script setup>
import { reactive } from 'vue';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { useRouter } from 'vue-router';
import Calendar from '@/components/challenge/Calendar.vue';

const router = useRouter();

const state = reactive({
  weeklyChallenge: [],
  monthlyChallenge: [],
  dailyChallenge: [],
});

const toList = () => {
  router.push('challenge/list');
};
</script>

<template>
  <div>
    <div>
      <!-- 주간 챌린지 -->
      <div>
        <div>진행중인 주간 챌린지</div>
        <div @click="toList">> 챌린지 목록 보기</div>
      </div>
      <ChallengeCard
        v-for="challenge in state.weeklyChallenge"
        :id="challenge.id"
        :image="challenge.image"
        :name="challenge.name"
      ></ChallengeCard>
    </div>
    <!-- 월간 챌린지 -->
    <div>
      <div>진행중인 월간 챌린지</div>
      <!-- 경쟁 -->
      <div>
        <div>> 경쟁 챌린지</div>
        <ChallengeCard
          v-for="challenge in state.monthlyChallenge"
          :id="challenge.id"
          :image="challenge.image"
          :name="challenge.name"
        ></ChallengeCard>
      </div>
      <!-- 개인 -->
      <div>
        <div>> 개인 챌린지</div>
        <ChallengeCard
          v-for="challenge in state.dailyChallenge"
          :id="challenge.id"
          :image="challenge.image"
          :name="challenge.name"
        ></ChallengeCard>
      </div>
    </div>
    <Calendar></Calendar>
  </div>
</template>

<style scoped></style>
