<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';
import { fetchPostFiles } from '@/services/community/postService';
import axios from '@/services/httpRequester';
import CommentSection from '@/components/community/CommentSection.vue';
import { formatYMDHM } from '@/stores/community/date';
import ImageLightbox from '@/components/community/ImageLightbox.vue';
import { useAuthenticationStore } from '@/stores/user/authentication';

const route = useRoute();
const router = useRouter();
const store = useCommunityStore();
useAuthenticationStore();

const routeId = computed(() => String(route.params.id));
const post = computed(() => store.getById(routeId.value));

const images = ref([]);
const imagesLoading = ref(false);
const imagesError = ref('');

const DEFAULT_AVATAR =
  import.meta.env.BASE_URL + 'image/main/default-profile.png';

const cacheBust = ref(`?v=${Date.now()}`);

const API_BASE =
  (import.meta.env.VITE_BASE_URL ).replace(/\/$/, '');

function toAbsUrl(p) {
  if (!p) return '';
  if (p.startsWith('/otd/image/main/')) {
    return import.meta.env.BASE_URL + p.replace(/^\//, '');
  }
  if (!p) return ''; 
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith('/static/')) return `${API_BASE}${p}`;
  if (p.startsWith('static/')) return `${API_BASE}/${p}`;

  try {
    return new URL(p, `${API_BASE}/`).toString();
  } catch {
    return p.startsWith('/')
      ? p
      : import.meta.env.BASE_URL + p.replace(/^\.?\//, '');
  }
}

const avatarUrl = computed(() => {
  const p = post.value;
  const raw =
    p?.avatar ||
    p?.profile ||
    p?.profilePath ||
    p?.profileUrl ||
    p?.profile_url ||
    p?.profileImage ||
    p?.profileImg ||
    p?.profile_img ||
    p?.profile_img_path ||
    p?.memberImg ||
    p?.member_img ||
    p?.writer?.memberImg ||
    p?.writer?.member_img ||
    '';
  const url = raw ? toAbsUrl(raw) : DEFAULT_AVATAR;
  return url || DEFAULT_AVATAR;
});

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

const modalOpen = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const modalMode = ref('info');
let onConfirm = null;

function showInfo(msg, title = '안내') {
  modalTitle.value = title;
  modalMessage.value = msg;
  modalMode.value = 'info';
  modalOpen.value = true;
  onConfirm = null;
}
function showConfirm(msg, onYes, title = '확인') {
  modalTitle.value = title;
  modalMessage.value = msg;
  modalMode.value = 'confirm';
  modalOpen.value = true;
  onConfirm = onYes;
}
function handleConfirm() {
  const fn = onConfirm;
  modalOpen.value = false;
  if (fn) fn();
}
function handleCancel() {
  modalOpen.value = false;
  onConfirm = null;
}

const like = async () => {
  try {
    await store.toggleLike(routeId.value);
  } catch {
    showInfo('좋아요 처리에 실패했습니다.', '오류');
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

  showConfirm('이 게시글을 삭제할까요?', async () => {
    try {
      await store.removePost(routeId.value);

      // 삭제 성공 후 커뮤니티 메인으로 이동
      if (router.hasRoute('CommunityView')) {
        router.replace({ name: 'CommunityView' });
      } else {
        // 혹시 라우트 이름이 다르면 경로 기준으로 폴백
        router.replace('/community');
      }
    } catch {
      showInfo('삭제에 실패했습니다.', '오류');
    }
  });
};

const editPost = () => {
  const id = routeId.value;
  if (router.hasRoute('CommunityEdit')) {
    router.push({ name: 'CommunityEdit', params: { id } });
  } else {
    router.push(`/community/post/${id}/edit`);
  }
};

const gridClass = computed(() => {
  const n = images.value.length;
  if (n === 1) return 'one';
  if (n === 2) return 'two';
  return 'three';
});

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
          <div class="avatar">
            <img
              :src="avatarUrl + cacheBust"
              alt=""
              @error="(e) => (e.target.src = DEFAULT_AVATAR)"
            />
          </div>
          <span class="otd-body-3" style="font-weight: 600">
            {{ post.author }}
          </span>
          <span class="otd-body-3">
            · {{ formatYMDHM(post.createdAt || post.time) }}
          </span>
        </div>

        <div class="meta-right" v-if="canEdit">
          <button class="action-link" @click="editPost">수정하기</button>
          <span class="dot">·</span>
          <button class="action-link danger" @click="removePost">
            삭제하기
          </button>
        </div>
      </div>

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
            @error="(e) => (e.target.style.display = 'none')"
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

      <ImageLightbox
        v-model:open="lbOpen"
        :images="lbImages"
        :start="lbStart"
      />
    </section>

    <section v-else class="detail">
      <p class="otd-body-1">글을 찾을 수 없습니다.</p>
    </section>

    <teleport to="body">
      <div v-if="modalOpen" class="m-backdrop" @click="handleCancel">
        <div class="m-panel" @click.stop>
          <div class="m-title">{{ modalTitle }}</div>
          <div class="m-body">{{ modalMessage }}</div>
          <div class="m-actions">
            <button
              v-if="modalMode === 'confirm'"
              class="m-btn ghost"
              @click="handleCancel"
            >
              취소
            </button>
            <button class="m-btn primary" @click="handleConfirm">확인</button>
          </div>
        </div>
      </div>
    </teleport>
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
  overflow: hidden;
  background: #f1f1f1;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.images.grid {
  display: grid;
  gap: 8px;
  margin: 6px 0 2px;
}
.images.grid.one {
  grid-template-columns: 1fr;
}
.images.grid.one .img {
  padding-top: 62.5%;
}
.images.grid.two {
  grid-template-columns: repeat(2, 1fr);
}
.images.grid.two .img {
  padding-top: 100%;
}
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
.m-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.45);
  display: grid;
  place-items: center;
  z-index: 9999;
}
.m-panel {
  width: min(92vw, 360px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  padding: 16px;
  display: grid;
  gap: 10px;
}
.m-title {
  font-weight: 800;
  color: #0f172a;
  font-size: 16px;
}
.m-body {
  color: #475569;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.m-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.m-btn {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
}
.m-btn.primary {
  background: #06b6d4;
  color: #fff;
  border-color: #06b6d4;
}
.m-btn.ghost {
  background: #f8fafc;
}
</style>
