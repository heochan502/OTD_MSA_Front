<script setup>
import WeeklyDatePick from "@/components/exercise/WeeklyDatePick.vue";
import TodayExerciseRecordList from "@/components/exercise/TodayExerciseRecordList.vue";
import BodyCompositionSummary from "@/components/exercise/BodyCompositionSummary.vue";
</script>

<template>
  <div class="wrap content_wrap">
    <WeeklyDatePick />
    <TodayExerciseRecordList />
    <BodyCompositionSummary />
  </div>
</template>

<style lang="scss" scoped>
.content_wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
</style>
