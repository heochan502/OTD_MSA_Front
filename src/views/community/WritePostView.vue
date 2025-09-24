<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCommunityStore } from '@/stores/community/community';

const router = useRouter();
const route = useRoute();
const store = useCommunityStore();

const CATEGORY_LIST = [
  { key: 'free', label: '자유 수다', icon: 'mdi-message-text' },
  { key: 'diet', label: '다이어트', icon: 'mdi-food-apple' },
  { key: 'work', label: '운동', icon: 'mdi-dumbbell' },
  { key: 'love', label: '연애', icon: 'mdi-heart' },
];

const category = ref(
  typeof route.params.category === 'string' ? route.params.category : 'free'
);
const catOpen = ref(false);
const title = ref('');
const content = ref('');
const maxLen = 2000;

const files = ref([]);
const previews = ref([]);

function toggleCat() {
  catOpen.value = !catOpen.value;
}
function chooseCat(k) {
  category.value = k;
  catOpen.value = false;
}

function onPickFiles(e) {
  const list = Array.from(e.target.files || []);
  files.value = list;
  previews.value = [];
  list.forEach((f) => {
    const reader = new FileReader();
    reader.onload = (ev) =>
      previews.value.push({ name: f.name, url: ev.target.result });
    reader.readAsDataURL(f);
  });
}

function removePreview(idx) {
  previews.value.splice(idx, 1);
  files.value.splice(idx, 1);
}

const canSubmit = computed(
  () => title.value.trim().length > 0 && content.value.trim().length > 0
);

async function submit() {
  const fd = new FormData();
  fd.append('category', category.value);
  fd.append('title', title.value.trim());
  fd.append('content', content.value.trim());
  files.value.forEach((f) => fd.append('files', f));
  try {
    if (store?.createPost) {
      await store.createPost(fd);
    }
    router.back();
  } catch (e) {}
}

function cancel() {
  router.back();
}

onMounted(() => window.scrollTo({ top: 0, behavior: 'auto' }));
</script>

<template>
  <div class="wp-wrap">
    <div class="scrim"></div>
    <section class="panel">
      <div class="header">
        <v-btn icon variant="text" @click="router.back()">
          <v-icon icon="mdi-chevron-left" />
        </v-btn>
        <div class="title">게시글 작성</div>
        <div class="date">{{ new Date().toLocaleDateString() }}</div>
      </div>

      <div class="row">
        <v-btn
          class="rounded-pill"
          variant="tonal"
          color="teal"
          :append-icon="catOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="toggleCat"
        >
          {{
            CATEGORY_LIST.find((c) => c.key === category)?.label ?? '테마 선택'
          }}
        </v-btn>
      </div>

      <v-slide-y-transition>
        <v-sheet
          v-if="catOpen"
          class="mt-3 pa-2 rounded-lg"
          elevation="2"
          color="white"
          border
        >
          <div class="chips">
            <v-chip
              v-for="c in CATEGORY_LIST"
              :key="c.key"
              class="ma-1"
              variant="elevated"
              :color="c.key === category ? 'teal' : undefined"
              :class="c.key === category ? 'text-white' : ''"
              @click="chooseCat(c.key)"
            >
              <v-icon :icon="c.icon" start></v-icon>{{ c.label }}
            </v-chip>
          </div>
        </v-sheet>
      </v-slide-y-transition>

      <div class="label">제목</div>
      <v-text-field
        v-model="title"
        variant="solo"
        density="comfortable"
        flat
        placeholder="제목을 입력해 주세요"
        class="mb-3"
      />

      <div class="label">내용</div>
      <v-textarea
        v-model="content"
        variant="solo"
        density="comfortable"
        flat
        auto-grow
        :counter="maxLen"
        :maxlength="maxLen"
        placeholder="내용을 입력해 주세요"
        class="mb-3"
      />

      <div class="label">이미지 첨부</div>
      <div class="uploader">
        <div class="thumbs" v-if="previews.length">
          <div v-for="(p, i) in previews" :key="p.url" class="thumb">
            <img :src="p.url" :alt="p.name" />
            <button class="x" @click="removePreview(i)">
              <v-icon icon="mdi-close" size="16" />
            </button>
          </div>
        </div>
        <label class="pick">
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            @change="onPickFiles"
          />
          <v-icon icon="mdi-plus" size="28" />
        </label>
      </div>

      <v-btn
        :disabled="!canSubmit"
        block
        color="yellow-darken-1"
        class="mb-3 text-black"
        size="large"
        rounded="lg"
        @click="submit"
      >
        게시글 등록
      </v-btn>
      <v-btn
        block
        variant="flat"
        color="#f3f5f8"
        class="text-medium-emphasis"
        size="large"
        rounded="lg"
        @click="cancel"
      >
        취소
      </v-btn>
    </section>
  </div>
</template>

<style scoped>
.wp-wrap {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: 14px;
  box-sizing: border-box;
}

.scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1;
}

.panel {
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 18px;
  border: 1px solid #eef1f4;
  box-shadow: 0 20px 60px rgba(17, 24, 39, 0.18);
  padding: 14px;
}

.header {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.title {
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #10aebc;
}
.date {
  font-size: 12px;
  color: #6b7280;
}

.row {
  margin: 8px 0 6px;
}

.label {
  margin: 10px 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.chips {
  display: flex;
  flex-wrap: wrap;
}

.uploader {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
.thumbs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.thumb {
  position: relative;
  width: 86px;
  height: 86px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.12);
  border: 1px solid #eef1f4;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb .x {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  cursor: pointer;
}
.pick {
  height: 110px;
  border: 2px dashed #e8ebef;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #9aa3af;
  background: #fbfcfd;
}
</style>
