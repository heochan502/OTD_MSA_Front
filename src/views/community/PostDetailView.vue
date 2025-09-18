<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';

const route = useRoute();
const store = useCommunityStore();
const routeId = computed(() => String(route.params.id));

const post = computed(() => store.getById(routeId.value)); // 정규화된 객체( id / author / time ... )

onMounted(() => {
  if (!post.value) store.loadPostDetail(routeId.value);
});


const myComment = ref('');
const like = () => {
  if (post.value) post.value.likes++;
};
const addComment = () => {
  if (!post.value || !myComment.value.trim()) return;
  post.value.comments++;
  myComment.value = '';
};
</script>

<template>
  <div class="wrap">
    <section v-if="post" class="detail">
      <h1 class="otd-title">{{ post.title }}</h1>

      <div class="meta">
        <span class="avatar" aria-hidden="true"></span>
        <span class="otd-body-3" style="font-weight: 600">{{
          post.author
        }}</span>
        <span class="otd-body-3">· {{ post.time }}</span>
        <span class="sep">|</span>
        <button class="link danger otd-body-3">삭제하기</button>
      </div>

      <article class="content otd-body-1">{{ post.content }}</article>

      <div class="actions otd-top-margin">
        <button class="btn-ghost otd-body-3" @click="like">
          ❤️ {{ post.likes }}
        </button>
        <span class="otd-body-3">댓글 {{ post.comments }}개</span>
      </div>

      <div class="comment-box otd-top-margin">
        <input
          class="input otd-body-2"
          v-model="myComment"
          placeholder="댓글을 입력하세요"
        />
        <button class="btn btn-primary otd-button" @click="addComment">
          등록
        </button>
      </div>
    </section>

    <section v-else class="detail">
      <p class="otd-body-1">글을 찾을 수 없습니다.</p>
    </section>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eaeaea;
}
.link {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}
.link.danger {
  color: #ff595e;
}
.sep {
  color: #ddd;
  margin: 0 4px;
}
.content {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #303030;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-ghost {
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #e5e5e5;
  background: #fff;
  cursor: pointer;
}

.comment-box {
  display: flex;
  gap: 8px;
}
.input {
  flex: 1;
  height: 40px;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 0 12px;
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
