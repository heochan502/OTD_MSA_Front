<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { termsService } from '@/services/user/termsService';
import { useAuthenticationStore } from '@/stores/user/authentication'; 


const router = useRouter();
const authentication = useAuthenticationStore(); 


const currentStep = ref(1); 
const isLoading = ref(false);

// 약관 데이터
const termsData = ref([]);
const termsMap = ref(new Map());

// 약관 동의 상태
const agreements = ref({
  all: false,
  agreedTermsIds: []
});

// 설문조사 답변
const surveyAnswers = ref({
  exercise: null,   
  duration: null, 
  activity: null, 
  fitness: null    
});


const surveyQuestions = [
  {
    id: 'exercise',
    question: '땀흘릴 정도의 운동을 얼마나 하시나요?',
    options: [
      { value: 'notatall', label: '전혀안함' },      // 0점
      { value: '1~2weeks', label: '주 1~2회' },      // 1점
      { value: '3~4weeks', label: '주 3~4회' },      // 2점
      { value: 'almost', label: '거의 매일' }         // 3점
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

// 전체 동의 토글 함수
function toggleAll() {
  agreements.value.all = !agreements.value.all;
  
  if (agreements.value.all) {
    agreements.value.agreedTermsIds = termsData.value.map(t => t.termsId);
  } else {
    agreements.value.agreedTermsIds = [];
  }
}
onMounted(async () => { 

  try { 
    const response = await termsService.getActiveTerms(); 
    
    // 다양한 응답 구조 처리
    let termsArray = [];
    
    if (response.success && response.result) {
      termsArray = response.result;
    } else if (response.result) {
      termsArray = response.result;
    } else if (response.data) {
      termsArray = response.data;
    } else if (Array.isArray(response)) {
      termsArray = response;
    }
    

    
    if (Array.isArray(termsArray) && termsArray.length > 0) {
      termsData.value = termsArray; 

      
      termsData.value.forEach(term => { 
        termsMap.value.set(term.type, term); 
      }); 
      

    } else {
      showAlert('오류', '약관 데이터 형식이 올바르지 않습니다.', 'error'); 
    }
  } catch (error) { 
    console.error('약관 불러오기 실패:', error); 
    console.error('에러 상세:', error.message, error.stack);
    
    // 404 에러 시 목 데이터 사용
    if (error.response && error.response.status === 404) {

      

      termsData.value = [
        {
          termsId: 1,
          type: 'SERVICE',
          title: '서비스 이용약관',
          content: '서비스 이용약관 내용입니다.\n\n제 1조 (목적)\n이 약관은 회사가 제공하는 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제 2조 (정의)\n1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.\n2. "회원"이란 이 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 말합니다.',
          isRequired: true
        },
        {
          termsId: 2,
          type: 'PRIVACY',
          title: '개인정보 처리방침',
          content: '개인정보 처리방침 내용입니다.\n\n제 1조 (개인정보의 처리 목적)\n회사는 다음의 목적을 위하여 개인정보를 처리합니다.\n1. 회원 가입 및 관리\n2. 서비스 제공\n3. 고객 문의 처리\n\n제 2조 (개인정보의 처리 및 보유 기간)\n회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.',
          isRequired: true
        },
        {
          termsId: 3,
          type: 'MARKETING',
          title: '마케팅 정보 수신 동의',
          content: '마케팅 정보 수신 동의 내용입니다.\n\n회사는 다음과 같은 마케팅 정보를 제공합니다:\n1. 신규 서비스 및 이벤트 안내\n2. 맞춤형 광고 정보\n3. 프로모션 및 혜택 안내\n\n수신 동의를 거부하실 수 있으며, 거부 시에도 서비스 이용에는 제한이 없습니다.',
          isRequired: false
        }
      ];
      
      termsData.value.forEach(term => { 
        termsMap.value.set(term.type, term); 
      });
      

    } else {
      showAlert('오류', '약관을 불러오는데 실패했습니다.', 'error'); 
    }
  } 
});

watch(
  () => agreements.value.agreedTermsIds.length,
  (newLength) => {
    agreements.value.all = newLength === termsData.value.length && termsData.value.length > 0;
  }
);

const sortedTermsData = computed(() => {
  return [...termsData.value].sort((a, b) => {
    if (a.isRequired && !b.isRequired) return -1;
    if (!a.isRequired && b.isRequired) return 1;
    return 0;
  });
});


// 설문 완료 여부
const isSurveyCompleted = computed(() => {
  return Object.values(surveyAnswers.value).every((answer) => answer !== null);
});

// 설문 점수 계산
const calculateSurveyScore = computed(() => {
  let totalScore = 0;
  Object.values(surveyAnswers.value).forEach((answer) => {
    if (answer) {
      const questionOptions =
        surveyQuestions.find((q) =>
          q.options.some((opt) => opt.value === answer)
        )?.options || [];

      const optionIndex = questionOptions.findIndex(
        (opt) => opt.value === answer
      );
      if (optionIndex !== -1) {
        totalScore += optionIndex;
      }
    }
  });
  return totalScore;
});


// 등급 계산
const getFitnessRank = computed(() => {
  const score = calculateSurveyScore.value;
  if (score >= 0 && score <= 3) return { name: '브론즈', color: '#CD7F32' };
  if (score >= 4 && score <= 6) return { name: '실버', color: '#C0C0C0' };
  if (score >= 7 && score <= 9) return { name: '골드', color: '#FFD700' };
  if (score >= 10 && score <= 12) return { name: '다이아', color: '#B9F2FF' };
  return { name: '브론즈', color: '#CD7F32' };
});


const canProceedToNext = computed(() => {
  if (currentStep.value === 1) {

    const requiredTerms = termsData.value.filter(t => t.isRequired);
    return requiredTerms.every(term => 
      agreements.value.agreedTermsIds.includes(term.termsId)
    );
  }
  
  if (currentStep.value === 2) {

    return isSurveyCompleted.value;
  }
  
  return false;
});

// 설문 옵션 선택
const selectOption = (questionId, optionValue) => {
  surveyAnswers.value[questionId] = optionValue;
};






// ⭐ 다음 버튼 클릭
const handleNext = async () => {
  if (currentStep.value < 2) {
    // 1단계 → 2단계
    currentStep.value++;
  } else {
    // 2단계 → 온보딩 완료 처리
    await completeOnboarding();
  }
};

// 이전 버튼 클릭
const handlePrevious = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};


const completeOnboarding = async () => {
  isLoading.value = true;
  
  try {
    const surveyScore = calculateSurveyScore.value;
    
 
    await authentication.completeOnboarding(
      surveyScore,
      agreements.value.agreedTermsIds
    );
    
    // 완료 화면으로
    currentStep.value = 3;
    
  } catch (error) {
    console.error('온보딩 완료 실패:', error);


    showAlert(
      '온보딩 실패',
      error.response?.data?.message || '오류가 발생했습니다.',
      'error'
    );
  } finally {
    isLoading.value = false;
  }
};

// 시작하기 버튼 - 홈으로 이동
const handleStart = () => {
  router.push('/');
};

// 약관 모달 닫기
const closeTermsModal = () => {

  showTermsModal.value = false;
};
// 약관 내용 로드 및 모달 표시
const loadTermsContent = (type) => {

  
  if (!termsData.value || termsData.value.length === 0) {

    showAlert('오류', '약관 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
    return;
  }
  
  const term = termsData.value.find(t => {

    return t.type === type;
  });
  

  
  if (term) {
  
    modalContent.value.title = term.title || '약관';
    modalContent.value.content = term.content || '내용을 불러올 수 없습니다.';
    
    console.log('modalContent 설정 완료:', modalContent.value);
    
    showTermsModal.value = true;
    console.log('showTermsModal:', showTermsModal.value);
  } else {
    console.error('약관을 찾을 수 없습니다. type:', type);
    console.log('사용 가능한 types:', termsData.value.map(t => t.type));
    showAlert('오류', '약관을 찾을 수 없습니다.', 'error');
  }
};
// 약관 모달
const showTermsModal = ref(false);
const modalContent = ref({
  title: '',
  content: ''
});
const closeAlert = () => {
  alertModal.value.show = false;
};

const handleAlertConfirm = () => {
  if (alertModal.value.onConfirm) {
    alertModal.value.onConfirm();
  }
  closeAlert();
};

// 공통 알림 모달
const alertModal = ref({
  show: false,
  title: '',
  message: '',
  type: 'info',
  onConfirm: null,
});

const showAlert = (title, message, type = 'info', onConfirm = null) => {
  alertModal.value = {
    show: true,
    title,
    message,
    type,
    onConfirm,
  };
};
</script>

<template>
  <div class="onboarding-container">
    <!-- 진행 표시 -->
    <div v-if="currentStep <= 2" class="progress-container">
      <div class="progress-dots">
        <div
          v-for="step in 2"
          :key="step"
          :class="['progress-dot', { active: step <= currentStep }]"
        ></div>
      </div>
    </div>

    <div class="content">
      <!-- Step 1: 약관 동의 -->
      <div v-if="currentStep === 1" class="step-container">
        <h2 class="step-title">서비스 이용동의</h2>

        <div class="form-group">
         <!-- 전체동의 -->
         <div class="agreement-all">
            <label class="checkbox-container">
              <input
                type="checkbox"
                :checked="agreements.all"
                @change="toggleAll"
                class="checkbox"
              />
              <span class="checkbox-text font-medium">약관 전체동의</span>
            </label>
          </div>

          <!-- 개별 약관 -->
          <div class="agreement-list">
            <div
              v-for="term in sortedTermsData"
              :key="term.termsId"
              class="agreement-item"
            >
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  :value="term.termsId"
                  v-model="agreements.agreedTermsIds"
                  class="checkbox"
                />
                <span>
                  {{ term.isRequired ? '(필수)' : '(선택)' }} {{ term.title }}
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
      </div>

      <!-- Step 2: 설문조사 -->
      <div v-if="currentStep === 2" class="step-container">
        <h2 class="step-title">운동 및 체력 설문조사</h2>

        <div class="questions-container">
          <div
            v-for="(question, index) in surveyQuestions"
            :key="question.id"
            class="question-block"
          >
            <div class="question-header">
              <span class="question-number">Q{{ index + 1 }}</span>
              <h3 class="question-text">{{ question.question }}</h3>
            </div>

            <div class="options-grid">
              <button
                v-for="option in question.options"
                :key="option.value"
                @click="selectOption(question.id, option.value)"
                :class="[
                  'option-button',
                  { selected: surveyAnswers[question.id] === option.value },
                ]"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: 완료 -->
      <div v-if="currentStep === 3" class="step-container result-container">
        <h2 class="result-title">회원님의 체력 등급은?</h2>

        <div class="result-content">
          <div class="rank-display">
            <div
              class="rank-badge"
              :style="{ backgroundColor: getFitnessRank.color }"
            >
              {{ getFitnessRank.name }}
            </div>
          </div>
          <p class="result-description">
            설문 결과를 바탕으로 맞춤형 운동을 추천해드릴게요!
          </p>
        </div>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="bottom-buttons">
      <button
        v-if="currentStep > 1 && currentStep <= 2"
        @click="handlePrevious"
        class="btn btn-outline"
      >
        이전
      </button>

      <button
        v-if="currentStep <= 2"
        @click="handleNext"
        :disabled="!canProceedToNext || isLoading"
        class="btn btn-primary"
        :class="{ 'full-width': currentStep === 1 }"
      >
        {{ isLoading ? '처리 중...' : (currentStep === 2 ? '완료' : '다음') }}
      </button>

      <button
        v-if="currentStep === 3"
        @click="handleStart"
        class="btn btn-start full-width"
      >
        시작하기
      </button>
    </div>

  <!-- 약관 모달 -->
  <transition name="modal-fade">
      <div
        v-if="showTermsModal"
        class="modal-overlay"
        @click="closeTermsModal"
      >
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">{{ modalContent.title }}</h3>
            <button @click="closeTermsModal" class="modal-close-btn">
              <svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-text">{{ modalContent.content }}</p>
          </div>
          <div class="modal-footer">
            <button @click="closeTermsModal" class="btn btn-primary">
              확인
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 공통 알림 모달 -->
    <transition name="modal-fade">
      <div
        v-if="alertModal.show"
        class="modal-overlay"
        @click="closeAlert"
      >
        <div class="alert-modal" @click.stop>
          <div class="alert-icon" :class="alertModal.type">
            <span v-if="alertModal.type === 'success'">✓</span>
            <span v-else-if="alertModal.type === 'error'">✕</span>
            <span v-else>ℹ</span>
          </div>
          <h3 class="alert-title">{{ alertModal.title }}</h3>
          <p class="alert-message">{{ alertModal.message }}</p>
          <div class="alert-buttons">
            <button @click="handleAlertConfirm" class="btn btn-primary">
              확인
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.signup-container {
  min-height: 100vh;
  background-color: #ffffff;
}

.header {
  background-color: white;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}

.progress-container {
  background-color: white;
  padding: 0.75rem 1rem;
}

.progress-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.progress-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #d1d5db;
}

.progress-dot.active {
  background-color: #00d5df;
}

.content {
  padding: 1.5rem 20px;
}

.step-container {
  max-width: 28rem;
  margin: 0 auto;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-wrapper {
  position: relative;
  display: flex;
  gap: 8px;
}

.input-field-with-icon {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field-with-button {
  flex: 1;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.input-field-with-icon:focus,
.input-field-with-button:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-field-with-icon.error,
.input-field-with-button.error {
  border-color: #dc2626;
  background-color: #fef2f2;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.input-field-with-icon.success,
.input-field-with-button.success {
  border-color: #16a34a;
  background-color: #f0fdf4;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.input-icon-button {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
}

.file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.btn {
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  width: 100%;
  height: 55px;
}

.btn:disabled {
  cursor: not-allowed;
}

.btn-primary {
  background-color: #393e46;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #303030;
}

.btn-primary:disabled {
  background-color: #d1d5db;
}

.btn-secondary {
  background-color: #393e46;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #303030;
}

.btn-secondary:disabled {
  background-color: #d1d5db;
}

.btn-outline {
  background-color: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background-color: #f9fafb;
}

.btn-start {
  background-color: #10b981;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  width: 100%;
}

.btn-start:hover {
  background-color: #059669;
  transform: translateY(-1px);
}

.btn-small {
  flex-shrink: 0;
  padding: 0 16px;
  background: #555;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
  height: 55px;
}

.btn-small:hover:not(:disabled) {
  background: #333;
}

.btn-small:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #999;
}

.success-message {
  color: #10b981;
  text-align: center;
  font-weight: 500;
}

.error-message {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.message-icon {
  margin-right: 8px;
  font-weight: bold;
}

.field-message {
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.field-error {
  color: #dc2626;
}

.field-success {
  color: #16a34a;
}

.password-match-message {
  font-weight: 500;
  transition: all 0.3s ease;
}

.agreement-all {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

.agreement-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  flex: 1;
}

.agreement-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #ffffff;
}

.checkbox-text {
  font-size: 1rem;
}

.font-medium {
  font-weight: 500;
}

.view-button {
  color: #6b7280;
  font-size: 0.875rem;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.view-button:hover {
  color: #374151;
}

.profile-image-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.profile-image-wrapper {
  position: relative;
}

.profile-image {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.questions-container {
  margin-bottom: 20px;
}

.question-block {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #10b981;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.question-number {
  background: #10b981;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  flex-shrink: 0;
}

.question-text {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.option-button {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: #f8f9fa;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-button:hover {
  background: #e9ecef;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-button.selected {
  background: #10b981;
  color: white;
  border-color: #10b981;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.result-container {
  text-align: center;
  padding: 2rem 1rem;
}

.result-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: #333;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.rank-display {
  display: flex;
  justify-content: center;
}

.rank-badge {
  padding: 1.5rem 2.5rem;
  border-radius: 2rem;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  min-width: 200px;
}

.bottom-buttons {
  display: flex;
  background-color: white;
  padding: 1rem;
  gap: 0.75rem;
}

.full-width {
  width: 100%;
}

/* 모달 스타일 */
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
  border-radius: 0.75rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: #111827;
}

.modal-close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-text {
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
}

/* 알림 모달 스타일 */
.alert-modal {
  background-color: white;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.alert-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 2rem;
  font-weight: bold;
}

.alert-icon.success {
  background-color: #d1fae5;
  color: #065f46;
}

.alert-icon.error {
  background-color: #fee2e2;
  color: #991b1b;
}

.alert-icon.info {
  background-color: #dbeafe;
  color: #1e40af;
}

.alert-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
}

.alert-message {
  font-size: 0.9375rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.alert-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* 모달 애니메이션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-enter-active .alert-modal,
.modal-fade-leave-active .modal-container,
.modal-fade-leave-active .alert-modal {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from .modal-container,
.modal-fade-enter-from .alert-modal,
.modal-fade-leave-to .modal-container,
.modal-fade-leave-to .alert-modal {
  transform: scale(0.95);
}

@media (max-width: 600px) {
  .step-container {
    max-width: 100%;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .question-text {
    font-size: 15px;
  }

  .option-button {
    font-size: 13px;
    min-height: 45px;
  }

  .rank-badge {
    font-size: 1.5rem;
    padding: 1rem 2rem;
    min-width: 150px;
  }

  .result-title {
    font-size: 1.3rem;
  }

  .modal-container {
    max-width: 95%;
  }
}
</style>