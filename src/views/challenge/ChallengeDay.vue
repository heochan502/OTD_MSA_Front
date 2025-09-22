<script setup>
import Calendar from '@/components/challenge/Calendar.vue';
import { onMounted, ref, reactive } from 'vue';
import { useChallengeStore } from '@/stores/challenge/challengeStore';
import { getDay } from '@/services/challenge/challengeService';
import RewardCard from '@/components/challenge/RewardCard.vue';
import { useRoute } from 'vue-router';
import { useHeaderStore } from '@/stores/challenge/headerStore';
const props = defineProps({
  id: Number,
  name: String,
});
const challengeStore = useChallengeStore();
const year = challengeStore.state.year;
const month = challengeStore.state.month;
const state = reactive({
  progress: {},
  recDate: [],
});
const route = useRoute();
const headerStore = useHeaderStore();

onMounted(async () => {
  const req = { userId: 1, year: year, month: month };
  const cdId = props.id;
  const res = await getDay(cdId, req);
  state.progress = res.data;
  state.recDate = res.data.recDate;
  console.log(res.data);
  headerStore.setDetailName(res.data.name);
});
</script>

<template>
  <div class="wrap">
    <!-- 캘린더 -->
    <div class="title-wrap">
      <div class="otd-category">
        현재 {{ state.recDate.length }}일 성공했어요!
      </div>
      <div class="otd-body-3">15일 성공시 {{ state.progress.reward }}p!</div>
    </div>
    <div class="calendar-wrap otd-top-margin">
      <Calendar class="calendar"></Calendar>
    </div>
    <div class="otd-category otd-top-margin">추가 리워드</div>
    <RewardCard />
  </div>
</template>

<style lang="scss" scoped>
.title-wrap {
  display: flex;
  justify-content: space-between;
}
.otd-body-3 {
  margin-top: 10px;
  font-weight: 600;
}
.calendar-wrap {
  display: flex;
  position: relative;
  background-color: #ffe864;
  border-radius: 10px;
  height: 300px;
  align-items: center;
  justify-content: center;
  .calendar {
    width: 310px;
    // position: absolute;
  }
}
</style>
