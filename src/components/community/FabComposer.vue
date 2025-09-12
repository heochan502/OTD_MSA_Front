<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
const emit = defineEmits(['pick-category']);
const open = ref(false);
const toggle = () => (open.value = !open.value);
const pick = (cat) => {
  open.value = false;
  emit('pick-category', cat);
};
const onEsc = (e) => {
  if (e.key === 'Escape') open.value = false;
};
onMounted(() => window.addEventListener('keydown', onEsc));
onBeforeUnmount(() => window.removeEventListener('keydown', onEsc));
</script>

<template>
  <button class="fab" @click="toggle" aria-label="글쓰기">＋</button>

  <transition name="fade">
    <div v-if="open" class="overlay" @click.self="open = false">
      <div class="sheet">
        <button class="sheet-btn" @click="pick('free')">자유수다</button>
        <button class="sheet-btn" @click="pick('diet')">다이어트</button>
        <button class="sheet-btn" @click="pick('work')">운동</button>
        <button class="sheet-btn" @click="pick('love')">연애</button>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fab {
  position: fixed;
  right: 22px;
  bottom: 110px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  border: none;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
  font-size: 28px;
  font-weight: 700;
  cursor: pointer;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 20px 110px;
}
.sheet {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sheet-btn {
  height: 42px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #fff;
  box-shadow: var(--shadow-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-typo-primary);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
