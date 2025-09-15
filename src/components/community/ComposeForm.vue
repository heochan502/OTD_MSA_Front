<!-- src/components/community/ComposeForm.vue -->
<script setup>
import { ref, computed } from 'vue';
import { useCommunityStore } from '@/stores/community/community';

const props = defineProps({
  category: { type: String, required: true },
});
const emit = defineEmits(['cancel', 'submitted']);
const store = useCommunityStore();

const categoryLabel = computed(() => {
  return (
    { free: '자유수다', diet: '다이어트', work: '운동', love: '연애' }[
      props.category
    ] ?? '카테고리'
  );
});

const title = ref('');
const content = ref('');
const files = ref([]); // FileList 대용

const canSubmit = computed(
  () => title.value.trim().length >= 2 && content.value.trim().length >= 10
);

async function submit() {
  // 실제 업로드 시 FormData 구성
  // 여기서는 더미로 store.createNewPost 호출 대신 성공 이벤트만 발생
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
      <span class="badge">{{ categoryLabel }}</span>
      <span class="date">{{ new Date().toLocaleDateString() }}</span>
    </div>

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
      <input
        type="file"
        multiple
        accept="image/*"
        @change="(e) => (files = Array.from(e.target.files || []))"
      />
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

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0 14px;
}
.badge {
  background: #f2fbfc;
  color: #07c5cf;
  border: 1px solid #c9f0f3;
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 700;
}
.date {
  color: #7a7a7a;
  font-size: 12px;
}

.label {
  display: block;
  margin: 8px 0 6px;
  font-weight: 700;
  color: #4b4b4b;
}
.input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  background: #f9f9f9;
}
.textarea {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e7e7e7;
  background: #f9f9f9;
  resize: vertical;
}

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
