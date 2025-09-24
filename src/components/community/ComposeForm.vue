<script setup>
import { ref, computed } from 'vue';
import { useCommunityStore } from '@/stores/community/community';

const props = defineProps({
  category: { type: String, required: true },
  categories: {
    type: Array,
    default: () => [
      { key: 'free', label: '자유수다' },
      { key: 'diet', label: '다이어트' },
      { key: 'work', label: '운동' },
      { key: 'love', label: '연애' },
    ],
  },
});
const emit = defineEmits(['cancel', 'submitted', 'update:category']);
const store = useCommunityStore();

const title = ref('');
const content = ref('');
const files = ref([]);

const canSubmit = computed(
  () => title.value.trim().length >= 2 && content.value.trim().length >= 10
);

const pickerOpen = ref(false);
const categoryLabel = computed(
  () =>
    props.categories.find((c) => c.key === props.category)?.label ?? '카테고리'
);
function togglePicker() {
  pickerOpen.value = !pickerOpen.value;
}
function chooseCategory(key) {
  emit('update:category', key);
  pickerOpen.value = false;
}

function onFileChange(e) {
  files.value = Array.from(e.target.files || []);
}

async function submit() {
  // 실사용 시 FormData 구성/전송
  // const fd = new FormData()
  // fd.append('category', props.category)
  // fd.append('title', title.value)
  // fd.append('content', content.value)
  // files.value.forEach(f => fd.append('files', f))
  // await store.createNewPost(fd)
  emit('submitted');
}
</script>

<template>
  <div class="form-card">
    <div class="header">
      <button class="back" @click="emit('cancel')" aria-label="닫기">‹</button>
      <div class="h-title">게시글 작성</div>
      <div style="width: 24px" />
    </div>

    <div class="meta">
      <!-- 배지 클릭 → 아래로 토글 -->
      <button class="badge" type="button" @click="togglePicker">
        {{ categoryLabel }}
        <span class="chev">{{ pickerOpen ? '▲' : '▼' }}</span>
      </button>
      <span class="date">{{ new Date().toLocaleDateString() }}</span>
    </div>

    <!-- Vuetify 스타일: slide-y-transition + chip들 -->
    <v-slide-y-transition>
      <v-sheet
        v-if="pickerOpen"
        class="picker pa-2 rounded-lg mb-2"
        color="white"
        elevation="2"
        border
      >
        <div class="chips">
          <v-chip
            v-for="c in props.categories"
            :key="c.key"
            class="ma-1"
            variant="elevated"
            :color="c.key === props.category ? 'teal' : undefined"
            :class="c.key === props.category ? 'text-white' : ''"
            @click="chooseCategory(c.key)"
          >
            {{ c.label }}
          </v-chip>
        </div>
      </v-sheet>
    </v-slide-y-transition>

    <label class="label">제목</label>
    <input class="input" v-model="title" placeholder="제목을 입력해 주세요" />

    <label class="label">내용</label>
    <textarea
      class="textarea"
      v-model="content"
      rows="6"
      maxlength="2000"
      placeholder="내용을 입력해 주세요"
    />

    <label class="label">이미지 첨부</label>
    <div class="uploader">
      <input type="file" multiple accept="image/*" @change="onFileChange" />
      <div class="plus">＋</div>
    </div>

    <button class="submit" :disabled="!canSubmit" @click="submit">
      게시글 등록
    </button>
    <button class="ghost" @click="emit('cancel')">취소</button>
  </div>
</template>

<style scoped>
.form-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.18s ease;
  box-sizing: border-box;
}
@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 헤더 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.back {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
}
.h-title {
  font-weight: 800;
  color: #07c5cf;
}

/* 메타/배지 */
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0 10px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f2fbfc;
  color: #07c5cf;
  border: 1px solid #c9f0f3;
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}
.badge .chev {
  font-size: 10px;
  color: #63cfd6;
}
.date {
  color: #7a7a7a;
  font-size: 12px;
}

/* Vuetify 토글 영역 */
.picker {
  /* v-sheet */
}
.chips {
  display: flex;
  flex-wrap: wrap;
}

/* 입력 */
.label {
  display: block;
  margin: 8px 0 6px;
  font-weight: 700;
  color: #4b4b4b;
}
.input,
.textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  background: #f9f9f9;
  box-sizing: border-box;
}
.textarea {
  resize: vertical;
}

/* 업로더 */
.uploader {
  position: relative;
  height: 84px;
  border: 2px dashed #e8e8e8;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  background: #fcfcfc;
}
.uploader input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.plus {
  font-size: 32px;
  color: #bdbdbd;
}

/* 버튼 */
.submit {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: #ffd400;
  color: #333;
  font-weight: 800;
  cursor: pointer;
}
.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ghost {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border-radius: 12px;
  background: #f2f2f2;
  border: 1px solid #eaeaea;
  font-weight: 700;
  cursor: pointer;
}
</style>
