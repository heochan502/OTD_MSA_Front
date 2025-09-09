<script setup>
const props = defineProps({
  categories: { type: Array, required: true }, // [{key,label,icon}]
  selected: { type: String, required: true }
});
const emit = defineEmits(['select']);

function clickCategory(key) {
  emit('select', key);
}
</script>

<template>
  <div class="category-scroll">
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
.category-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

/* iOS 네오몰피즘 느낌의 카드 */
.category-chip {
  min-width: 72px;
  height: 72px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow:
    6px 6px 12px rgba(0,0,0,0.08),
    -6px -6px 12px rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 6px;
  padding: 6px 10px;
  cursor: pointer;
  border: 1px solid transparent;
}
.category-chip.active {
  border-color: #2ec4c7;
  box-shadow:
    3px 3px 8px rgba(0,0,0,0.08),
    -3px -3px 8px rgba(255,255,255,0.9);
}

.category-chip img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.label {
  font-size: 12px;
  font-weight: 600;
  color: #5a5a5a;
}
</style>
