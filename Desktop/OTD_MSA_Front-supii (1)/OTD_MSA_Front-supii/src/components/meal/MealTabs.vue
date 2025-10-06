<script setup>
const props = defineProps({ modelValue: { type: String, default: 'day' } });
const emit = defineEmits(['update:modelValue']);
const setTab = (k) => emit('update:modelValue', k);
</script>

<template>
  <div class="tabs">
    <button
      :class="['pill', { active: modelValue === 'day' }]"
      @click="setTab('day')"
    >
      일간
    </button>
    <button
      :class="['pill', { active: modelValue === 'week' }]"
      @click="setTab('week')"
    >
      주간
    </button>
    <button
      :class="['pill', { active: modelValue === 'month' }]"
      @click="setTab('month')"
    >
      월간
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
}
.pill {
  border: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: #eee;
  font-weight: 700;
  color: #666;
  cursor: pointer;
}
.pill.active {
  background: #fff;
  color: #00bcd4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
