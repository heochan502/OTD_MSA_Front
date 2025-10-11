<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { termsService } from '@/services/user/termsService';
import AlertModal from '@/components/user/Modal.vue';

const router = useRouter();
const basePath = import.meta.env.VITE_BASE_URL;

const emit = defineEmits(['complete']);

// 모달 상태
const isOpen = ref(true);
const currentStep = ref(1);
const isLoading = ref(false);

// 약관 데이터
const termsData = ref([]);
const termsMap = ref(new Map());

// 약관 동의
const agreements = ref({
  all: false,
  agreedTermsIds: []
});

// 설문조사
const surveyAnswers = ref({
  exercise: null,
  duration: null,
  activity: null,
  fitness: null
});

// 약관 모달
const showTermsModal = ref('');
const modalContent = ref({});

// Alert 모달
const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info',
  onConfirm: null,
  onCancel: null
});

const showModal = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
  modalState.value = {
    show: true,
    title,
    message,
    type,
    onConfirm,
    onCancel
  };
};

const closeModal = () => {
  modalState.value.show = false;
};

const handleModalConfirm = () => {
  if (modalState.value.onConfirm) {
    modalState.value.onConfirm();
  }
  closeModal();
};

const handleModalCancel = () => {
  if (modalState.value.onCancel) {
    modalState.value.onCancel();
  }
  closeModal();
};

const surveyQuestions = [
  {
    id: 'exercise',
    question: '땀흘릴 정도의 운동을 얼마나 하시나요?',
    options: [
      { value: 'notatall', label: '전혀안함' },
      { value: '1~2weeks', label: '주 1~2회' },
      { value: '3~4weeks', label: '주 3~4회' },
      { value: 'almost', label: '거의 매일' }
    ]
  },
  {
    id: 'duration',
    question: '운동 한번에 어느 정도의 시간을 사용하시나요?',
    options: [
      { value: '30minutesless', label: '30분 이하' },
      { value: '1hour', label: '30~1시간' },
      { value: '1hour30', label: '1시간~1시간 반' },
      { value: '2hour', label: '2시간 이상' }
    ]
  },
  {
    id: 'activity',
    question: '활동량이 어떻게 되시나요?',
    options: [
      { value: 'sittingdown', label: '대부분 앉아있음' },
      { value: 'sometimes', label: '가끔 움직임' },
      { value: 'often', label: '자주 움직임' },
      { value: 'allday', label: '하루종일 활동적' }
    ]
  },
  {
    id: 'fitness',
    question: '스스로 생각하는 체력의 난이도는 어떠신가요?',
    options: [
      { value: 'totalnooby', label: '왕초보' },
      { value: 'nooby', label: '초보' },
      { value: 'heavy', label: '중수' },
      { value: 'master', label: '고수' }
    ]
  }
];

onMounted(async () => {
  try {
    const response = await termsService.getActiveTerms();
    if (response.success) {
      termsData.value = response.result;
      termsData.value.forEach(term => {
        termsMap.value.set(term.type, term);
      });
    }
  } catch (error) {
    console.error('약관 불러오기 실패:', error);
    showModal('오류', '약관을 불러오는데 실패했습니다.', 'error');
  }
});

// 약관 동의 처리
const handleAgreementChange = (termsId) => {
  if (termsId === 'all') {
    const newValue = !agreements.value.all;
    agreements.value.all = newValue;
    
    if (newValue) {
      agreements.value.agreedTermsIds = termsData.value.map(t => t.termsId);
    } else {
      agreements.value.agreedTermsIds = [];
    }
  } else {
    const index = agreements.value.agreedTermsIds.indexOf(termsId);
    
    if (index > -1) {
      agreements.value.agreedTermsIds.splice(index, 1);
    } else {
      agreements.value.agreedTermsIds.push(termsId);
    }
    
    agreements.value.all = 
      agreements.value.agreedTermsIds.length === termsData.value.length;
  }
};

// 약관 체크 여부
const isTermsChecked = (termsId) => {
  return agreements.value.agreedTermsIds.includes(termsId);
};

// 약관 내용 보기
const loadTermsContent = (type) => {
  const term = termsMap.value.get(type);
  if (term) {
    modalContent.value = {
      title: term.title,
      content: term.content
    };
    showTermsModal.value = type;
  }
};

// 설문 옵션 선택
const selectOption = (questionId, optionValue) => {
  surveyAnswers.value[questionId] = optionValue;
};

// 설문 완료 여부
const isSurveyCompleted = computed(() => {
  return Object.values(surveyAnswers.value).every(answer => answer !== null);
});

// 설문 점수 계산
const calculateSurveyScore = computed(() => {
  let totalScore = 0;
  Object.values(surveyAnswers.value).forEach(answer => {
    if (answer) {
      const questionOptions = surveyQuestions.find(q =>
        q.options.some(opt => opt.value === answer)
      )?.options || [];

      const optionIndex = questionOptions.findIndex(opt => opt.value === answer);
      if (optionIndex !== -1) {
        totalScore += optionIndex;
      }
    }
  });
  return totalScore;
});

// 다음 단계 진행 가능 여부
const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      const requiredTerms = termsData.value.filter(t => t.isRequired);
      return requiredTerms.every(term => 
        agreements.value.agreedTermsIds.includes(term.termsId)
      );
    case 2:
      return isSurveyCompleted.value;
    default:
      return false;
  }
});

// 다음/완료 버튼
const handleNext = async () => {
  if (currentStep.value === 1) {
    currentStep.value = 2;
  } else if (currentStep.value === 2) {
    await handleComplete();
  }
};

// 이전 버튼
const handlePrevious = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 온보딩 완료 처리
const handleComplete = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`${basePath}/api/v1/auth/social/complete-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        surveyAnswers: calculateSurveyScore.value,
        agreedTermsIds: agreements.value.agreedTermsIds
      })
    });

    if (response.ok) {
      showModal(
        '가입 완료',
        '환영합니다! 회원가입이 완료되었습니다.',
        'success',
        () => {
          isOpen.value = false;
          emit('complete');
          window.location.reload();
        }
      );
    } else {
      const error = await response.json();
      showModal('가입 실패', error.message || '온보딩 처리 중 오류가 발생했습니다.', 'error');
    }
  } catch (error) {
    console.error('온보딩 완료 오류:', error);
    showModal('네트워크 오류', '네트워크 오류가 발생했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

// 모달 닫기 방지 (온보딩 필수)
const handleClose = () => {
  showModal(
    '온보딩 필요',
    '서비스를 이용하려면 온보딩을 완료해야 합니다.',
    'warning'
  );
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-container" @click.stop>
      <!-- 헤더 -->
      <div class="modal-header">
        <div class="header-content">
          <h2 class="header-title">환영합니다! 🎉</h2>
          <p class="header-subtitle">시작하기 전에 간단한 설정이 필요합니다</p>
        </div>
        
        <!-- 진행 상태 -->
        <div class="progress-dots">
          <div :class="['progress-dot', { active: currentStep >= 1 }]"></div>
          <div :class="['progress-dot', { active: currentStep >= 2 }]"></div>
        </div>
      </div>

      <!-- 내용 -->
      <div class="modal-content">
        <!-- Step 1: 약관 동의 -->
        <div v-if="currentStep === 1" class="step-container">
          <h3 class="step-title">서비스 이용 약관</h3>
          
          <!-- 전체 동의 -->
          <div class="agreement-all">
            <label class="checkbox-container">
              <input
                type="checkbox"
                :checked="agreements.all"
                @change="handleAgreementChange('all')"
                class="checkbox"
              />
              <span class="checkbox-text font-medium">약관 전체동의</span>
            </label>
          </div>

          <!-- 개별 약관 -->
          <div class="agreement-list">
            <div 
              v-for="term in termsData" 
              :key="term.termsId"
              class="agreement-item"
            >
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  :checked="isTermsChecked(term.termsId)"
                  @change="handleAgreementChange(term.termsId)"
                  class="checkbox"
                />
                <span>
                  <span :class="term.isRequired ? 'required-badge' : 'optional-badge'">
                    {{ term.isRequired ? '(필수)' : '(선택)' }}
                  </span>
                  {{ term.title }}
                </span>
              </label>
              <button
                @click="loadTermsContent(term.type)"
                class="view-button"
                type="button"
              >
                보기
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: 설문조사 -->
        <div v-if="currentStep === 2" class="step-container">
          <h3 class="step-title">간단한 설문조사</h3>
          <p class="step-description">맞춤형 운동을 추천해드리기 위한 질문입니다</p>
          
          <div class="questions-container">
            <div
              v-for="(question, index) in surveyQuestions"
              :key="question.id"
              class="question-block"
            >
              <div class="question-header">
                <span class="question-number">Q{{ index + 1 }}</span>
                <h4 class="question-text">{{ question.question }}</h4>
              </div>

              <div class="options-grid">
                <button
                  v-for="option in question.options"
                  :key="option.value"
                  @click="selectOption(question.id, option.value)"
                  :class="[
                    'option-button',
                    { selected: surveyAnswers[question.id] === option.value }
                  ]"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="modal-footer">
        <button
          v-if="currentStep > 1"
          @click="handlePrevious"
          class="btn btn-outline"
        >
          이전
        </button>
        
        <button
          @click="handleNext"
          :disabled="!canProceedToNext || isLoading"
          class="btn btn-primary"
          :class="{ 'full-width': currentStep === 1 }"
        >
          {{ isLoading ? '처리 중...' : currentStep === 2 ? '완료' : '다음' }}
        </button>
      </div>
    </div>

    <!-- 약관 내용 모달 -->
    <div v-if="showTermsModal" class="terms-modal-overlay" @click="showTermsModal = ''">
      <div class="terms-modal" @click.stop>
        <h3 class="terms-modal-title">{{ modalContent.title }}</h3>
        <div class="terms-modal-content">
          <p class="terms-modal-text" style="white-space: pre-wrap;">{{ modalContent.content }}</p>
        </div>
        <button @click="showTermsModal = ''" class="btn btn-primary">확인</button>
      </div>
    </div>

    <!-- Alert 모달 -->
    <AlertModal
      :show="modalState.show"
      :title="modalState.title"
      :message="modalState.message"
      :type="modalState.type"
      @close="closeModal"
      @confirm="handleModalConfirm"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: white;
  border-radius: 1rem;
  max-width: 40rem;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 1.5rem;
  color: white;
}

.header-content {
  margin-bottom: 1rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.header-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
}

.progress-dots {
  display: flex;
  gap: 0.5rem;
}

.progress-dot {
  flex: 1;
  height: 0.375rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
}

.progress-dot.active {
  background-color: white;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.step-container {
  max-width: 36rem;
  margin: 0 auto;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
}

.step-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.agreement-all {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.agreement-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.agreement-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.agreement-item:hover {
  background-color: #f3f4f6;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  flex: 1;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #10b981;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.9375rem;
  color: #374151;
}

.font-medium {
  font-weight: 500;
}

.required-badge {
  color: #dc2626;
  font-weight: 500;
  font-size: 0.875rem;
}

.optional-badge {
  color: #6b7280;
  font-size: 0.875rem;
}

.view-button {
  color: #10b981;
  font-size: 0.875rem;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.view-button:hover {
  color: #059669;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-block {
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border-left: 4px solid #10b981;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.question-number {
  background-color: #10b981;
  color: white;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.question-text {
  color: #111827;
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.option-button {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-button:hover {
  background-color: #f3f4f6;
  border-color: #10b981;
  transform: translateY(-1px);
}

.option-button.selected {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-primary {
  background-color: #10b981;
  color: white;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:disabled {
  background-color: #d1d5db;
}

.btn-outline {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.full-width {
  width: 100%;
}

.terms-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
}

.terms-modal {
  background-color: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 32rem;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.terms-modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #111827;
}

.terms-modal-content {
  overflow-y: auto;
  max-height: 24rem;
  margin-bottom: 1rem;
  padding-right: 0.5rem;
}

.terms-modal-text {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.625;
}

@media (max-width: 640px) {
  .modal-container {
    max-height: 95vh;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .question-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .question-text {
    font-size: 0.875rem;
  }

  .option-button {
    font-size: 0.8125rem;
    min-height: 2.75rem;
  }
}
</style>