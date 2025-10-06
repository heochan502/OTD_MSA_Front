<script setup>
const props = defineProps({
  categories: { type: Array, required: true },
});
const emit = defineEmits(['pick', 'close']);
</script>

<template>
  <!-- 우상단에 떠있는 작은 알약 버튼 스택 -->
  <div class="picker-floating">
    <button
      v-for="c in categories"
      :key="c.key"
      class="pill"
      @click="emit('pick', c.key)"
    >
      {{ c.label }}
    </button>
    <button class="pill pill-cancel" @click="emit('close')">취소</button>
  </div>
</template>

<style scoped>
/* ✅ 부모(.overlay) 기준으로 위치 */
.picker-floating {
  position: absolute; /* ← fixed → absolute */
  top: 96px; /* 헤더/검색창 높이에 맞춰 조정 */
  right: 12px; /* 프레임 우측 여백 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 60; /* overlay 내부에서만 위 */
}

/* 알약 버튼 스타일 */
.pill {
  min-width: 90px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  font-weight: 700;
  color: #333;
  cursor: pointer;
  text-align: center;
}
.pill:active {
  transform: translateY(1px);
}
.pill-cancel {
  background: #f7f7f7;
  color: #666;
}
</style>
