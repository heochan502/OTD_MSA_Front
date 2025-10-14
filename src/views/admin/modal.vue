<script setup>

</script>

<template>

</template>

<style lang="scss" scoped>
// 관리 모달 카드
.admin-dialog {
  border-radius: 15px !important;
  background-color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}
// 버튼 영역
.modal-btn-area {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 4px 4px 0 !important;
  margin-top: 4px !important;
}

// 버튼 공통
.btn-no,
.btn-yes {
  min-width: 72px;
  height: 38px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1;
  text-transform: none;
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

// 취소 버튼
.btn-no {
  background-color: #eee !important;
  color: #555 !important;
  border-radius: 10px;
}
.btn-no:hover {
  background-color: #dcdcdc !important;
  transform: scale(1.03);
}

// 저장 버튼
.btn-yes {
  background-color: #5ee6eb !important;
  color: #fff !important;
  border-radius: 10px;
}
.btn-yes:hover {
  background-color: #3dd4da !important;
  box-shadow: 0 3px 10px rgba(61, 212, 218, 0.35);
  transform: scale(1.03);
}
</style>