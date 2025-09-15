<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
//import { usePassAuth } from '@/components/user/UserPassAuth'


const router = useRouter()
const { authenticateWithPass, PASS_SERVICES } = usePassAuth()

const currentStep = ref(1)
const isLoading = ref(false)
const totalSteps = 7

// 각 단계별 데이터
const authData = reactive({
  isVerified: false,
  name: '',
  phone: '',
  birthDate: '',
  gender: '',
  ci: '',
  di: '',
  authToken: '',
  provider: ''
})

const agreements = reactive({
  terms: false,
  privacy: false,
  marketing: false,
  allAgree: false
})

const formData = reactive({
  uid: '',
  upw: '',
  confirmPassword: '',
  email: '',
  emailVerificationCode: '',
  nickName: '',
  profilePic: null,
  useDefaultProfile: true
})

const emailVerification = reactive({
  isSent: false,
  isVerified: false,
  timer: 0,
  isTimerActive: false
})

const validation = reactive({
  uid: { isChecked: false, isAvailable: false },
  nickName: { isChecked: false, isAvailable: false }
})

const errors = reactive({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const previewImage = ref(null)
const fileInput = ref(null)
const authError = ref('')

// 진행률 계산
const progress = computed(() => (currentStep.value / totalSteps) * 100)

// PASS 본인인증 처리
const handlePassAuth = async (provider) => {
  isLoading.value = true
  authError.value = ''

  try {
    const result = await authenticateWithPass(provider)
    
    if (result.success) {
      authData.isVerified = true
      authData.name = result.data.name
      authData.phone = result.data.phone
      authData.birthDate = result.data.birthDate
      authData.gender = result.data.gender
      authData.ci = result.data.ci
      authData.di = result.data.di
      authData.authToken = result.data.authToken
      authData.provider = result.data.provider
      
      // 자동으로 다음 단계로 이동
      setTimeout(() => {
        currentStep.value = 2
      }, 1000)
    } else {
      authError.value = result.error
    }
  } catch (error) {
    console.error('PASS 인증 에러:', error)
    authError.value = error.message || 'PASS 인증 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 전체 동의 체크
const handleAllAgree = () => {
  const checked = agreements.allAgree
  agreements.terms = checked
  agreements.privacy = checked
  agreements.marketing = checked
}

// 개별 동의 상태 업데이트
const updateAllAgree = () => {
  agreements.allAgree = agreements.terms && agreements.privacy && agreements.marketing
}

// 아이디 중복 확인
const checkUidAvailability = async () => {
  if (!formData.uid || formData.uid.length < 4) {
    errors.uid = '아이디는 4자 이상이어야 합니다.'
    return
  }

  isLoading.value = true
  try {
    const response = await checkUidDuplicate(formData.uid)
    
    if (response.data.available) {
      validation.uid.isChecked = true
      validation.uid.isAvailable = true
      delete errors.uid
      alert('사용 가능한 아이디입니다.')
    } else {
      validation.uid.isChecked = true
      validation.uid.isAvailable = false
      errors.uid = '이미 사용 중인 아이디입니다.'
    }
  } catch (error) {
    console.error('아이디 중복 확인 에러:', error)
    errors.uid = '아이디 중복 확인 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 닉네임 중복 확인
const checkNicknameAvailability = async () => {
  if (!formData.nickName.trim()) {
    errors.nickName = '닉네임을 입력해주세요.'
    return
  }

  isLoading.value = true
  try {
    const response = await checkNicknameDuplicate(formData.nickName)
    
    if (response.data.available) {
      validation.nickName.isChecked = true
      validation.nickName.isAvailable = true
      delete errors.nickName
      alert('사용 가능한 닉네임입니다.')
    } else {
      validation.nickName.isChecked = true
      validation.nickName.isAvailable = false
      errors.nickName = '이미 사용 중인 닉네임입니다.'
    }
  } catch (error) {
    console.error('닉네임 중복 확인 에러:', error)
    errors.nickName = '닉네임 중복 확인 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 아이디 입력 시 중복 확인 상태 초기화
const onUidChange = () => {
  validation.uid.isChecked = false
  validation.uid.isAvailable = false
  delete errors.uid
}

// 닉네임 입력 시 중복 확인 상태 초기화
const onNicknameChange = () => {
  validation.nickName.isChecked = false
  validation.nickName.isAvailable = false
  delete errors.nickName
}

// 이메일 인증 초기화
const resetEmailVerification = () => {
  emailVerification.isSent = false
  emailVerification.isVerified = false
  emailVerification.timer = 0
  emailVerification.isTimerActive = false
  formData.emailVerificationCode = ''
}

// 이메일 인증코드 발송
const sendEmailVerification = async () => {
  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    alert('올바른 이메일을 입력해주세요.')
    return
  }

  isLoading.value = true
  try {
    const response = await sendEmailAPI({ email: formData.email })
    
    if (response.success) {
      emailVerification.isSent = true
      emailVerification.timer = 300 // 5분
      emailVerification.isTimerActive = true
      
      // 타이머 시작
      const interval = setInterval(() => {
        emailVerification.timer--
        if (emailVerification.timer <= 0) {
          clearInterval(interval)
          emailVerification.isTimerActive = false
          emailVerification.isSent = false
        }
      }, 1000)
      
      alert('인증코드가 발송되었습니다.')
    } else {
      throw new Error(response.message || '인증코드 발송에 실패했습니다.')
    }
  } catch (error) {
    console.error('이메일 인증 발송 에러:', error)
    alert(error.message || '인증코드 발송에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 이메일 인증코드 확인
const verifyEmailCode = async () => {
  if (!formData.emailVerificationCode) {
    alert('인증코드를 입력해주세요.')
    return
  }

  isLoading.value = true
  try {
    const response = await verifyEmailAPI({
      email: formData.email,
      code: formData.emailVerificationCode
    })
    
    if (response.success) {
      emailVerification.isVerified = true
      emailVerification.isTimerActive = false
      delete errors.email
      alert('이메일 인증이 완료되었습니다.')
    } else {
      throw new Error(response.message || '인증코드가 일치하지 않습니다.')
    }
  } catch (error) {
    console.error('이메일 인증 확인 에러:', error)
    alert(error.message || '인증 확인에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 타이머 포맷팅
const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 유효성 검사
const validateStep = (step) => {
  Object.keys(errors).forEach(key => delete errors[key])
  
  switch(step) {
    case 3: // 아이디
      if (!formData.uid.trim()) {
        errors.uid = '아이디를 입력해주세요.'
      } else if (formData.uid.length < 4) {
        errors.uid = '아이디는 4자 이상이어야 합니다.'
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.uid)) {
        errors.uid = '아이디는 영문, 숫자, 언더스코어만 사용 가능합니다.'
      } else if (!validation.uid.isChecked || !validation.uid.isAvailable) {
        errors.uid = '아이디 중복 확인을 해주세요.'
      }
      break
    case 4: // 비밀번호
      if (!formData.upw) {
        errors.upw = '비밀번호를 입력해주세요.'
      } else if (formData.upw.length < 8) {
        errors.upw = '비밀번호는 8자 이상이어야 합니다.'
      } else if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.upw)) {
        errors.upw = '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = '비밀번호 확인을 입력해주세요.'
      } else if (formData.upw !== formData.confirmPassword) {
        errors.confirmPassword = '비밀번호가 일치하지 않습니다.'
      }
      break
    case 5: // 이메일
      if (!formData.email.trim()) {
        errors.email = '이메일을 입력해주세요.'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = '올바른 이메일 형식이 아닙니다.'
      } else if (!emailVerification.isVerified) {
        errors.email = '이메일 인증을 완료해주세요.'
      }
      break
    case 6: // 닉네임
      if (!formData.nickName.trim()) {
        errors.nickName = '닉네임을 입력해주세요.'
      } else if (formData.nickName.length < 2) {
        errors.nickName = '닉네임은 2자 이상이어야 합니다.'
      } else if (!validation.nickName.isChecked || !validation.nickName.isAvailable) {
        errors.nickName = '닉네임 중복 확인을 해주세요.'
      }
      break
  }
  
  return Object.keys(errors).length === 0
}

// 다음 단계로
const nextStep = () => {
  if (currentStep.value === 2 && (!agreements.terms || !agreements.privacy)) {
    alert('필수 약관에 동의해주세요.')
    return
  }
  
  if (validateStep(currentStep.value)) {
    if (currentStep.value < totalSteps) {
      currentStep.value++
    }
  }
}

// 이전 단계로
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 프로필 사진 선택
const selectProfilePic = () => {
  fileInput.value?.click()
}

// 파일 선택 처리
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하만 업로드 가능합니다.')
      return
    }

    // 파일 형식 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    formData.profilePic = file
    formData.useDefaultProfile = false
    
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// 기본 프로필 사용
const useDefaultProfile = () => {
  formData.useDefaultProfile = true
  formData.profilePic = null
  previewImage.value = null
}

// 회원가입 완료
const handleJoin = async () => {
  isLoading.value = true
  try {
    // FormData 생성
    const formDataToSend = new FormData()
    
    const userJoinReq = {
      uid: formData.uid,
      upw: formData.upw,
      nickName: formData.nickName,
      email: formData.email,
      name: authData.name,
      phoneNumber: authData.phone,
      birthDate: authData.birthDate,
      gender: authData.gender,
      ci: authData.ci,
      di: authData.di,
      authToken: authData.authToken,
      provider: authData.provider,
      marketingAgree: agreements.marketing,
      roles: ['USER']
    }
    
    formDataToSend.append('req', new Blob([JSON.stringify(userJoinReq)], {
      type: 'application/json'
    }))
    
    if (formData.profilePic) {
      formDataToSend.append('pic', formData.profilePic)
    }

    // 실제 API 호출
    const response = await join(formDataToSend)
    
    if (response.success) {
      alert('회원가입이 완료되었습니다!')
      router.push('/login')
    } else {
      throw new Error(response.message || '회원가입에 실패했습니다.')
    }
  } catch (error) {
    console.error('회원가입 에러:', error)
    
    // 에러 타입에 따른 처리
    if (error.response?.status === 409) {
      alert('이미 존재하는 사용자입니다.')
    } else if (error.response?.status === 400) {
      alert('입력 정보를 다시 확인해주세요.')
    } else {
      alert(error.message || '회원가입 중 오류가 발생했습니다.')
    }
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <div class="join-container">
    <div class="join-card">
      
      <!-- 진행률 바 -->
      <div class="progress-section">
        <div class="progress-info">
          <span>단계 {{ currentStep }} / {{ totalSteps }}</span>
          <span>{{ Math.round(progress) }}%</span>
        </div>
        <div class="progress-bar-container">
          <div 
            class="progress-bar"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>

      <!-- 단계 1: PASS 본인인증 -->
      <div v-if="currentStep === 1" class="step-container step-center">
        <div class="step-content"> 
          <h2 class="step-title">본인 확인을 위해</h2>
          <p class="step-subtitle">PASS로 간편하게 본인인증을 진행하세요</p>
        </div>
        
        <div v-if="!authData.isVerified" class="pass-auth-section">
          <div class="pass-services">
            <button 
              v-for="(service, key) in PASS_SERVICES" 
              :key="key"
              @click="handlePassAuth(key)"
              :disabled="isLoading"
              class="pass-service-btn"
              :class="{ 'loading': isLoading }"
            >
              <div class="service-info">
                <img :src="service.logoUrl" :alt="service.name" class="service-logo">
                <span class="service-name">{{ service.name }}</span>
              </div>
              <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <p>PASS 인증 진행 중...</p>
          </div>
          
          <div v-if="authError" class="error-message">
            {{ authError }}
            <button @click="authError = ''" class="error-close">×</button>
          </div>
          
          <div class="auth-notice">
            <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>• 통신사 PASS 앱이 설치되어 있어야 합니다</p>
            <p>• 본인 명의의 휴대폰이 필요합니다</p>
            <p>• 만 14세 이상만 가입 가능합니다</p>
          </div>
        </div>
        
        <div v-else class="auth-result">
          <div class="success-box">
            <div class="success-header">
              <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="success-text">PASS 인증 완료</span>
            </div>
            <div class="auth-info">
              <div class="auth-item">
                <span class="auth-label">이름:</span>
                <span class="auth-value">{{ authData.name }}</span>
              </div>
              <div class="auth-item">
                <span class="auth-label">휴대폰:</span>
                <span class="auth-value">{{ authData.phone }}</span>
              </div>
              <div class="auth-item">
                <span class="auth-label">인증사:</span>
                <span class="auth-value">{{ PASS_SERVICES[authData.provider]?.name }}</span>
              </div>
            </div>
          </div>
          <div class="button-group">
            <button
              @click="authData.isVerified = false"
              class="btn btn-secondary">다시 인증</button>
            <button
              @click="nextStep"
              class="btn btn-primary">다음</button>
          </div>
        </div>
      </div>

      <!-- 단계 2: 서비스 이용동의 -->
      <div v-if="currentStep === 2" class="step-container">
        <div class="step-header">
          <h1 class="step-title">서비스 이용 동의</h1>
        </div>

        <div class="agreements-container">
          <div class="agreement-all">
            <label class="checkbox-label checkbox-label-bold">
              <input
                type="checkbox"
                v-model="agreements.allAgree"
                @change="handleAllAgree"
                class="checkbox"
              />
              <span class="checkbox-text checkbox-text-bold">약관 전체 동의</span>
            </label>
          </div>

          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="agreements.terms"
              @change="updateAllAgree"
              class="checkbox"
            />
            <span class="checkbox-text">(필수) 서비스 이용 약관</span>
          </label>

          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="agreements.privacy"
              @change="updateAllAgree"
              class="checkbox"
            />
            <span class="checkbox-text">(필수) 개인정보 처리방침</span>
          </label>

          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="agreements.marketing"
              @change="updateAllAgree"
              class="checkbox"
            />
            <span class="checkbox-text">(선택) 마케팅 정보 수신 동의</span>
          </label>
        </div>
        
        <div class="button-group">
          <button
            @click="prevStep"
            class="btn btn-secondary">이전</button>
          <button
            @click="nextStep"
            class="btn btn-primary">다음</button>
        </div>
      </div>

      <!-- 단계 3: 아이디 입력 -->
      <div v-if="currentStep === 3" class="step-container">
        <div class="step-header">
          <svg class="step-icon step-icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <h2 class="step-title">아이디 설정</h2>
          <p class="step-subtitle">사용하실 아이디를 입력해주세요</p>
        </div>

        <div class="input-group">
          <div class="input-with-button">
            <input
              type="text"
              v-model="formData.uid"
              @input="onUidChange"
              class="input-field input-field-with-button"
              :class="errors.uid ? 'error' : ''"
              placeholder="아이디를 입력하세요 (4자 이상, 영문/숫자/언더스코어)"
            />
            <button
              @click="checkUidAvailability"
              :disabled="isLoading || !formData.uid || formData.uid.length < 4"
              class="btn btn-verification"
              :class="{
                'btn-success': validation.uid.isChecked && validation.uid.isAvailable,
                'btn-disabled': isLoading || !formData.uid || formData.uid.length < 4,
                'btn-primary': !validation.uid.isChecked && formData.uid.length >= 4
              }"
            >
              {{
                validation.uid.isChecked && validation.uid.isAvailable ? '사용가능' :
                isLoading ? '확인중...' : '중복확인'
              }}
            </button>
          </div>
          <p v-if="errors.uid" class="error-message">{{ errors.uid }}</p>
        </div>

        <div class="button-group">
          <button
            @click="prevStep"
            class="btn btn-secondary">이전</button>
          <button
            @click="nextStep"
            class="btn btn-primary">다음</button>
        </div>
      </div>

      <!-- 단계 4: 비밀번호 입력 -->
      <div v-if="currentStep === 4" class="step-container">
        <div class="step-header">
          <svg class="step-icon step-icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <h2 class="step-title">비밀번호 설정</h2>
          <p class="step-subtitle">안전한 비밀번호를 설정해주세요 (8자 이상, 영문/숫자/특수문자 포함)</p>
        </div>

        <div class="form-group">
          <div class="input-group">
            <div class="password-field">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.upw"
                class="input-field"
                :class="errors.upw ? 'error' : ''"
                placeholder="비밀번호를 입력하세요 (8자 이상)"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
              >
                <svg v-if="showPassword" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.243L15.536 15.536M14.122 14.122a3 3 0 01-4.243-.007m4.243.007l1.414 1.414M14.122 14.122L12.708 12.708"></path>
                </svg>
                <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <p v-if="errors.upw" class="error-message">{{ errors.upw }}</p>
          </div>

          <div class="input-group">
            <div class="password-field">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="formData.confirmPassword"
                class="input-field"
                :class="errors.confirmPassword ? 'error' : ''"
                placeholder="비밀번호를 다시 입력하세요"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="password-toggle"
              >
                <svg v-if="showConfirmPassword" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.243L15.536 15.536M14.122 14.122a3 3 0 01-4.243-.007m4.243.007l1.414 1.414M14.122 14.122L12.708 12.708"></path>
                </svg>
                <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>
          </div>
        </div>
        
        <div class="button-group">
          <button
            @click="prevStep"
            class="btn btn-secondary">이전</button>
          <button
            @click="nextStep"
            class="btn btn-primary">다음</button>
        </div>
      </div>

      <!-- 단계 5: 이메일 입력 및 인증 -->
      <div v-if="currentStep === 5" class="step-container">
        <div class="step-header">
          <svg class="step-icon step-icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          <h2 class="step-title">이메일 인증</h2>
          <p class="step-subtitle">이메일 주소를 입력하고 인증해주세요</p>
        </div>

        <div class="form-group">
          <!-- 이메일 입력 -->
          <div class="input-group">
            <div class="input-with-button">
              <input
                type="email"
                v-model="formData.email"
                @input="resetEmailVerification"
                class="input-field input-field-with-button"
                :class="errors.email ? 'error' : ''"
                placeholder="이메일을 입력하세요"
                :disabled="emailVerification.isVerified"
              />
              <button
                type="button"
                @click="sendEmailVerification"
                :disabled="isLoading || emailVerification.isTimerActive || emailVerification.isVerified"
                class="btn btn-verification"
                :class="{
                  'btn-success': emailVerification.isVerified,
                  'btn-disabled': emailVerification.isTimerActive || isLoading,
                  'btn-primary': !emailVerification.isVerified && !emailVerification.isTimerActive && !isLoading
                }"
              >
                {{
                  emailVerification.isVerified ? '인증완료' : 
                  emailVerification.isTimerActive ? formatTimer(emailVerification.timer) :
                  isLoading ? '발송중...' : '인증코드 발송'
                }}
              </button>
            </div>
            <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
          </div>

          <!-- 인증코드 입력 -->
          <div v-if="emailVerification.isSent && !emailVerification.isVerified" class="input-group">
            <div class="input-with-button">
              <input
                type="text"
                v-model="formData.emailVerificationCode"
                class="input-field input-field-with-button"
                placeholder="인증코드를 입력하세요"
                maxlength="6"
              />
              <button
                type="button"
                @click="verifyEmailCode"
                :disabled="isLoading || !formData.emailVerificationCode"
                class="btn btn-verification"
                :class="isLoading || !formData.emailVerificationCode ? 'btn-disabled' : 'btn-blue'"
              >
                {{ isLoading ? '확인중...' : '인증확인' }}
              </button>
            </div>
            <p class="verification-help">
              이메일로 발송된 인증코드를 입력해주세요.
              <span v-if="emailVerification.isTimerActive" class="timer-text">
                ({{ formatTimer(emailVerification.timer) }})
              </span>
            </p>
          </div>

          <!-- 인증 완료 메시지 -->
          <div v-if="emailVerification.isVerified" class="success-box">
            <div class="success-header">
              <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="success-text">이메일 인증이 완료되었습니다!</span>
            </div>
          </div>
        </div>

        <div class="button-group">
          <button
            @click="prevStep"
            class="btn btn-secondary">이전</button>
          <button
            @click="nextStep"
            class="btn btn-primary">다음</button>
        </div>
      </div>

      <!-- 단계 6: 닉네임 입력 -->
      <div v-if="currentStep === 6" class="step-container">
        <div class="step-header">
          <svg class="step-icon step-icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <h2 class="step-title">닉네임 설정</h2>
          <p class="step-subtitle">사용하실 닉네임을 입력해주세요</p>
        </div>

        <div class="input-group">
          <div class="input-with-button">
            <input
              type="text"
              v-model="formData.nickName"
              @input="onNicknameChange"
              class="input-field input-field-with-button"
              :class="errors.nickName ? 'error' : ''"
              placeholder="닉네임을 입력하세요 (2자 이상)"
            />
            <button
              @click="checkNicknameAvailability"
              :disabled="isLoading || !formData.nickName || formData.nickName.length < 2"
              class="btn btn-verification"
              :class="{
                'btn-success': validation.nickName.isChecked && validation.nickName.isAvailable,
                'btn-disabled': isLoading || !formData.nickName || formData.nickName.length < 2,
                'btn-primary': !validation.nickName.isChecked && formData.nickName.length >= 2
              }"
            >
              {{
                validation.nickName.isChecked && validation.nickName.isAvailable ? '사용가능' :
                isLoading ? '확인중...' : '중복확인'
              }}
            </button>
          </div>
          <p v-if="errors.nickName" class="error-message">{{ errors.nickName }}</p>
        </div>

        <div class="button-group">
          <button
            @click="prevStep"
            class="btn btn-secondary">이전</button>
          <button
            @click="nextStep"
            class="btn btn-primary">다음</button>
        </div>
      </div>

      <!-- 단계 7: 프로필 설정 -->
      <div v-if="currentStep === 7" class="step-container">
        <div class="step-header">
          <svg class="step-icon step-icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <h2 class="step-title">프로필 설정</h2>
          <p class="step-subtitle">프로필 사진을 설정하거나 나중에 설정할 수 있습니다</p>
        </div>

        <div class="profile-section">
          <!-- 프로필 사진 미리보기 -->
          <div class="profile-preview">
            <div class="profile-image">
              <img v-if="previewImage" :src="previewImage" alt="프로필 미리보기" />
              <svg v-else class="profile-placeholder" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>

          <!-- 프로필 설정 옵션 -->
          <div class="profile-options">
            <button
              @click="selectProfilePic"
              class="btn btn-secondary"
            >
              사진 선택하기
            </button>
            
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="hidden"
            />

            <button
              @click="useDefaultProfile"
              class="btn btn-outline"
            >
              기본 프로필로 시작하기
            </button>
          </div>
        </div>

        <div class="button-group">
          <button
            @click="prevStep"
            class="btn btn-secondary">이전</button>
          <button
            @click="handleJoin"
            :disabled="isLoading"
            class="btn"
            :class="isLoading ? 'btn-disabled' : 'btn-primary'"
          >
            {{ isLoading ? '가입 중...' : '시작하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Join Page Styles */

/* Main container */
.join-container {
  min-height: 300px;
  background: linear-gradient(to bottom right, #f0fdf4, #eff6ff);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Join card */
.join-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
}

/* Progress section */
.progress-section {
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.progress-bar-container {
  width: 100%;
  background-color: #e5e7eb;
  border-radius: 9999px;
  height: 0.5rem;
}

.progress-bar {
  background-color: #00D5DF;
  height: 0.5rem;
  border-radius: 9999px;
  transition: all 0.3s ease-in-out;
}

/* Step containers */
.step-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-center {
  text-align: center;
}

.step-header {
  text-align: center;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Step icons */
.step-icon {
  color: #059669;
  margin: 0 auto;
}

.step-icon-large {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
}

/* Step titles */
.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

/* PASS Authentication Styles */
.pass-auth-section {
  width: 100%;
}

.pass-services {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.pass-service-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
}

.pass-service-btn:hover {
  border-color: #00D5DF;
  background-color: #f0fdff;
  transform: translateY(-1px);
}

.pass-service-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.pass-service-btn.loading {
  opacity: 0.8;
  pointer-events: none;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.service-logo {
  width: 2.5rem;
  height: 2.5rem;
  object-fit: contain;
}

.service-name {
  font-weight: 500;
  color: #374151;
  font-size: 1rem;
}

.arrow-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
  transition: transform 0.2s ease-in-out;
}

.pass-service-btn:hover .arrow-icon {
  transform: translateX(2px);
  color: #00D5DF;
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  z-index: 10;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #00D5DF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Auth notice */
.auth-notice {
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.info-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #0284c7;
  margin-bottom: 0.5rem;
}

.auth-notice p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #0c4a6e;
}

/* Error message */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-top: 1rem;
  position: relative;
}

.error-close {
  position: absolute;
  top: 0.5rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #ef4444;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

/* Auth result */
.auth-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.auth-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
}

/* Input styles */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.2s ease-in-out;
}

.input-field:focus {
  outline: none;
  border-color: transparent;
  box-shadow: 0 0 0 2px #10b981;
}

.input-field.error {
  border-color: #ef4444;
}

.input-field::placeholder {
  color: #9ca3af;
}

/* Password field */
.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.password-toggle:hover {
  color: #374151;
}

.password-toggle svg {
  width: 100%;
  height: 100%;
}

/* Input with button */
.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-field-with-button {
  flex: 1;
}

/* Form group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-primary {
  background-color: #393E46;
  color: white;
}

.btn-primary:hover {
  background-color: #2f3338;
}

.btn-primary:disabled,
.btn-disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  color: white;
}

.btn-secondary {
  background-color: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #f9fafb;
}

.btn-outline {
  background-color: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background-color: #f9fafb;
}

.btn-verification {
  padding: 0.75rem 1rem;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.btn-blue {
  background-color: #2563eb;
  color: white;
}

.btn-blue:hover {
  background-color: #1d4ed8;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

/* Button groups */
.button-group {
  display: flex;
  gap: 1rem;
}

.button-group .btn {
  flex: 1;
}

/* Checkbox styles */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #10b981;
}

.checkbox-text {
  color: #393E46;
}

.checkbox-text-bold {
  font-weight: 500;
  color: #1f2937;
}

.checkbox-label-bold {
  font-weight: 600;
}

/* Agreements container */
.agreements-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agreement-all {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
}

/* Success box */
.success-box {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  padding: 1rem;
}

.success-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.success-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #10b981;
  margin-right: 0.5rem;
}

.success-text {
  font-weight: 500;
  color: #047857;
}

/* Email verification */
.verification-help {
  font-size: 0.875rem;
  color: #6b7280;
}

.timer-text {
  color: #ef4444;
  margin-left: 0.25rem;
}

/* Profile section */
.profile-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-preview {
  display: flex;
  justify-content: center;
}

.profile-image {
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-placeholder {
  width: 4rem;
  height: 4rem;
  color: #9ca3af;
}

.profile-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Hidden file input */
.hidden {
  display: none;
}

/* Loading state */
.loading {
  opacity: 0.6;
}

/* Responsive design */
@media (max-width: 640px) {
  .join-card {
    padding: 1.5rem;
  }
  
  .step-title {
    font-size: 1.25rem;
  }
  
  .step-icon-large {
    width: 3rem;
    height: 3rem;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .input-with-button {
    flex-direction: column;
  }
  
  .input-field-with-button {
    flex: none;
  }
  
  .service-logo {
    width: 2rem;
    height: 2rem;
  }
  
  .service-name {
    font-size: 0.875rem;
  }
}

/* Focus styles for accessibility */
.btn:focus,
.input-field:focus,
.checkbox:focus {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* SVG icon styles */
svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Smooth transitions */
.btn,
.input-field,
.checkbox-label,
.pass-service-btn {
  transition: all 0.2s ease-in-out;
}
.button-group {
  display: flex !important;
  flex-direction: row !important;
  gap: 8px;
}
</style>