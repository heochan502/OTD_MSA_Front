<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';
import CommentSection from '@/components/community/CommentSection.vue';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();

const routeId = computed(() => String(route.params.id));
const post = computed(() => store.getById(routeId.value));

onMounted(() => {
  if (!post.value) store.loadPostDetail(routeId.value);
});

watch(routeId, (id) => {
  if (!store.getById(id)) store.loadPostDetail(id);
});

const like = async () => {
  try {
    await store.toggleLike(routeId.value);
  } catch {
    alert('좋아요 처리에 실패했습니다.');
  }
};

const myId = computed(
  () =>
    store.me?.memberNoLogin ??
    store.currentUserId ??
    store.signedUserId ??
    store.userId ??
    null
);

const myNick = computed(
  () => store.me?.nickName ?? store.me?.nickname ?? store.me?.name ?? null
);

const postOwnerId = computed(
  () =>
    post.value?.authorId ??
    post.value?.memberNoLogin ??
    post.value?.userId ??
    null
);

const postOwnerNick = computed(
  () => post.value?.author ?? post.value?.writer ?? null
);

const isOwner = computed(() => {
  if (!post.value) return false;
  if (myId.value != null && postOwnerId.value != null) {
    return String(myId.value) === String(postOwnerId.value);
  }
  if (myNick.value && postOwnerNick.value) {
    return String(myNick.value) === String(postOwnerNick.value);
  }
  return false;
});

const removePost = async () => {
  if (!post.value) return;
  const prevCategory = post.value.category || 'free';
  const ok = confirm('이 게시글을 삭제할까요?');
  if (!ok) return;

  try {
    await store.removePost(routeId.value);
    router.replace({
      name: 'CommunityCategory',
      params: { category: prevCategory },
    });
  } catch {
    alert('삭제에 실패했습니다.');
  }
};

const editPost = () => {
  router.push({ name: 'CommunityEdit', params: { id: routeId.value } });
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

        <template v-if="isOwner">
          <span class="sep">|</span>
          <button class="link otd-body-3" @click="editPost">수정하기</button>
          <span class="sep">|</span>
          <button class="link danger otd-body-3" @click="removePost">
            삭제하기
          </button>
        </template>
      </div>

      <article class="content otd-body-1">
        {{ post.content }}
      </article>

      <div class="actions otd-top-margin">
        <button class="btn-ghost otd-body-3" @click="like">
          ❤️ {{ post.likes }}
        </button>
      </div>

      <CommentSection :post-id="routeId" class="otd-top-margin" />
    </section>

    <section v-else class="detail">
      <p class="otd-body-1">글을 찾을 수 없습니다.</p>
    </section>
  </div>
</template>
