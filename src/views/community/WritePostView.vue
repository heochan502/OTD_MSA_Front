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
  const p = store.addPost?.(category, {
    title: title.value,
    content: content.value,
    author: '행키',
  }) ?? {
    id: Date.now(),
    title: title.value,
    content: content.value,
    author: '행키',
    time: new Date().toISOString(),
    likes: 0,
    comments: 0,
  };
  router.replace({ name: 'CommunityPost', params: { id: p.id } });
}
</script>

<template>
  <div class="wrap">
    <section class="write">
      <div class="otd-category">게시글 작성</div>

      <div class="field otd-top-margin">
        <label class="otd-body-3">제목</label>
        <input
          class="input otd-body-2"
          v-model="title"
          placeholder="제목을 입력하세요"
        />
      </div>

      <div class="field">
        <label class="otd-body-3">내용</label>
        <textarea
          class="textarea otd-body-2"
          v-model="content"
          rows="8"
          placeholder="내용을 입력하세요"
        ></textarea>
      </div>

      <button class="btn btn-primary otd-button w-100" @click="submit">
        작성하기
      </button>
    </section>
  </div>
</template>

<style scoped>
.write {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.input,
.textarea {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px;
  background: #fff;
}
.w-100 {
  width: 100%;
}
.btn {
  height: 40px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
}
.btn-primary {
  background: #00d5df;
  color: #fff;
}
</style>
