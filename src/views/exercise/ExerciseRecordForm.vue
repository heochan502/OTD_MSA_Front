<script setup>
import { reactive, computed, ref } from "vue";
const state = reactive({
  form: {
    exerciseId: null,
    effortLevel: 1,
    startAt: null,
    endAt: null,
  },
});

// 거리기반운동여부
const hasDistance = true;

// 운동강도 색상
const color = computed(() => {
  if (state.form.effortLevel < 4) return "#00D5DF";
  if (state.form.effortLevel < 7) return "#FFB996";
  return "#FF8282";
});
</script>

<template>
  <div class="wrap otd-body-1">
    <div class="wrap_form">
      <div class="content_main">
        <div>운동 시작</div>
        <div class="input_box otd-box-style otd-shadow">
          <input type="datetime-local" class="otd-body-1" />
        </div>
      </div>
      <div class="content_main">
        <div>운동 종료</div>
        <div class="input_box otd-box-style otd-shadow">
          <input type="datetime-local" class="otd-body-1" />
        </div>
      </div>
      <div class="content_main">
        <div>운동</div>
        <div class="input_box otd-box-style otd-shadow">
          <v-combobox
            v-model="state.form.exerciseId"
            items="0"
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
            suffix="km"
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
          <div>{{ state.form.effortLevel }}</div>
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
            <!-- <template v-slot:thumb-label="{ modelValue }">
            {{ effortLevels[modelValue - 1].emoji }}
          </template> -->
          </v-slider>
        </div>
      </div>
      <div class="content_result">
        <div>
          <div>활동 에너지는</div>
          <div class="otd-title">{{ "200kcal" }}</div>
        </div>
        <div>
          <div>운동시간</div>
          <div class="otd-title">{{ "60분" }}</div>
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
    background: url("/image/main/calender.png") center/80% no-repeat;
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
