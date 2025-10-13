<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  images: { type: Array, default: () => [] },
  start: { type: Number, default: 0 },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(['update:open', 'close']);

const idx = ref(0);
const isOpen = ref(false);

const list = computed(() =>
  (props.images || []).map((it) =>
    typeof it === 'string' ? { url: it, name: '' } : it
  )
);
const cur = computed(() => list.value[idx.value] || null);
const count = computed(() => list.value.length);

watch(
  () => props.open,
  (v) => {
    isOpen.value = v;
    if (v) idx.value = clamp(props.start);
  },
  { immediate: true }
);

watch(
  () => props.start,
  (v) => {
    if (isOpen.value) idx.value = clamp(v);
  }
);

function clamp(i) {
  if (!count.value) return 0;
  return Math.min(Math.max(0, i), count.value - 1);
}

function close() {
  isOpen.value = false;
  emit('update:open', false);
  emit('close');
}

function prev() {
  if (!count.value) return;
  idx.value = (idx.value - 1 + count.value) % count.value;
}
function next() {
  if (!count.value) return;
  idx.value = (idx.value + 1) % count.value;
}

function onKey(e) {
  if (!isOpen.value) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowLeft') prev();
  else if (e.key === 'ArrowRight') next();
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <teleport to="body">
    <div v-if="isOpen" class="lb__backdrop" @click="close">
      <div class="lb__panel" @click.stop>
        <button class="lb__btn lb__close" aria-label="닫기" @click="close">
          ×
        </button>
        <button v-if="count > 1" class="lb__btn lb__nav lb__prev" @click="prev">
          ‹
        </button>
        <button v-if="count > 1" class="lb__btn lb__nav lb__next" @click="next">
          ›
        </button>

        <div class="lb__stage">
          <img v-if="cur" :src="cur.url" :alt="cur.name || ''" />
        </div>

        <div class="lb__caption" v-if="cur?.name || count > 1">
          <span class="lb__title">{{ cur?.name }}</span>
          <span class="lb__idx" v-if="count > 1"
            >{{ idx + 1 }} / {{ count }}</span
          >
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* ===== Backdrop: 살짝 밝은 그라디언트 + 블러 ===== */
.lb__backdrop {
  position: fixed;
  inset: 0;
  background: radial-gradient(
      1200px 600px at 50% 10%,
      rgba(255, 255, 255, 0.08),
      transparent 60%
    ),
    rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  z-index: 9999;
}

/* ===== Panel: 밝은 글래스 카드 느낌 ===== */
.lb__panel {
  position: relative;
  width: min(96vw, 1040px);
  max-height: 90vh;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 12px;
  padding: 12px 14px 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ===== Stage: 이미지 비율 유지 + 여백 균형 ===== */
.lb__stage {
  width: 100%;
  min-height: 200px;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.lb__stage img {
  max-width: 100%;
  max-height: 76vh; /* 높이 여유 */
  border-radius: 12px;
  object-fit: contain;
  user-select: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* ===== Caption: 반투명 필 + 또렷한 텍스트 ===== */
.lb__caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #f4f6f8;
  font-size: 13px;
  line-height: 1;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}
.lb__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
  opacity: 0.95;
}
.lb__idx {
  opacity: 0.9;
}

/* ===== Buttons: 밝은 원형 버튼 + 호버 효과 ===== */
.lb__btn {
  position: absolute;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #1e1e1e;
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
.lb__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  background: #fff;
}

/* 닫기 버튼 */
.lb__close {
  top: 10px;
  right: 12px;
  font-size: 20px;
  line-height: 1;
  width: 38px;
  height: 38px;
  border-radius: 50%;
}

/* 좌우 네비게이션 */
.lb__nav {
  top: 50%;
  transform: translateY(-50%);
  font-size: 28px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
}
.lb__prev {
  left: 10px;
}
.lb__next {
  right: 10px;
}

/* ===== Responsive Tweaks ===== */
@media (max-width: 480px) {
  .lb__panel {
    width: 96vw;
    padding: 10px 10px 12px;
    border-radius: 14px;
  }
  .lb__stage img {
    max-height: 68vh;
  }
  .lb__nav {
    width: 40px;
    height: 40px;
    font-size: 26px;
  }
  .lb__close {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }
}
</style>
