<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();

const category = route.params.category;
const title = ref('');
const content = ref('');

function submit() {
  if (!title.value.trim() || !content.value.trim()) return;
  const p = store.addPost(category, {
    title: title.value,
    content: content.value,
    author: '행키',
  });
  router.replace({ name: 'CommunityPost', params: { id: p.id } });
}
</script>

<template>
  <section class="write">
    <div class="field">
      <label>제목</label>
      <input class="input" v-model="title" placeholder="제목을 입력하세요" />
    </div>
    <div class="field">
      <label>내용</label>
      <textarea
        class="textarea"
        v-model="content"
        rows="8"
        placeholder="내용을 입력하세요"
      ></textarea>
    </div>
    <button class="btn btn-primary w-100" @click="submit">작성하기</button>
  </section>
</template>

<style scoped>
.write {
  display: flex;
  flex-direction: column;
  gap: var(--gap-md);
  padding: 0 var(--gap-lg) var(--gap-lg);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
label {
  font-size: 12px;
  color: var(--color-typo-secondary);
}
.input,
.textarea {
  border: var(--border-1);
  border-radius: 12px;
  padding: 12px;
  font-size: var(--fs-body-2);
  background: #fff;
}
.w-100 {
  width: 100%;
}
.btn {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}
.btn-primary {
  background: var(--color-primary);
  color: #fff;
}
</style>
