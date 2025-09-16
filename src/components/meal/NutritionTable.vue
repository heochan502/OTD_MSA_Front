<script setup>
const props = defineProps({
  totalKcal: { type: Number, default: 757 },
  rows: {
    type: Array,
    default: () => [
      { label: '탄수화물', value: '39.9g' },
      { label: '단백질', value: '16.8g' },
      { label: '지방', value: '24.9g' },
      { label: '당류', value: '50g' },
      { label: '나트륨', value: '523mg' },
    ],
  },
});
</script>

<template>
  <div class="box">
    <div class="head">
      <div class="title">영양정보</div>
      <div class="kcal">
        <span>총 열량</span><b>{{ totalKcal }} kcal</b>
      </div>
    </div>
    <ul class="table">
      <li class="row" v-for="r in rows" :key="r.label">
        <span class="label">{{ r.label }}</span>
        <span class="value">{{ r.value }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.box {
  margin-top: 10px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 2px;
  color: #6a6a6a;
}
.title {
  color: #00bcd4;
  font-weight: 800;
}
.kcal {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.kcal b {
  font-size: 18px;
  color: #333;
}
.table {
  list-style: none;
  padding: 0;
  margin: 0;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}
.label {
  color: #666;
}
.value {
  font-weight: 700;
}
</style>
