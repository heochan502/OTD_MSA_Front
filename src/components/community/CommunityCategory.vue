<script setup>
const props = defineProps({
  categories: { type: Array, required: true }, // [{key,label,icon}]
  selected: { type: String, required: true },
});
const emit = defineEmits(['select']);

function clickCategory(key) {
  emit('select', key);
}
</script>

<template>
  <div class="category-wrap">
    <div
      v-for="c in categories"
      :key="c.key"
      class="category-chip"
      :class="{ active: selected === c.key }"
      @click="clickCategory(c.key)"
    >
      <img :src="c.icon" :alt="c.label" />
      <div class="label">{{ c.label }}</div>
    </div>
  </div>
</template>

<style scoped>
/* 4등분 그리드 + 좌우 대칭 패딩 → 가로 스크롤 제거 */
.category-wrap {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0px;
}

/* 카드(정사각형) 크기 업 */
.category-chip {
  aspect-ratio: 1 / 1; /* 정사각형 */
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.08),
    -6px -6px 12px rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 2px;
  padding: 8px 10px;
  cursor: pointer;
  border: 1px solid transparent;
}
.category-chip.active {
  border-color: #2ec4c7;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.08),
    -3px -3px 8px rgba(255, 255, 255, 0.9);
}

/* 이모티콘 더 크게 */
.category-chip img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

/* 라벨도 살짝 키움 */
.label {
  font-size: 12px;
  font-weight: 600;
  color: #4d4d4d;
  line-height: 1.1;
  text-align: center;
}
</style>
