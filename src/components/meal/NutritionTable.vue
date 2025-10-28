<script setup>
const props = defineProps({
  totalKcal: { type: Number, default: 0 },  //  숫자
  rows: {
    type: Array,
    default: () => [
      { label: '탄수화물', value: '0' },
      { label: '단백질', value: '0' },
      { label: '지방', value: '0' },
      { label: '당류', value: '0' },
      { label: '나트륨', value: '0' },
    ],
  },
});
</script>

<template>
  <div class="box">
    <div class="head">
      <div class="title">영양정보</div>
      <div class="kcal">
        <span>총 열량</span><b>{{ totalKcal.toLocaleString() }} kcal</b>
      </div>
    </div>
    <ul class="table">
      <li class="row" v-for="r in rows" :key="r.label">
        <span class="label">{{ r.label }}</span>
        <span v-if="r.label==='나트륨'" class="value">{{ (Number(r.value)).toLocaleString() }} mg</span>
        <span v-else class="value">{{ r.value }} g/ml</span>
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
