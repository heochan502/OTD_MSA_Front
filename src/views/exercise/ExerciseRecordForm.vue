<script setup>
import { reactive, computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useExerciseRecordStore } from "@/stores/exercise/exerciseRecordStore";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";
import effortLevels from "@/assets/effortLevels.json";
import { calcDuration } from "@/utils/exerciseUtils";
import { formatDateDayTimeKR } from "@/utils/dateTimeUtils";
import { saveExerciseRecord } from "@/services/exercise/exerciseService";
import Modal from "@/components/user/Modal.vue";

const router = useRouter();
const exerciseRecordStore = useExerciseRecordStore();
const bodyCompositionStore = useBodyCompositionStore();
const saveDialog = ref(false);
const successDialog = ref(false);
const menuStart = ref(false);
const menuEnd = ref(false);

const onStartPick = (val) => {
  state.form.startAt = val;
  menuStart.value = false; // 선택 후 자동 닫기
};

const onEndPick = (val) => {
  state.form.endAt = val;
  menuEnd.value = false; // 선택 후 자동 닫기
};

const state = reactive({
  form: {
    exerciseId: null,
    effortLevel: 1,
    startAt: new Date(),
    endAt: new Date(),
    duration: 0,
    distance: null,
    reps: null,
    activityKcal: 0,
  },
});

const startDisplay = computed(() => formatDateDayTimeKR(state.form.startAt));
const endDisplay = computed(() => formatDateDayTimeKR(state.form.endAt));

// 운동강도 색상
const color = computed(() => {
  if (state.form.effortLevel < 4) return "#00D5DF";
  if (state.form.effortLevel < 7) return "#FFB996";
  return "#FF8282";
});

// 선택된 운동
const selectedExercise = computed(() => {
  if (!state.form.exerciseId) return 0;
  return exerciseRecordStore.exerciseList.find(
    (e) => e.exerciseId === state.form.exerciseId
  );
});

// 거리기반운동 여부
const hasDistance = computed(() => {
  return selectedExercise.value ? selectedExercise.value.hasDistance : 0; // 1 또는 0 그대로 반환
});

// 반복횟수기반운동 여부
const hasReps = computed(() => {
  return selectedExercise.value ? selectedExercise.value.hasReps : 0; // 1 또는 0 그대로 반환
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
  const met = selectedExercise.value ? selectedExercise.value.exerciseMet : 0;
  const bodyWeight =
    bodyCompositionStore.recentBodyInfo?.weight ??
    bodyCompositionStore.lastest?.weight ??
    0;
  const duration = exerciseDuration.value;
  console.log("계산", bodyWeight);
  return met * bodyWeight * duration * 0.0175;
});

// 계산된 칼로리 소모량 state.form.activityKcal에 저장
watch(calcKcal, (val) => {
  state.form.activityKcal = Math.ceil(val);
});
// 계산된 운동 시간
watch(exerciseDuration, (val) => {
  state.form.duration = Math.ceil(val);
});

const formatDateAt = (datetimeStr) => {
  const date = new Date(datetimeStr);
  const yy = date.getFullYear().toString();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${yy}-${mm}-${dd}T${hours}:${minutes}`;
};

// @click
// 기록 저장
const confirmYes = async () => {
  const startAt = formatDateAt(state.form.startAt);
  const endAt = formatDateAt(state.form.endAt);
  const jsonBody = {
    exerciseId: state.form.exerciseId,
    startAt: startAt,
    endAt: endAt,
    duration: state.form.duration,
    activityKcal: state.form.activityKcal,
    effortLevel: state.form.effortLevel,
    distance: state.form.distance,
    reps: state.form.reps,
  };

  const res = await saveExerciseRecord(jsonBody);
  if (res === undefined || res.status !== 200) {
    alert("에러발생");
    return;
  }

  saveDialog.value = false;
  successDialog.value = true;
};

const goToMain = () => {
  successDialog.value = false;
  router.push("/exercise/main");
};
</script>

<template>
  <div class="wrap otd-body-1">
    <div class="wrap_form">
      <div class="content_main">
        <div>운동 시작</div>
        <div class="input_box otd-box-style otd-shadow">
          <v-menu
            v-model="menuStart"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="startDisplay"
                readonly
                placeholder="시작 시간 선택"
                variant="plain"
                density="compact"
                hide-details
              ></v-text-field>
            </template>
            <vc-date-picker
              v-model="state.form.startAt"
              mode="dateTime"
              is24hr
              is-inline
              :is-expanded="true"
              :show-time="true"
              @update:model-value="onStartPick"
            />
          </v-menu>
        </div>
      </div>
      <div class="content_main">
        <div>운동 종료</div>
        <div class="input_box otd-box-style otd-shadow">
          <v-menu
            v-model="menuEnd"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
          >
            <template #activator="{ props }">
              <v-text-field
                v-bind="props"
                v-model="endDisplay"
                readonly
                placeholder="종료 시간 선택"
                variant="plain"
                density="compact"
                hide-details
              ></v-text-field>
            </template>
            <vc-date-picker
              v-model="state.form.endAt"
              mode="dateTime"
              is24hr
              is-inline
              :is-expanded="true"
              :show-time="true"
              @update:model-value="onEndPick"
            />
          </v-menu>
        </div>
      </div>
      <div class="content_main">
        <div>운동</div>
        <div class="input_box otd-box-style otd-shadow">
          <v-combobox
            v-model="state.form.exerciseId"
            :items="exerciseRecordStore.exerciseList"
            item-title="exerciseName"
            item-value="exerciseId"
            placeholder="운동을 선택하세요"
            variant="plain"
            density="compact"
            hide-details
            clearable
            :return-object="false"
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
      <div v-else-if="hasReps" class="content_main">
        <div>반복횟수</div>
        <div class="input_box otd-box-style otd-shadow">
          <v-text-field
            v-model="state.form.reps"
            suffix="reps"
            placeholder="반복횟수를 입력하세요"
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
            :thumb-label="true"
            :color="color"
            track-color="#E6E6E6"
            :show-ticks="true"
            tick-size="6"
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
          <div class="otd-title">{{ state.form.activityKcal }}kcal</div>
        </div>
        <div>
          <div>운동시간</div>
          <div class="otd-title">{{ exerciseDuration }}분</div>
        </div>
      </div>
    </div>
    <div
      class="btn_submit otd-subtitle-1 otd-shadow"
      @click.prevent="saveDialog = true"
    >
      저장
    </div>
  </div>

  <!-- 저장 확인용 모달 -->
  <Modal
    :show="saveDialog"
    type="confirm"
    title="운동 기록 저장"
    message="운동 기록을 저장하시겠습니까?"
    confirmText="저장"
    cancelText="취소"
    @close="saveDialog = false"
    @confirm="confirmYes"
  />
  <!-- 저장 성공 모달 -->
  <Modal
    :show="successDialog"
    type="success"
    title="저장 완료"
    message="운동 기록이 성공적으로 저장되었습니다!"
    confirmText="확인"
    @confirm="goToMain"
  />
</template>

<style lang="scss" scoped>
::v-deep(.v-slider-thumb__label) {
  background-color: rgba(0, 0, 0, 0.1) !important; // 배경색
  border-radius: 10px;
}

.wrap_form {
  margin: 0 20px;
}
.content_main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;

  // width: 310px;
  margin-bottom: 15px;
}
.input_box {
  display: flex;
  align-items: center;
  // width: 310px;
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
.btn_submit {
  display: flex;
  align-items: center;
  justify-content: center;
  // max-width: 350px;
  height: 50px;
  margin-top: 15px;

  background-color: #ffe864;
  border-radius: 10px;
}
.content_result {
  display: flex;
  gap: 75px;
  width: 310px;
}
</style>
