<script setup>
import { computed, reactive, ref, onMounted, watch } from "vue";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";
import { useAuthenticationStore } from "@/stores/user/authentication";
import { saveUserBasicBodyInfo } from "@/services/body_composition/bodyCompositionService";
import { getUserBasicBodyInfo } from "@/services/body_composition/bodyCompositionService";
import Modal from "../user/Modal.vue";

const bodyCompositionStore = useBodyCompositionStore();
const authenticationStore = useAuthenticationStore();
const showDialog = ref(false);
const noticeDialog = ref(false);

const hasRecord = computed(() => {
  const r = bodyCompositionStore.lastest;
  if (!r) return false;
  return (
    r.height > 0 &&
    r.weight > 0 &&
    r.skeletal_muscle_mass > 0 &&
    r.bmi > 0 &&
    r.percent_body_fat > 0
  );
});

onMounted(async () => {
  if (
    //관리자 계정이면 신체정보입력 X
    authenticationStore.state.signedUser.userRole === "ADMIN" ||
    authenticationStore.state.signedUser.userRole === "MANAGER"
  ) {
    return;
  } else if (hasRecord.value) {
    return;
  } else {
    const res = await getUserBasicBodyInfo();
    // console.log("getUserBasicBodyInfo res : ", res.data);
    // console.log(" authenticationStore.state : ", authenticationStore.state);
    if (res === undefined || res.status !== 200) {
      if (hasRecord.value) {
        //인바디 기록이 있으면 X
        return;
      }
      noticeDialog.value = true; // 기본 신체정보입력 모달
    }
    bodyCompositionStore.basicInfo = res.data;
    bodyCompositionStore.setRecentBodyInfo();
  }
});

// bmi 데이터 유무
const hasBmiData = computed(() => {
  const { lastest, recentBodyInfo } = bodyCompositionStore;
  return (
    (lastest?.height && lastest?.weight) ||
    (recentBodyInfo?.height && recentBodyInfo?.weight)
  );
});

// 수정 가능 여부: bmiInfo 기반일 때만 true
const isBmiInfo = computed(() => {
  const { lastest, recentBodyInfo } = bodyCompositionStore;
  return (
    !lastest?.height &&
    !lastest?.weight &&
    recentBodyInfo?.height &&
    recentBodyInfo?.weight
  );
});

// bmi 범위
const minBmi = 15;
const maxBmi = 40;

// bmi 계산
function calculateBmi(height, weight) {
  const heightInMeters = height / 100;
  if (!heightInMeters || !weight) return 0;

  return parseFloat((weight / heightInMeters ** 2).toFixed(1));
}

const bmi = computed(() => {
  const { lastest, recentBodyInfo } = bodyCompositionStore;

  const height = lastest?.height || recentBodyInfo?.height;
  const weight = lastest?.weight || recentBodyInfo?.weight;

  return calculateBmi(height, weight);
});

const bmiStatus = computed(() => {
  const userBmi = bmi.value;
  if (userBmi === 0) return "기록없음";
  else if (userBmi < 18.5) return "저체중";
  else if (userBmi < 25) return "정상체중";
  else if (userBmi < 30) return "과체중";
  else if (userBmi < 35) return "비만";
  else return "고도비만";
});

// 기초대사량 bmr
const userGender = computed(
  () => authenticationStore.state.signedUser?.gender || null
);
const userAge = computed(
  () => authenticationStore.state.signedUser?.age || null
);

function calculateBmr(height, weight, age, gender) {
  const h = Number(height);
  const w = Number(weight);
  const a = Number(age);
  const g = (gender ?? "").toUpperCase();

  // 숫자 검증
  if (!Number.isFinite(h) || h <= 0) return 0;
  if (!Number.isFinite(w) || w <= 0) return 0;
  if (!Number.isFinite(a) || a <= 0) return 0;
  if (g !== "M" && g !== "F") return 0;

  let bmr;
  if (g === "M") bmr = 66.47 + 13.75 * w + 5 * h - 6.76 * a;
  else bmr = 655.1 + 9.56 * w + 1.85 * h - 4.68 * a;

  return Math.round(bmr);
}

const state = reactive({
  form: {
    weight: null,
    height: null,
    bmi: null,
    bmr: null,
  },
});

const saveFormData = async () => {
  const height = state.form.height;
  const weight = state.form.weight;

  const calcBmi = calculateBmi(height, weight);
  const calcBmr = calculateBmr(height, weight, userAge.value, userGender.value);

  state.form.bmi = calcBmi;
  state.form.bmr = calcBmr;

  const res = await saveUserBasicBodyInfo(state.form);
  if (res === undefined || res.status !== 200) {
    alert("에러발생");
    return;
  }
  bodyCompositionStore.setBasicInfo(state.form);
  bodyCompositionStore.recentBodyInfo = { ...state.form };

  // 모달창 닫기
  showDialog.value = false;
};
watch(showDialog, (isOpen) => {
  if (isOpen) {
    // 열릴 때 최근 값으로 프리필
    state.form.height = bodyCompositionStore.recentBodyInfo?.height ?? null;
    state.form.weight = bodyCompositionStore.recentBodyInfo?.weight ?? null;
    state.form.bmi = null;
    state.form.bmr = null;
  } else {
    // 닫힐 때만 초기화하고 싶다면 여기에서
    // state.form.height = null;
    // state.form.weight = null;
    // state.form.bmi = null;
    // state.form.bmr = null;
  }
});
</script>

<template>
  <div class="content_bmi">
    <!-- BMI 카드 -->
    <div class="bmi-card" v-if="hasBmiData">
      <div class="d-flex justify-space-between">
        <div class="d-flex ga-1">
          <span class="otd-body-2"> BMI </span>
          <span class="otd-body-1">{{ bmi }}</span>
        </div>
        <div class="otd-caption chip_bmi">{{ bmiStatus }}</div>
      </div>

      <div class="bmi-slider-wrapper">
        <div class="gradient-bar w-100"></div>
        <v-slider
          :model-value="bmi"
          :min="minBmi"
          :max="maxBmi"
          step="0.1"
          track-size="12"
          thumb-size="6"
          thumb-color="white"
          color="transparent"
          readonly
          thumb-label
          hide-details
        />
      </div>

      <div class="bmi-legend">
        <span>15</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>35</span>
        <span>40</span>
      </div>

      <!-- bmiInfo 기반일 때만 수정 가능 -->
      <div v-if="isBmiInfo" class="overlay">
        <v-btn
          class="btn_update otd-shadow otd-box-style"
          color="#ffe864"
          @click="showDialog = true"
          >수정하기</v-btn
        >
      </div>
    </div>

    <!-- BMI 미입력 상태 -->
    <div
      v-else
      class="calc_bmi d-flex flex-column justify-center align-center ga-1"
    >
      <v-btn
        class="btn_bmi otd-shadow"
        color="#ffe864"
        @click="showDialog = true"
      >
        BMI 계산기
      </v-btn>
      <span class="otd-body-3"
        >체중, 키를 입력하고 BMI와 기초대사량을 계산해보세요!</span
      >
    </div>
  </div>

  <!-- BMI 계산기 모달 -->
  <v-dialog v-model="showDialog" max-width="400">
    <div class="modal-container">
      <v-card-title class="text-h6">BMI 계산기</v-card-title>
      <v-card-text>
        <v-text-field
          v-model.number="state.form.height"
          label="신장 (cm)"
          type="number"
          variant="outlined"
        />
        <v-text-field
          v-model.number="state.form.weight"
          label="체중 (kg)"
          type="number"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="btn btn-cancel" variant="text" @click="showDialog = false"
          >취소</v-btn
        >
        <v-btn class="btn btn-confirm" @click="saveFormData">저장</v-btn>
      </v-card-actions>
    </div>
  </v-dialog>

  <Modal
    :show="noticeDialog"
    title="키와 체중을 알려주세요!"
    message="기본 신체 정보로 bmi를 계산해드릴게요."
    type="info"
    confirmText="입력하기"
    @close="(noticeDialog = false), (showDialog = true)"
  />
</template>

<style lang="scss" scoped>
.content_bmi {
  width: 100%;
  // max-width: 350px;

  .chip_bmi {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 65px;
    height: 20px;
    border-radius: 5px;

    background-color: #ffe864;
  }

  .bmi-slider-wrapper {
    position: relative;
  }
  .gradient-bar {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    height: 8px;
    // max-width: 315px;
    border-radius: 6px;
    background: linear-gradient(
      to right,
      #00d5df 11%,
      #9ae095 39%,
      #ffe864 65%,
      #ff5050 100%
    );
    z-index: 0;
  }
}

.bmi-legend {
  display: flex;
  justify-content: space-between;
  //   color: #ececec;
  font-size: 9px;
  // max-width: 315px;
}

.bmi-card {
  position: relative;

  border-radius: 8px;
  background: #fff;
  transition: 0.3s;
  width: 100%;

  &:hover .overlay {
    opacity: 1;
    pointer-events: auto;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(199, 199, 199, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: 0.3s;
}
.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideUp 0.3s ease-out;
  padding: 16px;
}
.btn_update {
  border-radius: 10px;
}
.btn {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-full {
  flex: 1 1 100%;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}
.btn-confirm {
  background: #393e46;
  color: white;
}
</style>
