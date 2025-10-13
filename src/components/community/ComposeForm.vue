<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useCommunityStore } from '@/stores/community/community';
import { useAuthenticationStore } from '@/stores/user/authentication';
import {
  createPost,
  updatePost,
  uploadPostFiles,
  fetchPostFiles,
  deletePostFile,
} from '@/services/community/postService';
import ImageLightbox from '@/components/community/ImageLightbox.vue';

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
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  initial: { type: Object, default: null }, // { id/postId, title, content }
});

const emit = defineEmits(['cancel', 'submitted', 'update:category']);
const store = useCommunityStore();
const auth = useAuthenticationStore();

/** 본문 */
const title = ref('');
const content = ref('');

/** 신규로 추가할 파일들(여러 번 선택 → 누적) */
const newFiles = ref([]); // File[]
const previews = ref([]); // { key, url, name, size, lm }[]
const fileInput = ref(null);

/** 수정 모드: 서버에 이미 있는 첨부 이미지 */
const serverImages = ref([]); // [{ fileId, id, url, name }]

/** 상태 */
const submitting = ref(false);
const errorMsg = ref('');
const hydrated = ref(false);

/** 제한 */
const MAX_MB = 15;
const MAX_SIZE = MAX_MB * 1024 * 1024;
const MAX_FILES = 12;

/* ---------- 유틸 ---------- */
function getMemberId() {
  const me = auth?.state?.signedUser ?? null;
  return me?.userId ?? me?.memberNoLogin ?? 0;
}
function makeKey(f) {
  return `${f.name}__${f.size}__${f.lastModified ?? 0}`;
}

/* ---------- 초기값/첨부 로드 ---------- */
async function loadServerImages(postId) {
  try {
    const { data } = await fetchPostFiles(postId);
    const baseURL = (await import('@/services/httpRequester')).default.defaults
      .baseURL;
    const list = Array.isArray(data) ? data : [];
    serverImages.value = list.map((f) => {
      const id = f.fileId ?? f.id;
      const name = f.fileName ?? '';
      const raw = f.filePath || '';
      const url = /^https?:\/\//i.test(raw)
        ? raw
        : new URL(raw, baseURL).toString();
      return { fileId: id, id, name, url };
    });
  } catch (e) {
    console.warn(
      '[ComposeForm] fetchPostFiles failed:',
      e?.response?.data || e
    );
    serverImages.value = [];
  }
}

function applyInitial() {
  if (!props.initial || hydrated.value) return;
  title.value = props.initial.title ?? '';
  content.value = props.initial.content ?? '';
  hydrated.value = true;

  if (props.mode === 'edit') {
    const postId = Number(props.initial.postId ?? props.initial.id);
    if (postId) loadServerImages(postId);
  }
}
onMounted(applyInitial);
watch(() => props.initial, applyInitial);

/* ---------- 카테고리 ---------- */
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

/* ---------- 전송 가능 여부 ---------- */
const canSubmit = computed(
  () =>
    title.value.trim().length >= 2 &&
    content.value.trim().length >= 2 &&
    !submitting.value
);

/* ---------- 파일 추가(핵심: 누적 append) ---------- */
function addFiles(filesLike) {
  const incoming = Array.from(filesLike || []);
  if (!incoming.length) return;

  // 1) 이미지/사이즈 필터
  const imgs = incoming.filter(
    (f) => f.type?.startsWith('image/') && f.size <= MAX_SIZE
  );
  if (!imgs.length) return;

  // 2) 기존 + 신규 → map으로 dedupe
  const merged = [...newFiles.value, ...imgs];
  const map = new Map();
  for (const f of merged) map.set(makeKey(f), f);
  let deduped = Array.from(map.values());

  // 3) 최대 개수 제한
  if (deduped.length > MAX_FILES) deduped = deduped.slice(0, MAX_FILES);

  // 4) 미리보기: 새로 들어온 키만 URL 생성 (기존 것 유지!)
  const existingKeys = new Set(previews.value.map((p) => p.key));
  const nextPreviews = [...previews.value];
  for (const f of deduped) {
    const key = makeKey(f);
    if (!existingKeys.has(key)) {
      nextPreviews.push({
        key,
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
        lm: f.lastModified ?? 0,
      });
    }
  }

  newFiles.value = deduped; // ✅ 덮어쓰기 아님: dedupe된 전체 집합
  previews.value = nextPreviews; // ✅ 기존 미리보기 유지 + 새로 추가된 것만 append
}

function onFileChange(e) {
  addFiles(e.target.files);
  e.target.value = ''; // 같은 파일 재선택 허용
}

/* 드래그&드롭(선택) */
function onDrop(e) {
  e.preventDefault();
  addFiles(e.dataTransfer?.files);
}
function onDragOver(e) {
  e.preventDefault();
}

/* 신규 첨부 제거 */
function removeNewAt(i) {
  const pv = [...previews.value];
  const removed = pv[i];
  if (removed) {
    URL.revokeObjectURL(removed.url);
    pv.splice(i, 1);
    previews.value = pv;
    newFiles.value = newFiles.value.filter((f) => makeKey(f) !== removed.key);
  }
}

/* 서버 첨부 제거 (수정 모드) */
async function removeServerImage(img, postId) {
  if (!img?.fileId || !postId) return;
  const ok = confirm('이 첨부 이미지를 삭제할까요?');
  if (!ok) return;
  try {
    await deletePostFile(postId, img.fileId, getMemberId());
    serverImages.value = serverImages.value.filter(
      (x) => x.fileId !== img.fileId
    );
  } catch (e) {
    console.error(
      '[ComposeForm] deletePostFile failed:',
      e?.response?.data || e
    );
    alert('이미지 삭제에 실패했습니다.');
  }
}

/* 미리보기 URL 정리 */
function revokeAll() {
  previews.value.forEach((p) => URL.revokeObjectURL(p.url));
  previews.value = [];
}
onBeforeUnmount(revokeAll);

/* ---------- 업로드 ---------- */
async function maybeUploadFiles(postId) {
  if (!postId || newFiles.value.length === 0) return;
  await uploadPostFiles(postId, newFiles.value, getMemberId());
  newFiles.value = [];
  revokeAll();
}

/* ---------- 제출 ---------- */
async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  errorMsg.value = '';
  try {
    const myProfile = auth.state.signedUser;
    const payload = {
      categoryKey: props.category,
      title: title.value.trim(),
      content: content.value.trim(),
      nickName: myProfile.nickName,
      profile: myProfile.pic,
    };

    let postId;
    if (props.mode === 'edit' && (props.initial?.id || props.initial?.postId)) {
      postId = Number(props.initial.postId ?? props.initial.id);
      if (store?.updateExistingPost) {
        await store.updateExistingPost(postId, payload);
      } else {
        await updatePost(postId, payload);
      }
      await maybeUploadFiles(postId);
    } else {
      const created = store?.createNewPost
        ? await store.createNewPost(payload)
        : await createPost(payload);
      postId = Number(created?.postId ?? created?.id);
      if (!postId) throw new Error('생성 응답에 postId가 없습니다.');
      await maybeUploadFiles(postId);
    }

    emit('submitted', { categoryKey: props.category, postId });
  } catch (e) {
    console.error('[ComposeForm] submit failed:', e?.response?.data || e);
    errorMsg.value =
      e?.response?.data?.message ||
      e?.message ||
      '게시글 저장 중 오류가 발생했습니다.';
  } finally {
    submitting.value = false;
  }
}

/* ---------- 라이트박스 ---------- */
const lbOpen = ref(false);
const lbStart = ref(0);
const lbImages = computed(() => {
  const a = (serverImages.value || []).map((x) => ({
    url: x.url,
    name: x.name || '',
  }));
  const b = (previews.value || []).map((p) => ({
    url: p.url,
    name: p.name || '',
  }));
  return [...a, ...b];
});
function openLightboxFromServer(i) {
  lbStart.value = i;
  lbOpen.value = true;
}
function openLightboxFromNew(i) {
  const base = (serverImages.value || []).length;
  lbStart.value = base + i;
  lbOpen.value = true;
}
</script>

<template>
  <div class="form-card">
    <div class="header">
      <button class="back"></button>
      <div class="h-title">
        {{ props.mode === 'edit' ? '게시글 수정' : '게시글 작성' }}
      </div>
      <div style="width: 24px" />
    </div>

    <div class="meta">
      <button class="badge" type="button" @click="togglePicker">
        {{ categoryLabel }}
        <span class="chev">{{ pickerOpen ? '▲' : '▼' }}</span>
      </button>
      <span class="date">{{ new Date().toLocaleDateString() }}</span>
    </div>

    <v-slide-y-transition>
      <v-sheet
        v-if="pickerOpen"
        class="picker pa-2 rounded-lg mb-2"
        color="white"
        elevation="2"
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

    <!-- (수정 모드) 기존 첨부 -->
    <div v-if="props.mode === 'edit' && serverImages.length" class="block">
      <div class="label">기존 첨부 이미지</div>
      <div class="attach">
        <div
          class="thumb"
          v-for="(img, i) in serverImages"
          :key="img.fileId"
          @click="openLightboxFromServer(i)"
        >
          <img :src="img.url" :alt="img.name" />
          <button
            class="rm"
            type="button"
            aria-label="삭제"
            @click.stop="
              removeServerImage(
                img,
                Number(props.initial?.postId ?? props.initial?.id)
              )
            "
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- 새로 추가할 이미지 (여러 번 선택 → 누적) -->
    <label class="label">
      새 이미지 첨부
      <span class="hint">({{ previews.length }}/{{ MAX_FILES }})</span>
    </label>
    <div class="attach" @drop="onDrop" @dragover="onDragOver">
      <div
        class="thumb"
        v-for="(p, i) in previews"
        :key="p.key"
        @click="openLightboxFromNew(i)"
      >
        <img :src="p.url" alt="" />
        <button
          class="rm"
          type="button"
          aria-label="삭제"
          @click.stop="removeNewAt(i)"
        >
          ×
        </button>
      </div>

      <label class="uploader" aria-label="이미지 선택">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          @change="onFileChange"
        />
        <div class="plus">＋</div>
      </label>
    </div>

    <button
      class="submit"
      type="button"
      :disabled="!canSubmit || submitting"
      @click="submit"
    >
      {{ props.mode === 'edit' ? '게시글 수정' : '게시글 등록' }}
    </button>
    <button class="ghost" @click="$emit('cancel')">취소</button>

    <div v-if="errorMsg" class="err">{{ errorMsg }}</div>

    <!-- 라이트박스 -->
    <ImageLightbox v-model:open="lbOpen" :images="lbImages" :start="lbStart" />
  </div>
</template>

<style scoped>
.err {
  margin-top: 8px;
  color: #c24040;
  font-size: 13px;
}
.form-card {
  margin-left: 5px;
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
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.h-title {
  font-weight: 800;
  color: #07c5cf;
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
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
.label {
  display: block;
  margin: 8px 0 6px;
  font-weight: 700;
  color: #4b4b4b;
}
.label .hint {
  margin-left: 6px;
  font-weight: 500;
  color: #999;
  font-size: 12px;
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
.block {
  margin-top: 8px;
}

.attach {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
.thumb {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eee;
  background: #f7f7f7;
  cursor: zoom-in;
}
.thumb img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.rm {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: #0009;
  color: #fff;
  cursor: pointer;
}

.uploader {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border: 2px dashed #e8e8e8;
  border-radius: 12px;
  background: #fcfcfc;
  display: flex;
  justify-content: center;
  align-items: center;
}
.uploader input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.plus {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
