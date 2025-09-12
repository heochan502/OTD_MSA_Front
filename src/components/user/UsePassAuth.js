import { ref } from 'vue'

// 통신사별 PASS 서비스 설정
export const PASS_SERVICES = {
  SKT: {
    name: 'SKT 인증',
    serviceId: 'SK_TPASS',
    authUrl: 'https://tauth.telecom.co.kr/bas/oauth/oauth_form.omp',
  },
  KT: {
    name: 'KT 인증',
    serviceId: 'KT_PASS',
    authUrl: 'https://auth.kt.com/oauth/oauth_form.omp',
  },
  LGU: {
    name: 'U+ 인증',
    serviceId: 'LGU_PASS',
    authUrl: 'https://uauth.lguplus.co.kr/oauth/oauth_form.omp',
  },
}

// PASS 인증 매니저 클래스
class PassAuthManager {
  constructor(config) {
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
    this.redirectUri = config.redirectUri
    this.apiBaseUrl = config.apiBaseUrl || '/api/auth'
  }

  // PASS 인증 요청 생성
  createAuthRequest(provider) {
    const service = PASS_SERVICES[provider]
    if (!service) {
      throw new Error(`지원하지 않는 PASS 서비스: ${provider}`)
    }

    const authParams = {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'profile mobile ci di',
      response_type: 'code',
      state: this.generateState(),
      serviceId: service.serviceId,
      authType: 'mobile',
      popupYn: 'Y'
    }

    return {
      url: service.authUrl,
      params: authParams,
      service: service
    }
  }

  // 상태값 생성 (CSRF 방지)
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // 인증 팝업 열기
  openAuthPopup(provider) {
    return new Promise((resolve, reject) => {
      try {
        const authRequest = this.createAuthRequest(provider)
        const params = new URLSearchParams(authRequest.params).toString()
        const authUrl = `${authRequest.url}?${params}`

        // 팝업 창 설정
        const popupOptions = [
          'width=450',
          'height=650',
          'scrollbars=yes',
          'resizable=yes',
          'toolbar=no',
          'menubar=no',
          'location=no',
          'directories=no',
          'status=no',
          'left=' + (screen.width / 2 - 225),
          'top=' + (screen.height / 2 - 325)
        ].join(',')

        const popup = window.open(authUrl, 'passAuth', popupOptions)

        if (!popup) {
          reject(new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.'))
          return
        }

        // 팝업 포커스
        popup.focus()

        // 팝업 모니터링
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            reject(new Error('사용자가 인증을 취소했습니다.'))
          }
        }, 1000)

        // 메시지 리스너 (인증 완료 시)
        const messageListener = (event) => {
          // 보안을 위해 origin 체크
          if (event.origin !== window.location.origin) return

          if (event.data.type === 'PASS_AUTH_SUCCESS') {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            popup.close()
            resolve(event.data.result)
          } else if (event.data.type === 'PASS_AUTH_ERROR') {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            popup.close()
            reject(new Error(event.data.error))
          }
        }

        window.addEventListener('message', messageListener)

        // 타임아웃 (5분)
        setTimeout(() => {
          if (!popup.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            popup.close()
            reject(new Error('인증 시간이 초과되었습니다.'))
          }
        }, 300000)

      } catch (error) {
        reject(error)
      }
    })
  }

  // 인증 코드로 사용자 정보 조회
  async getUserInfo(authCode, state, provider) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/pass/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authCode,
          state,
          provider,
          redirectUri: this.redirectUri
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '인증 정보 확인에 실패했습니다.')
      }

      return await response.json()
    } catch (error) {
      console.error('PASS 인증 확인 에러:', error)
      throw error
    }
  }
}

// Vue 컴포저블
export function usePassAuth() {
  const isLoading = ref(false)
  const error = ref('')

  // 환경 변수에서 설정 읽기
  const authManager = new PassAuthManager({
    clientId: import.meta.env.VITE_PASS_CLIENT_ID || process.env.VUE_APP_PASS_CLIENT_ID || 'test_client_id',
    clientSecret: import.meta.env.VITE_PASS_CLIENT_SECRET || process.env.VUE_APP_PASS_CLIENT_SECRET || 'test_client_secret',
    redirectUri: `${window.location.origin}/auth/pass/callback`,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || process.env.VUE_APP_API_BASE_URL || '/api'
  })

  // PASS 인증 실행 (개발용 시뮬레이션 포함)
  const authenticateWithPass = async (provider) => {
    isLoading.value = true
    error.value = ''

    try {
      console.log(`${provider} PASS 인증 시작`)
      
      // 개발 환경에서는 시뮬레이션으로 처리
      if (import.meta.env.DEV || process.env.NODE_ENV === 'development') {
        console.log('개발 환경: PASS 인증 시뮬레이션')
        
        // 2초 대기 후 성공 응답
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        return {
          success: true,
          data: {
            name: '홍길동',
            phone: '010-1234-5678',
            birthDate: '1990-01-01',
            gender: 'M',
            ci: 'test_ci_12345',
            di: 'test_di_12345',
            authToken: 'test_auth_token_12345',
            provider: provider
          }
        }
      }
      
      // 실제 PASS 인증 (프로덕션)
      // 1. 인증 팝업 열기
      const authResult = await authManager.openAuthPopup(provider)
      console.log('인증 코드 받음:', authResult)
      
      // 2. 인증 코드로 사용자 정보 조회
      const userInfo = await authManager.getUserInfo(
        authResult.code, 
        authResult.state, 
        provider
      )
      console.log('사용자 정보 받음:', userInfo)

      return {
        success: true,
        data: {
          name: userInfo.name,
          phone: formatPhoneNumber(userInfo.phone),
          birthDate: userInfo.birthDate,
          gender: userInfo.gender,
          ci: userInfo.ci, // 연계정보
          di: userInfo.di, // 중복가입확인정보
          authToken: userInfo.authToken,
          provider: provider
        }
      }
    } catch (err) {
      console.error('PASS 인증 에러:', err)
      error.value = err.message
      return {
        success: false,
        error: err.message
      }
    } finally {
      isLoading.value = false
    }
  }

  // 휴대폰 번호 포맷팅
  const formatPhoneNumber = (phone) => {
    if (!phone) return ''
    
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '')
    
    // 010-1234-5678 형식으로 변환
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
    
    return phone
  }

  // PASS 인증 가능 여부 체크
  const checkPassSupport = () => {
    // 모바일 환경 체크
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    return {
      isMobile,
      isSupported: true,
      message: isMobile ? 'PASS 앱으로 인증을 진행합니다.' : '모바일에서 PASS 인증을 권장합니다.'
    }
  }

  return {
    isLoading,
    error,
    authenticateWithPass,
    checkPassSupport,
    PASS_SERVICES
  }
}

// 인증 콜백 페이지 유틸리티
export const handlePassCallback = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')

    if (error) {
      const errorMessage = errorDescription || error
      throw new Error(errorMessage)
    }

    if (code && state) {
      // 부모 창으로 인증 성공 메시지 전송
      if (window.opener) {
        window.opener.postMessage({
          type: 'PASS_AUTH_SUCCESS',
          result: { code, state }
        }, window.location.origin)
      }
      
      return { success: true, code, state }
    } else {
      throw new Error('인증 정보가 없습니다.')
    }
  } catch (error) {
    // 부모 창으로 에러 메시지 전송
    if (window.opener) {
      window.opener.postMessage({
        type: 'PASS_AUTH_ERROR',
        error: error.message
      }, window.location.origin)
    }
    
    return { success: false, error: error.message }
  } finally {
    // 팝업 창 닫기
    if (window.opener) {
      setTimeout(() => window.close(), 1000)
    }
  }
}