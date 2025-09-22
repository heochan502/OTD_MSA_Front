<script setup>
import { reactive, computed, ref, watch } from "vue";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import effortLevels from "@/assets/effortLevels.json";
import { calcDuration } from "@/utils/exerciseUtils";

const exerciseRecordStore = useExerciseRecordStore();

const state = reactive({
  form: {
    exerciseId: null,
    effortLevel: 1,
    startAt: null,
    endAt: null,
    distance: null,
    activityKcal: 0,
  },
});

// 운동강도 색상
const color = computed(() => {
  if (state.form.effortLevel < 4) return "#00D5DF";
  if (state.form.effortLevel < 7) return "#FFB996";
  return "#FF8282";
});
const hasDistance = computed(() => {
  if (!state.form.exerciseId) return 0;

  const target = exerciseRecordStore.exerciseList.find(
    (e) => e.exerciseId === state.form.exerciseId.value
  );

  return target ? target.hasDistance : 0; // 1 또는 0 그대로 반환
});

// 운동지속시간
const exerciseDuration = computed(() => {
  const startAt = state.form.startAt;
  const endAt = state.form.endAt;

  return calcDuration(startAt, endAt);
});

// 칼로리 소모량
const calcKcal = computed(() => {
  // MET × 체중(kg) × 운동시간(분) × 0.0175 = 소모 칼로리(kcal).

  const target = exerciseRecordStore.exerciseList.find(
    (e) => e.exerciseId === state.form.exerciseId.value
  );

  const result = target.exerciseMet * 68 * exerciseDuration * 0.0175;
  return result;
});

watch(state.form, () => {
  console.log(state.form.startAt);
  console.log(state.form.endAt);

  console.log(exerciseDuration.value);
  console.log("met", calcKcal.value);
});
</script>

<template>
  <div class="wrap otd-body-1">
    <div class="wrap_form">
      <div class="content_main">
        <div>운동 시작</div>
        <div class="input_box otd-box-style otd-shadow">
          <input
            type="datetime-local"
            v-model="state.form.startAt"
            class="otd-body-1"
          />
        </div>
      </div>
      <div class="content_main">
        <div>운동 종료</div>
        <div class="input_box otd-box-style otd-shadow">
          <input
            type="datetime-local"
            v-model="state.form.endAt"
            class="otd-body-1"
          />
        </div>
      </div>
      <div class="content_main">
        <div>운동</div>
        <div class="input_box otd-box-style otd-shadow">
          <v-combobox
            v-model="state.form.exerciseId"
            :items="
              exerciseRecordStore.exerciseList.map((e) => ({
                title: e.exerciseName,
                value: e.exerciseId,
              }))
            "
            placeholder="운동을 선택하세요"
            variant="plain"
            density="compact"
            hide-details
            clearable
          />
        </div>
      </div>
      <div v-if="hasDistance" class="content_main">
        <div>거리</div>
        <div class="input_box otd-box-style otd-shadow">
          <v-text-field
            v-model="state.form.distance"
            suffix="km"
            placeholder="운동한 거리를 입력하세요"
            variant="plain"
            density="compact"
            hide-details
            clearable
            persistent-placeholder
          ></v-text-field>
        </div>
      </div>
      <div class="content_main">
        <div class="d-flex justify-space-between">
          <div>운동강도</div>
          <p>
            {{ effortLevels[state.form.effortLevel - 1].label }}
          </p>
        </div>

        <div>
          <v-slider
            v-model="state.form.effortLevel"
            thumb-label="false"
            :color="color"
            track-color="#E6E6E6"
            show-ticks="true"
            tick-size="4"
            :step="1"
            min="1"
            max="10"
            max-width="350px"
            hide-details
          >
            <!-- thumb 내용 -->
            <template v-slot:thumb-label="{ modelValue }">
              {{ effortLevels[modelValue - 1].emoji }}
            </template>
          </v-slider>
        </div>
        <p class="otd-body-2 text-center">
          {{ effortLevels[state.form.effortLevel - 1].description }}
        </p>
      </div>
      <div class="content_result">
        <div>
          <div>활동 에너지는</div>
          <div class="otd-title">{{ "200kcal" }}</div>
        </div>
        <div>
          <div>운동시간</div>
          <div class="otd-title">{{ exerciseDuration }}분</div>
        </div>
      </div>
    </div>
    <div class="btn_submit otd-subtitle-1 otd-shadow">저장</div>
  </div>
</template>

<style lang="scss" scoped>
.wrap_form {
  margin: 0 20px;
}
.content_main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  width: 310px;
  margin-bottom: 15px;
}
.input_box {
  display: flex;
  align-items: center;
  width: 310px;
  height: 50px;
  padding: 20px 20px;

  // <input> datetime-local 아이콘 변경
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    color: rgba(0, 0, 0, 0);
    opacity: 1;
    display: block;
    background: url("/image/exercise/calender.png") center/80% no-repeat;
    width: 15px;
    height: 15px;

    border-width: thin;
    cursor: pointer;
  }
  ::v-deep(.v-field__input) {
    padding: 0 !important; /* 내부 padding 제거 */
  }
}
.content_result {
  display: flex;
  gap: 75px;
  width: 310px;
}
.btn_submit {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 350px;
  height: 50px;
  margin-top: 15px;

  background-color: #ffe864;
  border-radius: 10px;
}
</style>
