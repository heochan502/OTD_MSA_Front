<script setup>
const props = defineProps({
  categories: { type: Array, required: true },
});
const emit = defineEmits(['pick', 'close']);
</script>

<template>
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
/* ✅ 오버레이 위에서 ‘화면 우상단’에 고정 */
.picker-floating {
  position: fixed;
  top: 80px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10000; /* 오버레이 위에서 잘 보이도록 */
}

.pill {
  min-width: 90px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
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

@media (max-width: 480px) {
  .picker-floating {
    top: 72px;
    right: 8px;
    gap: 8px;
  }
}
</style>
