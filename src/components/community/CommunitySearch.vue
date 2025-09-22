<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '검색어를 입력해 주세요' },
  delay: { type: Number, default: 0 },
});
const emit = defineEmits(['update:modelValue', 'submit']);

const keyword = ref(props.modelValue);
let timer = null;

watch(
  () => props.modelValue,
  (v) => (keyword.value = v)
);

function onInput(e) {
  const v = e.target.value;
  if (props.delay > 0) {
    clearTimeout(timer);
    timer = setTimeout(() => emit('update:modelValue', v), props.delay);
  } else {
    emit('update:modelValue', v);
  }
}
function onSubmit() {
  emit('submit', keyword.value);
}
</script>

<template>
  <div class="search-wrap">
    <input
      class="search-input"
      type="text"
      :placeholder="placeholder"
      :value="keyword"
      @input="onInput"
      @keyup.enter="onSubmit"
    />
    <button class="search-btn" @click="onSubmit" aria-label="검색">🔍</button>
  </div>
</template>

<style scoped>
.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid #e8ebef; /* 미세 테두리 */
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.05); /* 얕은 그림자 */
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: #111827;
}
.search-btn {
  border: 1px solid #e8ebef;
  background: #f3f5f8;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}
</style>
