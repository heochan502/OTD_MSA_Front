<script setup>
import { reactive, computed, watch, onMounted } from 'vue';

import { useAuthenticationStore } from '@/stores/user/authentication.js'


const userInfo = useAuthenticationStore();
const props = defineProps({
  open: { type: Boolean, default: false },
  // 초기값 주고 싶으면 전달
  initial: {
    type: Object,
    default: () => ({ foodName: '', flag: 'g' }),
  },
});
const emit = defineEmits(['update:open', 'submit', 'close']);

const form = reactive({
            
  foodDbId: null, // userId로 대체
  foodName: '',
  flag: 'g',
  kcal: 0,
  carbohydrate: 0,
  protein: 0,
  fat: 0,
  sugar: 0,
  natrium: 0,
  amount: 1,
});

watch(
  () => props.open,
  (value) => {
    if (value) Object.assign(form, { ...form, ...props.initial });
  },
  { immediate: true }
);

const unitLabel = computed(() => (form.flag === 'ml' ? 'ml' : 'g'));

const onClose = () => {
  emit('update:open', false);
  emit('close');
};

const onSubmit = () => {
  // 숫자 null 보호
  ['kcal', 'carbohydrate', 'protein', 'fat', 'sugar', 'natrium'].forEach(
    (k) => (form[k] = Number(form[k] || 0))
  );
  emit('submit', { ...form });
  onClose();
};

// ESC 닫기
onMounted(() => {
  const handler = (e) => e.key === 'Escape' && props.open && onClose();
  window.addEventListener('keydown', handler);
});
</script>

<template>
  <teleport to="#modal-root">
    <div v-if="open" class="backdrop" @click.self="onClose" />
    <div
      v-if="open"
      class="otd-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ffd-title"
    >

     <!-- 핸들바 -->
    <div class="sheet-handle" @click="onClose" aria-label="닫기"/>
      <div>
        <header class="sheet-hd">
          <h2 id="ffd-title">음식 자유 입력</h2>
          <button class="icon-btn" @click="onClose" aria-label="닫기">✕</button>
        </header>

        <section class="field">
          <label class="lbl">음식 이름 <span class="req">(필수)</span></label>
          <input
            class="input"
            v-model.trim="form.foodName"
            type="text"
            maxlength="20"
            placeholder="음식 이름 (최대 20자)"
          />
        </section>

        <section class="field">
          <div class="row-between">
            <label class="lbl">영양 정보 <span class="opt">(선택)</span></label>
            <div class="seg">
              <button
                :class="['seg-btn', { active: form.flag === 'g' }]"
                @click="form.flag = 'g'"
              >
                g
              </button>
              <button
                :class="['seg-btn', { active: form.flag === 'ml' }]"
                @click="form.flag = 'ml'"
              >
                ml
              </button>
            </div>
          </div>

          <div class="grid">
            <div class="cell">
              <label>칼로리</label>
              <div class="ctrl">
                <input
                  class="input num"
                  type="number"
                  inputmode="decimal"
                  v-model.number="form.kcal"
                />
                <span class="suffix">kcal</span>
              </div>
            </div>

            <div class="cell">
              <label>탄수화물</label>
              <div class="ctrl">
                <input
                  class="input num"
                  type="number"
                  inputmode="decimal"
                  v-model.number="form.carbohydrate"
                />
                <span class="suffix">{{ unitLabel }}</span>
              </div>
            </div>

            <div class="cell">
              <label>단백질</label>
              <div class="ctrl">
                <input
                  class="input num"
                  type="number"
                  inputmode="decimal"
                  v-model.number="form.protein"
                />
                <span class="suffix">{{ unitLabel }}</span>
              </div>
            </div>

            <div class="cell">
              <label>지방</label>
              <div class="ctrl">
                <input
                  class="input num"
                  type="number"
                  inputmode="decimal"
                  v-model.number="form.fat"
                />
                <span class="suffix">{{ unitLabel }}</span>
              </div>
            </div>

            <div class="cell">
              <label>당</label>
              <div class="ctrl">
                <input
                  class="input num"
                  type="number"
                  inputmode="decimal"
                  v-model.number="form.sugar"
                />
                <span class="suffix">{{ unitLabel }}</span>
              </div>
            </div>

            <div class="cell">
              <label>나트륨</label>
              <div class="ctrl">
                <input
                  class="input num"
                  type="number"
                  inputmode="decimal"
                  v-model.number="form.natrium"
                />
                <span class="suffix">{{ unitLabel }}</span>
              </div>
            </div>
          </div>

          <p class="hint">* 입력하지 않은 영양정보는 0으로 자동 입력돼요.</p>
        </section>

        <button class="cta" :disabled="!form.foodName" @click="onSubmit">
          목록에 담기
        </button>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* 배경 */
.backdrop {
  /* position: fixed; */
  position: absolute ;
  inset: 0;
  /* display: flex;
  align-self: center;
  justify-self: center; */
  width: 391px;
  height: 809px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(1px);
  z-index: 999;
  border-radius: 60px;
}

/* 핸들바 */
.sheet-handle {
  width: 134px;
  height: 7px;
  padding-top: 0px;
  border-radius: 999px;
  background: #000000;
  margin: 6px auto 12px;
}

/* 가운데 카드(시트) */
.otd-sheet {
 /* display: flex; */
  /* direction : column-reverse; */
  /* justify-self: end; */
  position: absolute ;
  width: 391px;
    margin-top: 239px;
  background: #fff;
  border-radius: 0px 0px 60px 60px;
  box-shadow: 0 0px 10px rgba(0, 0, 0, 0.1);
  padding: 5px 18px 16px;
  z-index: 1000;
}

/* 헤더 */
.sheet-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.sheet-hd h2 {
  font-size: 18px;
  font-weight: 800;
}
.icon-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
  color: #222;
}

/* 공통 필드 */
.field {
  margin-top: 12px;
}
.lbl {
  font-weight: 700;
}
.req {
  color: #ff595e;
  font-weight: 700;
}
.opt {
  color: #8f8f8f;
}

.input {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  background: #f5f5f7;
  padding: 0 12px;
  margin-top: 8px;
  font-size: 14px;
}
.input:focus {
  outline: none;
  border-color: #bfc9ff;
  background: #fff;
}

/* g/ml 세그 토글 */
.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.seg {
  display: inline-flex;
  background: #f1f3f5;
  border-radius: 999px;
  padding: 3px;
}
.seg-btn {
  min-width: 40px;
  height: 28px;
  padding: 0 10px;
  border: none;
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  color: #6b6b6b;
}
.seg-btn.active {
  background: #fff;
  color: #222;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 2열 그리드 */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.cell label {
  font-size: 13px;
  color: #5b5b5b;
}
.ctrl {
  position: relative;
}
.input.num {
  padding-right: 46px;
  text-align: left;
}
.suffix {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #8b8b8b;
}

/* 안내문 */
.hint {
  color: #9b9b9b;
  font-size: 12px;
  margin-top: 8px;
}

/* CTA 버튼 */
.cta {
  width: 100%;
  margin-top: 14px;
  height: 46px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #50525a;
  color: #fff;
  font-weight: 800;
  font-size: 15px;
}
.cta:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
