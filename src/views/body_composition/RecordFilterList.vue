<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useBodyCompositionStore } from "@/stores/body_composition/bodyCompositionStore";
import { getList } from "@/services/body_composition/bodyCompositionService";
import { formatDateDayTime, formatDateISO } from "@/utils/dateTimeUtils";

const bodyCompositionStore = useBodyCompositionStore();
const selectedStartDate = ref("");
const selectedEndDate = ref("");
const seletedDeviceType = ref("");
const params = reactive({
  page: 1,
  row_per_page: 10,
  start_date: selectedStartDate,
  end_date: selectedEndDate,
  device: seletedDeviceType,
});
onMounted(async () => {
  if (bodyCompositionStore.lastest) {
    console.log("기록있음");
    await fetchBodyCompositionList(params);
  }
});
const fetchBodyCompositionList = async (params) => {
  const res = await getList(params);
  if (res === undefined || res.status !== 200) {
    alert(`에러발생? ${res.status}`);
    return;
  }
  bodyCompositionStore.filterList = res.data;
};

// 체크박스
const checkboxAll = ref(false); // 전체 선택
const checkboxItem = ref(false); // 단일 선택
watch(checkboxAll, () => {
  //   console.log(checkboxAll.value);
  checkboxItem.value = true;
});

// 리스트 개수
const countList = bodyCompositionStore.filterList?.length ?? 0;

// 기간 범위 목록
const selectionDate = computed(() => {
  return bodyCompositionStore.filterList.map((d) => formatDateISO(d.createdAt));
});

// 장비종류
const selectionDeviceType = computed(() => {
  return bodyCompositionStore.filterList.map((d) => d.deviceType);
});
</script>

<template>
  <div class="wrap">
    <!-- 필터링조건 -->
    <div class="condition">
      <div class="wrap_contents">
        <span class="otd-subtitle-1 subtitle">기간 범위</span>
        <div class="contents">
          <div class="otd-border daypicker">
            <span class="otd-body-2">시작</span>
            <v-select
              class="otd-subtitle-1"
              v-model="selectedStartDate"
              :items="selectionDate"
              density="compact"
              hide-details="true"
              variant="underlined"
            >
            </v-select>
            <!-- <span class="otd-subtitle-1">{{ "최초" }}</span> -->
          </div>
          <div class="otd-border daypicker">
            <span class="otd-body-2">종료</span>
            <v-select
              class="otd-subtitle-1"
              v-model="selectedEndDate"
              :items="selectionDate"
              density="compact"
              hide-details="true"
              variant="underlined"
            >
            </v-select>
            <!-- <span class="otd-subtitle-1">{{ "최신" }}</span> -->
          </div>
        </div>
      </div>
      <div class="wrap_contents">
        <span class="otd-subtitle-1 subtitle">측정 장비</span>
        <div>
          <v-btn-toggle class="btn_filter otd-border" color="#FFE864">
            <v-btn>전체</v-btn>
          </v-btn-toggle>
          <v-btn-toggle
            v-for="item in selectionDeviceType"
            :key="item.idx"
            class="btn_filter otd-border"
            color="#FFE864"
          >
            <v-btn> {{ item }}</v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </div>
    <hr class="hr" />
    <!-- 기록리스트 -->
    <div class="wrap_list">
      <div class="contents">
        <span class="otd-subtitle-1">{{ countList }}개 데이터</span>
        <div class="d-flex">
          <v-checkbox
            v-model="checkboxAll"
            label="전체 선택"
            hide-details
          ></v-checkbox>
        </div>
      </div>

      <div class="list otd-box-style">
        <div
          v-for="item in bodyCompositionStore.filterList"
          :key="item.idx"
          class="item"
        >
          <v-checkbox v-model="checkboxItem" hide-details> </v-checkbox>
          <div class="d-flex flex-column">
            <span class="otd-body-1">
              {{ formatDateDayTime(item.createdAt) }}
            </span>
            <span class="otd-body-3">
              {{ item.deviceType }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrap_contents {
  margin-bottom: 15px;
}
.subtitle {
  margin-bottom: 10px;
}
.contents {
  display: flex;
}

.daypicker {
  width: 148px;
  height: 80px;
  padding: 10px 12px;

  background-color: #fff;
}
.btn_filter {
  height: 36px;
  margin: 0 2.5px 5px;
  border-radius: 20px;
}
.hr {
  border: 0;
  height: 0;
  //   border-top: 1px solid #e6e6e6;
  border-top: 1px solid #8c8c8c;
}

.item {
  display: flex;
  align-items: center;
}
</style>
