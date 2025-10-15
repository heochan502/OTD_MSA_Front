<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: Boolean,
  title: String,
  message: String,
  type: {
    type: String,
    default: 'info', // 'info', 'success', 'error', 'warning', 'confirm'
  },
  confirmText: {
    type: String,
    default: '확인',
  },
  cancelText: {
    type: String,
    default: '취소',
  },
});

const emit = defineEmits(['close', 'confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleCancel = () => {
  emit('cancel');
  emit('close');
};

const handleOverlayClick = () => {
  if (props.type !== 'confirm') {
    emit('close');
  }
};
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="handleOverlayClick">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button
            v-if="type !== 'confirm'"
            class="close-btn"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <div class="modal-body">
          <div
            class="icon-container"
            :class="{
              'icon-success': type === 'success',
              'icon-error': type === 'error',
              'icon-warning': type === 'warning',
              'icon-confirm': type === 'confirm',
            }"
          >
            <span v-if="type === 'success'" class="icon">✓</span>
            <span v-else-if="type === 'error'" class="icon">✕</span>
            <span v-else-if="type === 'warning'" class="icon">⚠</span>
            <span v-else-if="type === 'confirm'" class="icon">?</span>
            <span v-else class="icon">ℹ</span>
          </div>

          <p class="modal-message" v-html="message"></p>
        </div>

        <div class="modal-footer">
          <button
            v-if="type === 'confirm'"
            class="btn btn-cancel"
            @click="handleCancel"
          >
            {{ cancelText }}
          </button>
          <button
            class="btn btn-confirm"
            :class="{ 'btn-full': type !== 'confirm' }"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #666;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.icon-container {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.icon-success {
  background: #dcfce7;
}

.icon-error {
  background: #fee2e2;
}

.icon-warning {
  background: #fef3c7;
}

.icon-confirm {
  background: #dbeafe;
}

.icon {
  font-size: 32px;
  font-weight: bold;
}

.icon-success .icon {
  color: #16a34a;
}

.icon-error .icon {
  color: #dc2626;
}

.icon-warning .icon {
  color: #f59e0b;
}

.icon-confirm .icon {
  color: #3b82f6;
}

.modal-message {
  font-size: 16px;
  line-height: 1.6;
  color: #666;
  margin: 0;
  white-space: pre-wrap;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-full {
  flex: 1 1 100%;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.btn-confirm {
  background: #00d5df;
  color: white;
}

.btn-confirm:hover {
  background: #00c3ce;
  color: white;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: translateY(20px);
}
</style>
