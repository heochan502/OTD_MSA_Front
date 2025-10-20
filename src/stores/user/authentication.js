import { reactive, computed, ref } from 'vue';
import { defineStore } from 'pinia';
import router from '@/router';
import axios from '@/services/httpRequester';

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
        gender: '',
        age: '',
        point: 0,
        xp: 0,
        challengeRole: '',
        userRole: '',
        providerType: null,
        onboardingCompleted: 0, // 0 또는 1로 변경
      },
      isSigned: false,
    });

    const setSignedUser = (signedUser) => {
      state.isSigned = true;
      state.signedUser = {
        ...signedUser,
        pic: formattedUserPic(signedUser),
        // onboardingCompleted를 명시적으로 숫자로 변환
        //onboardingCompleted: signedUser.onboardingCompleted === 1 || signedUser.onboardingCompleted === true ? 1 : 0,
      };

      console.log('✅ setSignedUser 호출됨:', {
        userId: state.signedUser.userId,
        providerType: state.signedUser.providerType,
        onboardingCompleted: state.signedUser.onboardingCompleted,
      });
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
      state.signedUser.point = Number(point) || 0;
    };
    const setXp = (xp) => {
      state.signedUser.xp = xp;
    };
    const setChallengeRole = (challengeRole) => {
      state.signedUser.challengeRole = challengeRole;
    };

    const setNickname = (nickname) => {
      state.signedUser.nickName = nickname;
    };

    // 서버에서 최신 포인트 불러오기 (홈/프로필 자동 동기화용)
    const refreshPoint = async () => {
      try {
        const res = await PointRechargeService.getMyBalance();
        const balance =
          typeof res?.data === 'number'
            ? res.data
            : Number(res?.data ?? state.signedUser.point);
        state.signedUser.point = balance;
        console.log('[auth.refreshPoint] 최신 포인트 반영:', balance);
      } catch (err) {
        console.error('[auth.refreshPoint] 포인트 불러오기 실패', err);
      }
    };

    // 온보딩 완료
    const completeOnboarding = async (surveyScore, agreedTermsIds) => {
      try {
        const agreedTermsIdsNumber = agreedTermsIds.map((id) => Number(id));

        const response = await axios.post('/onboarding/complete', {
          surveyScore,
          agreedTermsIds: agreedTermsIdsNumber,
        });

        if (response.data.success) {
          // 온보딩 완료 상태를 1로 설정
          state.signedUser.onboardingCompleted = 1;
          console.log(
            '✅ 온보딩 완료 - onboardingCompleted:',
            state.signedUser.onboardingCompleted
          );
        }

        return response.data;
      } catch (error) {
        console.error('온보딩 완료 실패:', error);
        throw error;
      }
    };

    const needsOnboarding = () => {
      const needs =
        state.signedUser.providerType &&
        state.signedUser.onboardingCompleted === 0;

      // console.log('🔍 needsOnboarding 체크:', {
      //   providerType: state.signedUser.providerType,
      //   onboardingCompleted: state.signedUser.onboardingCompleted,
      //   needs: needs
      // });

      return needs;
    };

    const logout = async () => {
      console.log('logout 처리');
      state.signedUser = {
        userId: 0,
        nickName: '',
        pic: DEFAULT_PROFILE,
        onboardingCompleted: 0,
      };
      state.isSigned = false;
      useAuthenticationStore().$reset();
    };

    return {
      state,
      setSignedUser,
      setSignedUserPic,
      logout,
      setPoint,
      setXp,
      setChallengeRole,
      formattedUserPic,
      setNickname,
      completeOnboarding,
      needsOnboarding,
      refreshPoint,
    };
  },
  { persist: true }
);
