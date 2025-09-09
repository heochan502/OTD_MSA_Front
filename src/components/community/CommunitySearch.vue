<script setup>
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '검색어를 입력해 주세요' },
  delay: { type: Number, default: 0 } // 디바운스가 필요하면 값 주기
});
const emit = defineEmits(['update:modelValue', 'submit']);

const keyword = ref(props.modelValue);
let timer = null;

watch(() => props.modelValue, v => (keyword.value = v));

function onInput(e) {
  const v = e.target.value;
  if (props.delay > 0) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      emit('update:modelValue', v);
    }, props.delay);
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
<button class="search-btn" @click="onSubmit" aria-label="검색">
  🔍
</button>

  </div>
</template>

<style scoped>
.search-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  padding: 10px 12px;
  gap: 8px;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
}
.search-btn {
  border: none;
  background: #f2f4f6;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.search-btn img {
  width: 18px;
  height: 18px;
}
</style>
