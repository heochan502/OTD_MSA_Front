import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';

const DEFAULT_PROFILE = '/otd/image/main/default-profile.png';
const FILE_URL = import.meta.env.VITE_BASE_URL;
export const useAuthenticationStore = defineStore(
  'authentication',
  () => {
    const state = reactive({
      signedUser: {
        userId: 0,
        nickName: '',
        email: '',
        pic: DEFAULT_PROFILE,
        point: 0,
        xp: 0,
        challengeRole: '',
        userRole: '',
        providerType: null,         
        onboardingCompleted: false,
      },
      isSigned: false,
    });

    const setSignedUser = (signedUser) => {
      state.isSigned = true;
      state.signedUser = {
        ...signedUser,
        pic: formattedUserPic(signedUser),
      };
    };

    const formattedUserPic = (user) => {
      return user.pic && user.pic.trim() !== ''
        ? `${FILE_URL}/profile/${user.userId}/${user.pic}`
        : DEFAULT_PROFILE;
    };

    const setSignedUserPic = (pic) => {
      state.signedUser.pic = pic;
    };

    const setPoint = (point) => {
      state.signedUser.point = point;
    };

    const setChallengeRole = (challengeRole) => {
      state.signedUser.challengeRole = challengeRole;
    };

    const setNickname = (nickname) => {
      state.signedUser.nickName = nickname;
    };
        // ⭐ 추가: 온보딩 완료 처리
    const completeOnboarding = async (surveyScore, agreedTermsIds) => {
      try {
        const response = await axios.post(
          '/OTD/onboarding/complete',
          {
            surveyScore: surveyScore,
            agreedTermsIds: agreedTermsIds
          },
          {
            params: { userId: state.signedUser.userId }
          }
        );

        if (response.data.success) {
          // 온보딩 완료 상태 업데이트
          state.signedUser.onboardingCompleted = true;
        }

        return response.data;
      } catch (error) {
        console.error('온보딩 완료 실패:', error);
        throw error;
      }
    };

    // ⭐ 추가: 온보딩 필요 여부 확인
    const needsOnboarding = () => {
      return state.signedUser.providerType && 
             !state.signedUser.onboardingCompleted;
    };

    const logout = async () => {
      console.log('logout 처리');
      state.signedUser = { userId: 0, nickName: '', pic: DEFAULT_PROFILE };
      state.isSigned = false;
    };

    return {
      state,
      setSignedUser,
      setSignedUserPic,
      logout,
      setPoint,
      setChallengeRole,
      formattedUserPic,
      setNickname,
      completeOnboarding,   
      needsOnboarding, 
    };
  },
  { persist: true }
);
