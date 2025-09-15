
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/OTD'

// HTTP 요청 헬퍼 함수
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API 요청 에러:', error)
    throw error
  }
}

// 이메일 인증코드 발송
export const sendEmailVerification = async (data) => {
  try {
    const response = await apiRequest('/user/email/send-verification', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return { success: true, message: response.message || '인증코드가 발송되었습니다.' }
  } catch (error) {
    throw new Error(error.message || '인증코드 발송에 실패했습니다.')
  }
}

// 이메일 인증코드 확인
export const verifyEmailCode = async (data) => {
  try {
    const response = await apiRequest('/user/email/verify-code', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (response.resultData === true) {
      return { success: true, message: response.message || '이메일 인증이 완료되었습니다.' }
    } else {
      throw new Error(response.message || '인증코드가 일치하지 않습니다.')
    }
  } catch (error) {
    throw new Error(error.message || '인증코드 확인에 실패했습니다.')
  }
}

// 아이디 중복 확인
export const checkUidDuplicate = async (uid) => {
  try {
    const response = await apiRequest(`/user/check-uid/${uid}`)
    return { 
      data: { 
        available: response.resultData.isAvailable 
      } 
    }
  } catch (error) {
    throw new Error(error.message || '아이디 중복 확인에 실패했습니다.')
  }
}

// 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickName) => {
  try {
    const response = await apiRequest(`/user/check-nickname/${nickName}`)
    return { 
      data: { 
        available: response.resultData.isAvailable 
      } 
    }
  } catch (error) {
    throw new Error(error.message || '닉네임 중복 확인에 실failed했습니다.')
  }
}

// 중복가입 확인 (CI/DI)
export const checkDuplicateUser = async (ci, di) => {
  try {
    const response = await apiRequest('/user/check-duplicate', {
      method: 'POST',
      body: JSON.stringify({ ci, di })
    })
    return { 
      data: { 
        isDuplicate: response.resultData.isDuplicate 
      } 
    }
  } catch (error) {
    throw new Error(error.message || '중복가입 확인에 실패했습니다.')
  }
}

// 회원가입
export const join = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/join`, {
      method: 'POST',
      body: formData // FormData는 Content-Type을 자동으로 설정
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return { 
      success: true, 
      message: result.message || '회원가입이 완료되었습니다!',
      data: result.resultData 
    }
  } catch (error) {
    console.error('회원가입 API 에러:', error)
    throw error
  }
}

// 로그인
export const login = async (loginData) => {
  try {
    const response = await apiRequest('/user/login', {
      method: 'POST',
      body: JSON.stringify(loginData)
    })
    
    return {
      success: true,
      message: response.message || '로그인 성공',
      data: response.resultData
    }
  } catch (error) {
    throw new Error(error.message || '로그인에 실패했습니다.')
  }
}

// 로그아웃
export const logout = async () => {
  try {
    const response = await apiRequest('/user/logout', {
      method: 'POST'
    })
    
    // 로컬 스토리지 클리어
    localStorage.removeItem('user')
    sessionStorage.clear()
    
    return {
      success: true,
      message: response.message || '로그아웃되었습니다.'
    }
  } catch (error) {
    // 로그아웃 실패해도 로컬 데이터는 삭제
    localStorage.removeItem('user')
    sessionStorage.clear()
    throw new Error(error.message || '로그아웃 처리 중 오류가 발생했습니다.')
  }
}

// 현재 로그인한 사용자 정보 가져오기
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('사용자 정보 파싱 에러:', error)
    return null
  }
}

// 사용자 정보 저장
export const saveUserInfo = (userInfo) => {
  localStorage.setItem('user', JSON.stringify(userInfo))
}

// 로그인 상태 확인
export const isLoggedIn = () => {
  const user = getCurrentUser()
  return user !== null
}