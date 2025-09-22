<script setup>
import { ref } from 'vue';
import ComposeForm from '@/components/community/ComposeForm.vue';

/** 현재 글쓰기 모달(좌측으로 치우치던 그 모달)을 제어하는 플래그 */
const showWriteModal = ref(false); // 기존에 쓰던 모달 오픈/닫기 변수 (있다면 유지)

/** 테마 선택 오버레이 제어 */
const showOverlay = ref(false);
const composeStep = ref('pick'); // 'pick' | 'form'
const selectedCategory = ref('love'); // 초기값(현재 카테고리) 필요 시 바꿔줘

// 카테고리 라벨 클릭 → 테마 선택 오버레이 띄우기
function openThemePicker() {
  showOverlay.value = true;
  composeStep.value = 'pick';
}
function closeOverlay() {
  showOverlay.value = false;
  composeStep.value = 'pick';
  // 선택값을 초기화하려면 여기서 selectedCategory.value = '' 처리
}
function onPickCategory(key) {
  selectedCategory.value = key;
  composeStep.value = 'form';
}
function onSubmitSuccess() {
  // 작성 완료 시 오버레이 닫고, 필요하면 목록/상세 갱신
  closeOverlay();
}

/** 기존 모달을 여닫던 로직이 있다면 아래처럼 연결 */
function openWriteModal() {
  showWriteModal.value = true;
}
function closeWriteModal() {
  showWriteModal.value = false;
}
</script>

<template>
  <div class="pv-wrap">
    <!-- 상단 바 / 제목 -->
    <header class="pv-header">
      <button class="back-btn" aria-label="뒤로가기">‹</button>

      <h2 class="pv-title">게시글 작성</h2>

      <!-- ✅ 왼쪽 위(혹은 헤더 내) 카테고리 라벨: 클릭 시 테마 선택 오버레이 -->
      <button class="pv-chip" @click="openThemePicker">연애</button>

      <span class="pv-date">2025. 9. 22.</span>
    </header>

    <!-- ===== 기존: 좌측으로 치우치던 모달 ===== -->
    <!-- 중앙 정렬을 위해 .modal-center-container + .modal-sheet 구조로 교체/감싸기 -->
    <div v-if="showWriteModal" class="modal-center-container">
      <div class="modal-sheet">
        <!-- 🧩 여기에 기존 '제목/내용/이미지첨부/등록/취소' 폼 그대로 -->
        <!-- 예시만 둠 -->
        <div class="field">
          <label>제목</label>
          <input class="input" placeholder="제목을 입력해 주세요" />
        </div>

        <div class="field">
          <label>내용</label>
          <textarea
            class="textarea"
            placeholder="내용을 입력해 주세요"
          ></textarea>
        </div>

        <div class="field">
          <label>이미지 첨부</label>
          <div class="uploader-dash"><span>＋</span></div>
        </div>

        <button class="primary-btn">게시글 등록</button>
        <button class="ghost-btn" @click="closeWriteModal">취소</button>
      </div>
    </div>

    <!-- ===== 새로 추가: 테마 선택 오버레이 ===== -->
    <div v-if="showOverlay" class="overlay-full" @click.self="closeOverlay">
      <!-- 1) 테마 고르기 단계 -->
      <div v-if="composeStep === 'pick'" class="picker-floating">
        <button class="pill" @click="onPickCategory('free')">자유수다</button>
        <button class="pill" @click="onPickCategory('diet')">다이어트</button>
        <button class="pill" @click="onPickCategory('work')">운동</button>
        <button class="pill" @click="onPickCategory('love')">연애</button>
      </div>

      <!-- 2) 폼 단계: 선택한 테마로 ComposeForm 띄움 -->
      <ComposeForm
        v-if="composeStep === 'form'"
        :category="selectedCategory"
        @cancel="closeOverlay"
        @submitted="onSubmitSuccess"
      />
    </div>
  </div>
</template>

<style scoped>
/* 페이지 기본 래퍼 (메인과 동일 톤) */
.pv-wrap {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 14px;
  background: #f4f6f8;
  min-height: 100%;
  box-sizing: border-box;
}

/* 헤더 라인 */
.pv-header {
  position: relative;
  display: grid;
  grid-template-columns: 32px 1fr auto;
  grid-template-areas:
    'back title date'
    'chip chip chip';
  align-items: center;
  gap: 8px 10px;
  margin-bottom: 10px;
}
.back-btn {
  grid-area: back;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 22px;
}
.pv-title {
  grid-area: title;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  color: #10aebc;
}
.pv-date {
  grid-area: date;
  font-size: 12px;
  color: #6b7280;
}
.pv-chip {
  grid-area: chip;
  justify-self: start;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #e8ebef;
  background: #fff;
  color: #4b5563;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(17, 24, 39, 0.05);
}

/* ========== ① 모달 중앙 정렬(치우침 교정) ========== */
/* 화면 전체를 덮는 고정 컨테이너 */
.modal-center-container {
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0 */
  display: grid;
  place-items: center; /* 중앙 정렬 핵심 */
  background: rgba(0, 0, 0, 0.35); /* 약한 딤 */
  backdrop-filter: blur(2px);
  z-index: 1000;
  padding: 20px; /* 모바일 안전 패딩 */
  box-sizing: border-box;
}
/* 가운데 카드(작성 폼 본체) */
.modal-sheet {
  width: min(92vw, 380px);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(17, 24, 39, 0.25);
  border: 1px solid #eef1f4;
  padding: 14px;
}

/* 폼 요소 예시 톤(필요 시 기존 클래스에만 적용) */
.field {
  margin-bottom: 12px;
}
.input,
.textarea {
  width: 100%;
  border: 1px solid #e8ebef;
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(17, 24, 39, 0.05) inset;
}
.textarea {
  min-height: 120px;
  resize: vertical;
}
.uploader-dash {
  height: 100px;
  border: 2px dashed #e8ebef;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #9aa3af;
  background: #fbfcfd;
}

.primary-btn {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: none;
  background: #ffe073;
  color: #293241;
  font-weight: 700;
  margin-top: 8px;
}
.ghost-btn {
  width: 100%;
  height: 44px;
  border-radius: 10px;
  border: 1px solid #e8ebef;
  background: #f3f5f8;
  color: #4b5563;
  margin-top: 8px;
}

/* ========== ② 테마 선택 오버레이(메인과 동일 UX) ========== */
.overlay-full {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  z-index: 1100; /* 모달보다 위 */
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 96px;
  padding-right: 12px;
}

/* 테마 선택 버튼(공중에 둥둥) */
.picker-floating {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pill {
  min-width: 96px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  font-weight: 700;
  color: #333;
  cursor: pointer;
  text-align: center;
}
</style>
