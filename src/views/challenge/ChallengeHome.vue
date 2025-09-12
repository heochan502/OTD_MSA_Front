<script setup>
import { reactive } from 'vue';
import ChallengeCard from '@/components/challenge/ChallengeCard.vue';
import { useRouter } from 'vue-router';

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
    <!-- 주간 챌린지 -->
    <div>
      <div>
        <div>진행중인 주간 챌린지</div>
        <div @click="toList">> 챌린지 목록 보기</div>
      </div>
      <div v-for="challenge in state.weeklyChallenge">
        <ChallengeCard
          :id="challenge.id"
          :image="challenge.image"
          :name="challenge.name"
        ></ChallengeCard>
      </div>
    </div>
    <!-- 월간 챌린지 -->
    <div>
      <div>진행중인 월간 챌린지</div>
      <!-- 경쟁 -->
      <div>
        <div>> 경쟁 챌린지</div>
        <div v-for="challenge in state.monthlyChallenge">
          <ChallengeCard
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
          ></ChallengeCard>
        </div>
      </div>
      <!-- 개인 -->
      <div>
        <div>> 개인 챌린지</div>
        <div v-for="challenge in state.dailyChallenge">
          <ChallengeCard
            :id="challenge.id"
            :image="challenge.image"
            :name="challenge.name"
          ></ChallengeCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
