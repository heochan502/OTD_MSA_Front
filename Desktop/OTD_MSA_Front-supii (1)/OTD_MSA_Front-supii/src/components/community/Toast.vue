<template>
  <transition name="toast-fade">
    <div v-if="open" class="toast" role="status" aria-live="polite">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  message: { type: String, default: '' },
});
</script>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: #111827;
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  z-index: 9999;
  font-size: 14px;
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
