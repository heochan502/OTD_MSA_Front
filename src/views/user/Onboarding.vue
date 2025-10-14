<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '@/stores/user/authentication'; 
import { termsService } from '@/services/user/termsService';

const router = useRouter();
const authentication = useAuthenticationStore(); 
// ========== 상태 관리 ==========
const currentStep = ref(1); // 1: 약관 동의, 2: 설문조사, 3: 완료
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
  exercise: null,   // 운동 빈도
  duration: null,   // 운동 시간
  activity: null,   // 활동량
  fitness: null     // 체력 수준
});

// 모달 상태
const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
});

const showTermsModal = ref('');
const modalContent = ref({});

// ========== 설문 문항 ==========
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

// ========== Computed ==========

// ⭐ 설문조사 총점 계산 (0~12점)
const calculateSurveyScore = computed(() => {
  let totalScore = 0;
  
  Object.values(surveyAnswers.value).forEach((answer) => {
    if (answer) {
      // 각 질문에서 선택한 옵션의 인덱스 = 점수
      const question = surveyQuestions.find(q =>
        q.options.some(opt => opt.value === answer)
      );
      
      if (question) {
        const optionIndex = question.options.findIndex(
          opt => opt.value === answer
        );
        totalScore += optionIndex; // 0, 1, 2, 3
      }
    }
  });
  
  return totalScore; // 최소 0점, 최대 12점
});

// 설문 완료 여부
const isSurveyCompleted = computed(() => {
  return Object.values(surveyAnswers.value).every(answer => answer !== null);
});

// 산출된 등급
const getFitnessRank = computed(() => {
  const score = calculateSurveyScore.value;
  if (score >= 0 && score <= 3) return { name: '브론즈', color: '#CD7F32' };
  if (score >= 4 && score <= 6) return { name: '실버', color: '#C0C0C0' };
  if (score >= 7 && score <= 9) return { name: '골드', color: '#FFD700' };
  if (score >= 10 && score <= 12) return { name: '다이아', color: '#B9F2FF' };
  return { name: '브론즈', color: '#CD7F32' };
});

// ⭐ 다음 단계 진행 가능 여부
const canProceedToNext = computed(() => {
  if (currentStep.value === 1) {
    // 약관 동의 단계: 필수 약관 모두 동의했는지
    const requiredTerms = termsData.value.filter(t => t.isRequired);
    return requiredTerms.every(term => 
      agreements.value.agreedTermsIds.includes(term.termsId)
    );
  }
  
  if (currentStep.value === 2) {
    // 설문조사 단계: 모든 질문에 답했는지
    return isSurveyCompleted.value;
  }
  
  return false;
});

// ========== 메서드 ==========

// 약관 체크 여부 확인
const isTermsChecked = (termsId) => {
  return agreements.value.agreedTermsIds.includes(termsId);
};

// ⭐ 약관 동의 처리
const handleAgreementChange = (termsId) => {
  if (termsId === 'all') {
    // 전체 동의
    const newValue = !agreements.value.all;
    agreements.value.all = newValue;
    
    if (newValue) {
      agreements.value.agreedTermsIds = termsData.value.map(t => t.termsId);
    } else {
      agreements.value.agreedTermsIds = [];
    }
  } else {
    // 개별 동의
    const index = agreements.value.agreedTermsIds.indexOf(termsId);
    
    if (index > -1) {
      agreements.value.agreedTermsIds.splice(index, 1);
    } else {
      agreements.value.agreedTermsIds.push(termsId);
    }
    
    // 전체 동의 체크박스 상태 업데이트
    agreements.value.all = 
      agreements.value.agreedTermsIds.length === termsData.value.length;
  }
};

// 설문 옵션 선택
const selectOption = (questionId, optionValue) => {
  surveyAnswers.value[questionId] = optionValue;
};

// 약관 모달 열기
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

// ⭐ 온보딩 완료 처리
const completeOnboarding = async () => {
  isLoading.value = true;
  
  try {
    const surveyScore = calculateSurveyScore.value;
    
    // ⭐ 기존 스토어 메서드 사용
    await authentication.completeOnboarding(
      surveyScore,
      agreements.value.agreedTermsIds
    );
    
    // 완료 화면으로
    currentStep.value = 3;
    
  } catch (error) {
    console.error('온보딩 완료 실패:', error);
    showModal('온보딩 실패', error.response?.data?.message || '오류가 발생했습니다.', 'error');
  } finally {
    isLoading.value = false;
  }
};

// 시작하기 버튼 (완료 화면에서)
const handleStart = () => {
  router.push('/dashboard');
};

// 모달 관련
const showModal = (title, message, type = 'info') => {
  modalState.value = {
    show: true,
    title,
    message,
    type
  };
};

const closeModal = () => {
  modalState.value.show = false;
};

// ⭐ 컴포넌트 마운트 시 약관 불러오기
onMounted(async () => {
  try {
    const response = await termsService.getActiveTerms();
    
    if (response.success) {
      termsData.value = response.result;
      
      // 타입별로 맵에 저장 (모달에서 사용)
      termsData.value.forEach(term => {
        termsMap.value.set(term.type, term);
      });
    }
  } catch (error) {
    console.error('약관 불러오기 실패:', error);
    showModal('오류', '약관을 불러오는데 실패했습니다.', 'error');
  }
});
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

          <!-- 개별 약관 목록 -->
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
                  {{ term.isRequired ? '(필수)' : '(선택)' }} 
                  {{ term.typeDescription }}
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
                  { selected: surveyAnswers[question.id] === option.value }
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
    <div v-if="showTermsModal" class="modal-overlay" @click="showTermsModal = ''">
      <div class="modal" @click.stop>
        <h3 class="modal-title">{{ modalContent.title }}</h3>
        <div class="modal-content">
          <p class="modal-text" style="white-space: pre-wrap;">{{ modalContent.content }}</p>
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
    />
  </div>
</template>

<style scoped>
.onboarding-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.terms-content {
  border: 1px solid #ddd;
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
  margin: 20px 0;
}

.survey-form {
  margin: 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>