<script setup>
import { computed, ref, watch } from 'vue';

import {useMealSelectedStore} from '@/stores/meal/mealStore.js'


import { getMealRecord } from '@/services/meal/mealService.js';

import dayjs from 'dayjs';

import 'dayjs/locale/ko';

dayjs.locale('ko');

const selectedDay = useMealSelectedStore();



// props: 외부에서 v-model로 날짜 제어 가능
const props = defineProps({
  modelValue: { type: [String, Date], default: () => new Date() },
  // 오늘 기준 과거/미래 며칠 보여줄지 (총 길이 = before + 1 + after)
  before: { type: Number, default: 365 },
  after: { type: Number, default: 365 },
});
const emit = defineEmits(['update:modelValue', 'change']);

const KOREAN_DOW = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 유틸
const toDate = (value) => (value instanceof Date ? value : new Date(value));
const fmt2 = (n) => String(n).padStart(2, '0');

const today = computed(() =>  selectedDay.selectedDay.setDay ?? startOfDay(new Date()));
const selected = ref(startOfDay(toDate(props.modelValue)));

watch(
 () => props.modelValue,
  async (value) => {
    selected.value = startOfDay(toDate(value));
    // const res = await getMealRecord(selectedDay.selectedDay.setDay);
  }
);

function startOfDay(day) {
  const x = new Date(day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(day, now) {
  const x = new Date(day);
  x.setDate(x.getDate() + now);
  return startOfDay(x);
}
function isSame(d1, d2) {
  return d1.getTime() === d2.getTime();
}

const days = computed(() => {
  const arr = [];
  const base = today.value;
  for (let index = -props.before; index <= props.after; index++) {
    const dt = addDays(base, index);
    const m = dt.getMonth() + 1;
    const day = dt.getDate();
    arr.push({
      key: dt.getTime(),
      date: dt,
      md: `${m}.${day}`, // 9.5
      dow: KOREAN_DOW[dt.getDay()], // 금
      day: day, // 배지에 크게
    });
  }
  return arr;
});

const internalIndex = ref(0);

// 초기 선택 인덱스 동기화
const syncIndex = () => {
  const idx = days.value.findIndex((d) => isSame(d.date, selected.value));
  internalIndex.value = idx === -1 ? Math.floor(days.value.length / 2) : idx;
  
};
watch(days, syncIndex, { immediate: true });
watch(selected, syncIndex);

// 선택 처리
function select(day) {
  // 클릭한 날과 현재 선택 문자열을 동일 포맷으로 맞춤
  const clicked = dayjs(day).format('YYYY-MM-DD');
  const current = selectedDay.selectedDay.setDay; // 문자열

  if (clicked === current) {
    // 같으면 "오늘"로 전환
    const todayStr = dayjs().format('YYYY-MM-DD');
    selectedDay.selectedDay.setDay = todayStr;
    selected.value = startOfDay(new Date()); // 내부 selected도 오늘로
  } else {
    // 다르면 클릭한 날짜로 선택
    selectedDay.selectedDay.setDay = clicked;
    selected.value = startOfDay(day);
  }

  emit('update:modelValue', selected.value);
  emit('change', selected.value);
}
</script>

<template>
  <div class="date-strip">
    <v-slide-group
      v-model="internalIndex"
      class="px-2"
      center-active
      mandatory
      @update:modelValue=""
    >
      <v-slide-group-item
        v-for="(data, idx) in days"
        :key="data.key"
        v-slot="{ isSelected, toggle, selectedClass, props }"
      >
        <button
          v-bind="props"
          class="day-btn"
          :class="[{ selected: isSelected, [selectedClass]: true }]"
          @click="
            () => {
              toggle();
              select(data.date);
            }
          "
        >
          <!-- 상단 '9.5 금' 형태 -->
          <div class="d-flex flex-row align-center ga-1">
            <span class="otd-category">{{ data.md }}</span>
            <span class="day-badge otd-subtitle-2">{{ data.dow }}</span>
          </div>
        </button>
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>

<style scoped>
.date-strip {
  position: relative;
  background: #00d5df;
}

.otd-category {
  color: #ffffff !important;
}
/* 각 날짜 버튼 */
.day-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 120px; /* 한 칸 너비 */
  height: 40px;
  margin: 6px 2px;
  border: 0;
  background: #00d5df;
  border-radius: 12px;
  cursor: pointer;
}

/* 상단 "9.5 금" */
.day-top {
  /* font-size: 13px; */
  color: rgba(0, 0, 0, 0.56);
}
.day-top .dow {
  margin-left: 4px;
}

/* 가운데 원형 배지(선택 시 노란 원 느낌) */
.day-badge {
  width: 30px;
  height: 30px;
  display: flex;
  /* line-height: 28px; */
  text-align: center;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.74);
  background: transparent;
}

/* 선택 스타일 */
.day-btn.selected .day-badge {
  background: #ffd54f; /* 선택 원 색(노랑 계열) */
  box-shadow: none;
  color: #000;
}
.day-btn.selected .day-top {
  color: #000;
}

/* 화살표 버튼은 Vuetify가 show-arrows로 렌더링해줌 */
</style>
