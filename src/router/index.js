import { createRouter, createWebHistory } from "vue-router";
import { useAuthenticationStore } from "@/stores/user/authentication";

// 공통 뷰
import Home from "@/views/HomeView.vue";

// 커뮤니티
import Community from "@/views/community/CommunityView.vue";
import CategoryFeedView from "@/views/community/categories/CategoryFeedView.vue";
import PostDetailView from "@/views/community/PostDetailView.vue";
import WritePostView from "@/views/community/WritePostView.vue";

// 챌린지
import ChallengeHome from "@/views/challenge/ChallengeHome.vue";
import ChallengeAllList from "@/views/challenge/ChallengeAllList.vue";
import ChallengeCategoryList from "@/views/challenge/ChallengeCategoryList.vue";
import ChallengePer from "@/views/challenge/ChallengePer.vue";
import ChallengeDay from "@/views/challenge/ChallengeDay.vue";

//유저
import Login from "@/views/user/Login.vue";
import Join from "@/views/user/Join.vue";
import Profile from "@/views/user/Profile.vue";
import Inquiry from "@/views/user/Inquiry.vue";
import NickName from "@/views/user/Nickname.vue";
import Email from "@/views/user/Email.vue";
import Password from "@/views/user/password.vue";
import FindId from "@/views/user/FindId.vue";
import MyInquiries from "@/views/user/InquiryList.vue";
import ModifyProfile from "@/views/user/ModifyProfile.vue";
import ModifyPassword from "@/views/user/ModifyPassword.vue";
import PointHistory from "@/views/user/pointHistory.vue";
import Term from "@/views/user/Term.vue";
import Oauth2 from "@/views/auth/OAuth2Handler.vue";
import Onboarding from "@/views/user/Onboarding.vue";

//마이페이지
import MyPost from "@/views/user/MyPost.vue";
import MyLike from "@/views/user/MyLike.vue";
import MyComment from "@/views/user/MyComment.vue";

// 포인트샵
import PointDashboardView from "@/views/pointshop/PointDashboardView.vue";
import PointPurchaseHistoryView from "@/views/pointshop/PointPurchaseHistoryView.vue";
import PointRechargeHistoryView from "@/views/pointshop/PointRechargeHistoryView.vue";
import AdminPointDashboardView from "@/views/pointshop/AdminPointDashboardView.vue";
import AdminPointChargeView from "@/views/pointshop/AdminPointChargeView.vue";

//식단
import MealMainView from "@/views/meal/MealMainView.vue";
import MealDetailView from "@/views/meal/MealDetailView.vue";
import MealRecordView from "@/views/meal/MealRecordView.vue";
import MealFoodSearchView from "@/views/meal/MealFoodSearchView.vue";

// 운동
import ExerciseMain from "@/views/exercise/ExerciseMain.vue";
import ExerciseRecord from "@/views/exercise/ExerciseRecord.vue";
import ExerciseRecordForm from "@/views/exercise/ExerciseRecordForm.vue";
import ExerciseRecordDetail from "@/views/exercise/ExerciseRecordDetail.vue";

// 체성분
import BodyCompositionStatics from "@/views/body_composition/BodyCompositionStatics.vue";
import RecordFilterList from "@/views/body_composition/RecordFilterList.vue";

// 알람
import Notifications from "@/views/notification/NotificationsView.vue";

// 카테고리 라벨 맵
const CATEGORY_LABEL = {
  free: "자유수다",
  diet: "다이어트",
  work: "운동",
  love: "연애",
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
      meta: { headerType: "logo", showUserPanel: true },
    },
    {
      path: "/community",
      name: "Community",
      component: Community,
      meta: { headerType: "title", title: "커뮤니티", showUserPanel: false },
    },
    {
      path: "/community/write",
      name: "CommunityWrite",
      component: WritePostView,
      meta: { headerType: "title", title: "게시글 작성", showUserPanel: false },
    },
    {
      path: "/community/post/:id(\\d+)/edit",
      name: "CommunityEdit",
      component: WritePostView,
      props: (route) => ({ id: Number(route.params.id), mode: "edit" }),
      meta: { headerType: "title", title: "게시글 수정", showUserPanel: false },
    },
    {
      path: "/community/:category(free|diet|work|love)",
      name: "CommunityCategory",
      component: CategoryFeedView,
      props: true,
      meta: {
        headerType: "title",
        showUserPanel: false,
        title: (route) => CATEGORY_LABEL[route.params.category] ?? "",
      },
    },
    {
      path: "/community/post/:id(\\d+)",
      name: "CommunityPost",
      component: PostDetailView,
      meta: { headerType: "title", title: "커뮤니티", showUserPanel: false },
      props: true,
    },
    {
      path: "/community/post/:id/edit",
      name: "CommunityEdit",
      component: () => import("@/views/community/EditPostView.vue"),
    },
    {
      path: "/test",
      name: "Test",
      component: () => import("@/components/test.vue"),
      meta: { headerType: "title", title: "테스트", showUserPanel: false },
    },
    {
      path: "/challenge",
      name: "ChallengeHome",
      component: ChallengeHome,
      meta: { headerType: "title", title: "챌린지", showUserPanel: false },
    },
    {
      path: "/challenge/alllist",
      name: "ChallengeAllList",
      component: ChallengeAllList,
      meta: { headerType: "title", title: "챌린지 목록", showUserPanel: false },
    },
    {
      path: "/challenge/weeklylist",
      name: "ChallengeweeklyList",
      component: ChallengeCategoryList,
      meta: {
        headerType: "title",
        title: "주간 챌린지 목록",
        showUserPanel: false,
      },
    },
    {
      path: "/challenge/competitionlist",
      name: "ChallengecompetitionList",
      component: ChallengeCategoryList,
      meta: {
        headerType: "title",
        title: "월간 경쟁챌린지 목록",
        showUserPanel: false,
      },
    },
    {
      path: "/challenge/personallist",
      name: "ChallengepersonalList",
      component: ChallengeCategoryList,
      meta: {
        headerType: "title",
        title: "월간 개인챌린지 목록",
        showUserPanel: false,
      },
    },
    { path: "/user/login", name: "login", component: Login },
    {
      path: "/challenge/detail/per/:id",
      name: "ChallengePer",
      component: ChallengePer,
      props: (route) => ({
        id: Number(route.params.id),
        name: route.params.name,
      }),
      meta: {
        headerType: "title",
        title: "",
        showUserPanel: false,
      },
    },
    {
      path: "/challenge/detail/day/:id",
      name: "ChallengeDay",
      component: ChallengeDay,
      props: (route) => ({
        id: Number(route.params.id),
        name: route.params.name,
      }),
      meta: {
        headerType: "title",
        title: "",

        showUserPanel: false,
      },
    },

    { path: "/user/login", name: "login", component: Login },
    {
      path: "/user/join",
      name: "join",
      component: Join,
    },
    {
      path: "/user/profile",
      name: "profile",
      component: Profile,
    },
    {
      path: "/user/email/inquiry",
      name: "Inquiry",
      component: Inquiry,
    },
    {
      path: "/user/modifyProfile",
      name: "modifyProfile",
      component: ModifyProfile,
    },
    {
      path: "/user/pointhistory",
      name: "pointHistory",
      component: PointHistory,
    },
    {
      path: "/user/term",
      name: "term",
      component: Term,
    },
    {
      path: "/user/findid",
      name: "findId",
      component: FindId,
    },
    {
      path: "/fe/redirect",
      name: "oauth2",
      component: Oauth2,
    },
    {
      path: "/user/my-inquiries",
      name: "myInquiries",
      component: MyInquiries,
    },
    {
      path: "/user/nickname",
      name: "nickName",
      component: NickName,
    },
    {
      path: "/user/email",
      name: "email",
      component: Email,
    },
    {
      path: "/user/modifypassword",
      name: "modifyPassword",
      component: ModifyPassword,
    },
    {
      path: "/user/password",
      name: "password",
      component: Password,
    },
    {
      path: "/user/post",
      name: "myPost",
      component: MyPost,
    },
    {
      path: "/user/like",
      name: "myLike",
      component: MyLike,
    },
    {
      path: "/user/comment",
      name: "myComment",
      component: MyComment,
    },
    {
      path: "/user/onboarding",
      name: "Onboarding",
      component: Onboarding,
      meta: {
        headerType: "title",
        title: "온보딩",
        showUserPanel: false,
      },
    },
    {
      path: '/pointshop',
      name: 'PointDashboard',
      component: PointDashboardView,
      meta: { headerType: 'title', title: '포인트샵', showUserPanel: false },
    },
    {
      path: '/pointshop/purchase-history',
      name: 'PointPurchaseHistory',
      component: PointPurchaseHistoryView,
      meta: { headerType: 'title', title: '구매 내역', showUserPanel: false },
    },
    {
      path: '/pointshop/recharge-history',
      name: 'PointRechargeHistory',
      component: PointRechargeHistoryView,
      meta: { headerType: 'title', title: '충전 내역', showUserPanel: false },
    },
    {
      path: '/admin/pointshop/dashboard',
      name: 'AdminPointDashboard',
      component: AdminPointDashboardView,
      meta: { headerType: 'title', title: '포인트샵 통계 대시보드', requiresAdmin: true },
    },
    {
      path: '/admin/pointshop/charge',
      name: 'AdminPointCharge',
      component: AdminPointChargeView,
      meta: { headerType: 'title', title: '포인트 충전 (관리자)', requiresAdmin: true },
    },
    {
      path: "/meal",
      name: "MealMainView",
      component: MealMainView,
      meta: { headerType: "title", title: "식단", showUserPanel: false },
    },
    {
      path: "/exercise/main",
      name: "ExerciseMain",
      component: ExerciseMain,
      meta: { headerType: "title", title: "운동", showUserPanel: false },
    },
    {
      path: "/exercise/record",
      name: "ExerciseRecord",
      component: ExerciseRecord,
      meta: { headerType: "title", title: "이달의 기록", showUserPanel: false },
    },
    {
      path: "/exercise/record_form",
      name: "ExerciseRecordForm",
      component: ExerciseRecordForm,
      meta: { headerType: "title", title: "기록 추가", showUserPanel: false },
    },
    {
      path: "/exercise/record/:exerciseRecordId",
      name: "ExerciseRecordDeatil",
      component: ExerciseRecordDetail,
      meta: { headerType: "title", title: "운동 기록", showUserPanel: false },
    },
    {
      path: "/exercise/body_composition",
      name: "BodyCompositionStatics",
      component: BodyCompositionStatics,
      meta: { headerType: "title", title: "체성분 변화", showUserPanel: false },
    },
    {
      path: "/exercise/body_composition/filter",
      name: "BodyCompositionFilter",
      component: RecordFilterList,
      meta: { headerType: "title", title: "데이터 필터", showUserPanel: false },
    },
    {
      path: "/meal/detail",
      name: "MealDetailView",
      component: MealDetailView,
      meta: { headerType: "title", title: "음식 상세", showUserPanel: false },
    },
    {
      path: "/meal/water",
      name: "WaterLog",
      component: () => import("@/views/meal/WaterLogView.vue"), // lazy 권장
      meta: { headerType: "title", title: "물 섭취량", showUserPanel: false },
    },
    {
      path: "/meal/food-search",
      name: "MealFoodSearchView",
      component: MealFoodSearchView,
      meta: { headerType: "title", title: "식단 기록", showUserPanel: false },
    },
    {
      path: "/meal/record",
      name: "MealRecordView",
      component: MealRecordView,
      meta: { headerType: "title", title: "식단 기록", showUserPanel: false },
    },
    {
      path: "/admin",
      // component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: "", // /admin 진입 시 기본 페이지
          name: "AdminDashboard",
          component: () => import("@/views/admin/AdminDashboard.vue"),
        },
        {
          path: "user",
          name: "AdminUser",
          component: () => import("@/views/admin/AdminUser.vue"),
        },
        {
          path: "challenge",
          name: "AdminChallenge",
          component: () => import("@/views/admin/AdminChallenge.vue"),
        },
        {
          path: "/admin/challenge/progress",
          name: "AdminChallengeDetail",
          component: () => import("@/views/admin/AdminChallengeProgress.vue"),
        },
        {
          path: "point",
          name: "AdminPoint",
          component: () => import("@/views/admin/AdminPoint.vue"),
        },
        {
          path: "community",
          name: "AdminCommunity",
          component: () => import("@/views/admin/AdminCommunity.vue"),
        },
        {
          path: "community/detail",
          name: "AdminCommunityDetail",
          component: () => import("@/views/admin/AdminCommunityDetail.vue"),
        },
        {
          path: "exercise",
          name: "AdminExercise",
          component: () => import("@/views/admin/AdminExercise.vue"),
        },
        {
          path: "meal",
          name: "AdminMeal",
          component: () => import("@/views/admin/AdminMeal.vue"),
        },
        {
          path: "qna",
          name: "AdminQnA",
          component: () => import("@/views/admin/AdminQnA.vue"),
        },
        {
          path: "qna/detail",
          name: "AdminQnADetail",
          component: () => import("@/views/admin/AdminQnADetail.vue"),
        },
        {
          path: "statistics",
          name: "AdminStatistics",
          component: () => import("@/views/admin/AdminStatistics.vue"),
        },
        {
          path: "user/detail",
          name: "AdminUserDetail",
          component: () => import("@/views/admin/AdminUserDetail.vue"),
        },
        {
          path: "/notification",
          name: "NotificationsView",
          component: Notifications,
          meta: { title: "내 소식" },
        },
      ],
    },
  ],
});

// 로그인 하지 않아도 이용할 수 있는 Path들
const unSignedPathList = [
  "/user/login",
  "/user/join",
  "/fe/redirect",
  "/user/password",
  "/user/findid",
];
const onboardingExcludedPaths = [
  "/user/onboarding",
  "/user/login",
  "/user/join",
  "/fe/redirect",
];

//navigation guard
router.beforeEach((to, from) => {
  const authenticationStore = useAuthenticationStore();
  const isUnsignedPath = unSignedPathList.some((path) =>
    to.path.startsWith(path)
  );

  // body 클래스 분기
  if (to.path.startsWith("/admin")) {
    document.body.classList.add("is-admin");
  } else {
    document.body.classList.remove("is-admin");
  }
  if (to.path.startsWith("/admin")) {
    const user = authenticationStore.state.signedUser;
    if (!user || (user.userRole !== "ADMIN" && user.userRole !== "MANAGER")) {
      alert("관리자만 접근 가능합니다.");
      return { path: "/" }; // 일반 유저는 홈으로 돌려보내기
    }
  }
  if (
    unSignedPathList.includes(to.path) &&
    authenticationStore.state.isSigned
  ) {
    //로그인 상태에서 /user/login, /user/join 경로로 이동하려고 하면
    return { path: "/" };
  } else if (
    !authenticationStore.state.isSigned &&
    !unSignedPathList.includes(to.path)
  ) {
    console.log("로그아웃 상태에서 접근 불가 경로");
    //로그아웃 상태에서 /user/login, /user/join 경로가 아닌 경우
    return { path: "/user/login" };
  }
  if (
    authenticationStore.state.isSigned &&
    authenticationStore.needsOnboarding()
  ) {
    const isExcluded = onboardingExcludedPaths.some((path) =>
      to.path.startsWith(path)
    );

    if (!isExcluded) {
      console.log("온보딩 미완료 - 온보딩 페이지로 리다이렉트");
      return { path: "/user/onboarding" };
    }
  }
});
export default router;
