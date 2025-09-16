<script setup>
import { ref, computed } from "vue";

const claendarAttrs = ref([
  {
    key: "today",
    dates: new Date(),
  },
]);

// bmi 관련
const minBmi = 15;
const maxBmi = 40;

// bmi 계산식
const bmi = computed(() => {
  return 24;
  // if (!healthStore.logList.length) return 0;
  // const heightInMeters = (healthStore.logList[0]?.height || 0) / 100;
  // if (!heightInMeters || !healthStore.logList[0]?.weight) return 0;
  // return parseFloat(
  //   (healthStore.logList[0]?.weight / heightInMeters ** 2).toFixed(1)
  // );
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
</script>

<template>
  <div class="wrap">
    <div class="content">
      <div class="d-flex align-center ga-2">
        <!-- 캘린더 아이콘 -->
        <img
          src="\public\image\main\calender.png"
          alt="calendar_icon"
          class="calendar_icon"
        />
        <!-- 현재 년월 -->
        <span class="otd-subtitle-1">{{ "2025년 9월" }}</span>
      </div>
      <!-- weekly 영역 -->
      <div class="d-flex justify-center otd-top-margin">
        <vc-calendar
          class="calendar-style"
          view="weekly"
          :attributes="claendarAttrs"
        >
          <template #header-title-wrapper></template>
        </vc-calendar>
      </div>
    </div>
    <!-- 운동기록 영역 -->
    <div class="content">
      <!-- <운동기록> -->
      <div class="subtitle">
        <div class="d-flex align-center ga-1">
          <p class="otd-subtitle-1 mb-0">운동기록</p>
          <img
            class="btn_add"
            src="\public\image\main\btn_add_grey.png"
            alt="운동기록 추가 버튼"
          />
        </div>
        <div>
          <span class="otd-body-2">더보기</span>
        </div>
      </div>
      <!-- <리스트> -->
      <div class="list-wrap otd-top-margin">
        <ul class="d-flex flex-column ga-2 p-0">
          <li class="list_item otd-box-style">
            <div class="d-flex flex-column otd-body-1">
              <span>운동명</span>
              <span>운동시간 || 거리</span>
            </div>
            <div class="d-flex align-center ga-2">
              <span class="otd-body-3">운동시작시간</span>
              <img
                class="btn_more"
                src="\public\image\main\btn_more.png"
                alt="더보기 버튼"
              />
            </div>
          </li>
          <li class="list_item otd-box-style">
            <div class="d-flex flex-column otd-body-1">
              <span>운동명</span>
              <span>운동시간 || 거리</span>
            </div>
            <div class="d-flex align-center ga-2">
              <span class="otd-body-3">운동시작시간</span>
              <img
                class="btn_more"
                src="\public\image\main\btn_more.png"
                alt="더보기 버튼"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!-- 체성분분석 -->
    <div class="content_wrap">
      <!-- 소제목 -->
      <div class="subtitle">
        <span class="otd-subtitle-1">체성분 분석</span>
        <span class="otd-body-2">변화 보기</span>
      </div>
      <!-- 내용 -->
      <div class="content_main otd-box-style otd-top-margin">
        <!-- 체성분 기록일 -->
        <div>yyyy년 MM월 dd일</div>
        <!-- 체성분 정보 -->
        <div class="d-flex">
          <div>
            <div class="otd-body-1">체중(kg)</div>
            <div class="otd-subtitle-1">{{ 68 }}</div>
          </div>
          <div>
            <div class="otd-body-1">체지방률(%)</div>
            <div class="otd-subtitle-1">{{ 68 }}</div>
          </div>
          <div>
            <div class="otd-body-1">골격근량(kg)</div>
            <div class="otd-subtitle-1">{{ 68 }}</div>
          </div>
        </div>
        <!-- BMI -->
        <div class="content_bmi">
          <div class="d-flex justify-space-between">
            <div class="d-flex ga-1">
              <span class="otd-body-2"> BMI </span>
              <span class="otd-body-1">
                {{ bmi }}
              </span>
            </div>
            <div class="otd-caption chip_bmi">{{ bmiStatus }}</div>
          </div>
          <div>
            <!-- 슬라이더로 현재 유저 bmi 보여주기 -->
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
            <!-- 범례 -->
            <div class="bmi-legend">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
              <span>40</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
p {
  padding: 0px;
}
.content_wrap {
  margin-bottom: 30px;
}
.calendar_icon {
  width: 18px;
  height: 18px;
}
.btn_add {
  width: 16px;
  height: 16px;
}
.subtitle {
  display: flex;
  align-content: center;
  justify-content: space-between;
}
.list_item {
  display: flex;
  align-content: center;
  align-items: center;
  justify-content: space-between;

  min-width: 350px;
  height: 75px;
  padding: 17px;

  .btn_more {
    width: 28px;
    height: 28px;
  }
}

.content_main {
  width: 350px;
  height: 188px;
  padding: 17px;
}

.content_bmi {
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
    // width: 100%;
    border-radius: 6px;
    background: linear-gradient(
      to right,
      #3f51b1 0%,
      #5a55ae 13%,
      #7b5fac 25%,
      #8f6aae 38%,
      #a86aa4 50%,
      #cc6b8e 62%,
      #f18271 75%,
      #f3a469 87%,
      #f7c978 100%
    );
    z-index: 0;
  }
}

.bmi-legend {
  display: flex;
  justify-content: space-between;
  //   color: #ececec;
  font-size: 9px;
}
</style>
