<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';
import { fetchPostFiles } from '@/services/community/postService';
import axios from '@/services/httpRequester';
import CommentSection from '@/components/community/CommentSection.vue';
import { formatYMDHM } from '@/stores/community/date';
import ImageLightbox from '@/components/community/ImageLightbox.vue';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();

const routeId = computed(() => String(route.params.id));
const post = computed(() => store.getById(routeId.value));

const images = ref([]);
const imagesLoading = ref(false);
const imagesError = ref('');

/** ⬇️ 캐시 버스트를 1회만 생성 */
const cacheBust = ref(`?v=${Date.now()}`);

/** ⬇️ 상대경로(/static/...)를 게이트웨이 절대경로로 변환 */
const toAbsUrl = (p) => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  try {
    return new URL(p, axios.defaults.baseURL).toString();
  } catch {
    return String(p);
  }
};

async function loadImages(id) {
  imagesLoading.value = true;
  imagesError.value = '';
  images.value = [];
  try {
    const { data } = await fetchPostFiles(id);
    const list = Array.isArray(data) ? data : [];
    images.value = list.map((f) => ({
      id: f.fileId ?? f.id,
      url: toAbsUrl(f.filePath) + cacheBust.value,
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

/** 좋아요 */
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
  if (!confirm('이 게시글을 삭제할까요?')) return;
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
  const id = routeId.value;
  if (router.hasRoute('CommunityEdit')) {
    router.push({ name: 'CommunityEdit', params: { id } });
  } else {
    router.push(`/community/post/${id}/edit`);
  }
};

/** ⬇️ 이미지 개수에 따른 그리드 클래스 (1장=풀, 2장=2열, 3장 이상=3열) */
const gridClass = computed(() => {
  const n = images.value.length;
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  return 'three';
});

/** ⬇️ 라이트박스 */
const lbOpen = ref(false);
const lbStart = ref(0);
const lbImages = computed(() =>
  images.value.map((img) => ({ url: img.url, name: img.name || '' }))
);
function openFromDetail(i) {
  lbStart.value = i;
  lbOpen.value = true;
}
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

      <!-- ⬇️ 첨부 이미지 섹션 -->
      <div class="images loading" v-if="imagesLoading">
        <div class="skeleton" />
        <div class="skeleton" />
        <div class="skeleton" />
      </div>
      <div class="images err" v-else-if="imagesError">{{ imagesError }}</div>

      <div class="images grid" :class="gridClass" v-else-if="images.length">
        <div
          class="img"
          v-for="(img, i) in images"
          :key="img.id || img.url"
          @click="openFromDetail(i)"
        >
          <img
            :src="img.url"
            :alt="img.name || '첨부 이미지'"
            decoding="async"
            loading="lazy"
            @error="
              (e) => {
                console.error('[PostDetail] img load error:', img);
                // fallback: 이미지 감춤
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

      <!-- 라이트박스 -->
      <ImageLightbox
        v-model:open="lbOpen"
        :images="lbImages"
        :start="lbStart"
      />
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

/* === 이미지 레이아웃 === */
.images.grid {
  display: grid;
  gap: 8px;
  margin: 6px 0 2px;
}

/* 1장: 세로 비율 유지, 가로 꽉 */
.images.grid.one {
  grid-template-columns: 1fr;
}
.images.grid.one .img {
  padding-top: 62.5%; /* 16:10 */
}

/* 2장: 2열 */
.images.grid.two {
  grid-template-columns: repeat(2, 1fr);
}
.images.grid.two .img {
  padding-top: 100%;
}

/* 3장 이상: 3열 그리드 */
.images.grid.three {
  grid-template-columns: repeat(3, 1fr);
}
.images.grid.three .img {
  padding-top: 100%;
}

.images .img {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #eee;
  background: #f7f7f7;
  cursor: zoom-in;
}
.images .img img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 로딩 스켈레톤 */
.images.loading {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.skeleton {
  height: 110px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f2f2f2, #e9e9e9, #f2f2f2);
  background-size: 200% 100%;
  animation: shine 1.3s infinite linear;
}
@keyframes shine {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
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
