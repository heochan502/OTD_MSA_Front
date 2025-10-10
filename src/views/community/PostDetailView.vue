<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';
import { fetchPostFiles } from '@/services/community/postService';
import CommentSection from '@/components/community/CommentSection.vue';
import { formatYMDHM } from '@/stores/community/date';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();

const routeId = computed(() => String(route.params.id));
const post = computed(() => store.getById(routeId.value));

const images = ref([]);
const imagesLoading = ref(false);
const imagesError = ref('');

async function loadImages(id) {
  imagesLoading.value = true;
  imagesError.value = '';
  images.value = [];
  try {
    console.info('[PostDetail] loadImages:', id);
    const { data } = await fetchPostFiles(id);
    const list = Array.isArray(data) ? data : [];
    console.info('[PostDetail] files:', list);
    images.value = list.map((f) => ({
      id: f.fileId ?? f.id,
      url:
        typeof f.filePath === 'string' && /^https?:\/\//i.test(f.filePath)
          ? f.filePath
          : String(f.filePath ?? ''),
      name: f.fileName ?? '',
    }));
  } catch (e) {
    console.error('[PostDetail] loadImages error:', e?.response?.data || e);
    imagesError.value =
      e?.response?.data?.message || e?.message || '이미지 로딩 실패';
  } finally {
    imagesLoading.value = false;
  }
}

onMounted(async () => {
  if (!post.value) await store.loadPostDetail(routeId.value);
  await loadImages(routeId.value);
});
watch(routeId, async (id) => {
  if (!store.getById(id)) await store.loadPostDetail(id);
  await loadImages(id);
});

const like = async () => {
  try {
    await store.toggleLike(routeId.value);
  } catch {
    alert('좋아요 처리에 실패했습니다.');
  }
};

const myId = computed(() => store.currentUserId);
const postOwnerId = computed(() => post.value?.authorId);
const canEdit = computed(
  () =>
    post.value?.isMine === true ||
    (myId.value != null &&
      postOwnerId.value != null &&
      Number(myId.value) === Number(postOwnerId.value))
);

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

// PostDetailView.vue
const editPost = () => {
  const id = routeId.value;
  if (router.hasRoute('CommunityEdit')) {
    router.push({ name: 'CommunityEdit', params: { id } });
  } else {
    router.push(`/community/post/${id}/edit`);
  }
};
</script>

<template>
  <div class="wrap">
    <section v-if="post" class="detail">
      <h1 class="otd-title">{{ post.title }}</h1>

      <div class="meta">
        <div class="meta-left">
          <span class="avatar" aria-hidden="true"></span>
          <span class="otd-body-3" style="font-weight: 600">{{
            post.author
          }}</span>
          <span class="otd-body-3"
            >· {{ formatYMDHM(post.createdAt || post.time) }}</span
          >
        </div>

        <div class="meta-right" v-if="canEdit">
          <button class="action-link" @click="editPost">수정하기</button>
          <span class="dot">·</span>
          <button class="action-link danger" @click="removePost">
            삭제하기
          </button>
        </div>
      </div>

      <!-- ★ 첨부 이미지 섹션 -->
      <div class="images" v-if="imagesLoading">이미지 불러오는 중…</div>
      <div class="images err" v-else-if="imagesError">{{ imagesError }}</div>
      <div class="images grid" v-else-if="images.length">
        <div class="img" v-for="img in images" :key="img.id || img.url">
          <img
            :src="img.url"
            :alt="img.name"
            @error="
              (e) => {
                console.error('[PostDetail] img load error:', img);
                e.target.style.display = 'none';
              }
            "
          />
        </div>
      </div>

      <article class="content otd-body-1">{{ post.content }}</article>

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

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #777;
}
.meta-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #eaeaea;
}

/* ★ 첨부 이미지 스타일: 시안형 3열 그리드 */
.images.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 6px 0 2px;
}
.images .img {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  background: #f7f7f7;
}
.images .img img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.images.err {
  color: #c24040;
  font-size: 13px;
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
.action-link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  color: #7a7a7a;
}
.action-link.danger {
  color: #ff595e;
}
.dot {
  color: #cfcfcf;
}
</style>
