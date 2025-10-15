<script setup>

</script>

<template>
<div>
  <div class="terms-of-service">
    <h1>원투데이 서비스 이용약관</h1>

    <!-- 제1장 총칙 -->
    <h2>제1장 총칙</h2>

    <h3>제1조(목적)</h3>
    <p>이 약관은 원투데이에서 제공하는 이메일 및 서비스의 이용조건과 절차에 관한 사항을 규정함을 목적으로 합니다.</p>

    <h3>제2조(정의)</h3>
    <ol>
      <li><strong>회원</strong> : 이용자 아이디를 부여받은 자</li>
      <li><strong>ID</strong> : 홈페이지가 승인하는 문자 또는 숫자의 조합</li>
      <li><strong>비밀번호</strong> : 비밀 보호를 위해 회원이 설정한 문자·숫자의 조합</li>
    </ol>

    <h3>제3조(효력의 발생과 변경)</h3>
    <ol>
      <li>이 약관의 내용은 홈페이지 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.</li>
      <li>홈페이지는 약관을 변경할 수 있으며, 변경된 약관은 이용자에게 공지함으로써 효력이 발생합니다.</li>
    </ol>

    <h3>제4조(준용규정)</h3>
    <p>약관에 명시되지 않은 사항은 전기통신기본법, 전기통신사업법 및 기타 관련 법령의 규정을 따릅니다.</p>

    <!-- 제2장 서비스 이용계약 -->
    <h2>제2장 서비스 이용계약</h2>

    <h3>제5조(이용계약의 성립)</h3>
    <p>이용계약은 이용자의 이용신청에 대한 홈페이지의 승낙과 이용자의 약관 내용 동의로 성립됩니다.</p>

    <h3>제6조(이용신청)</h3>
    <p>이용신청은 인터넷을 통해 홈페이지에서 제공하는 가입신청서에 기록하여 신청할 수 있습니다.</p>

    <h3>제7조(이용신청의 승낙)</h3>
    <ol>
      <li>회원이 신청서의 모든 사항을 정확히 기재했을 경우 승낙합니다.</li>
      <li>다음 각호에 해당하는 경우에는 승낙하지 않을 수 있습니다.
        <ol type="a">
          <li>현재 거주지가 구청이 아닌 경우</li>
          <li>홈페이지 관할 구역 내에 사무소가 없는 기업체·법인·단체</li>
          <li>이용신청 내용이 허위일 경우</li>
          <li>다른 사람 명의를 사용한 경우</li>
          <li>기타 신청 요건 미비 시</li>
        </ol>
      </li>
    </ol>

    <h3>제8조(계약사항의 변경)</h3>
    <p>회원은 이용신청 시 기재한 사항이 변경되었을 경우, 인터넷을 통해 수정 요청할 수 있습니다.</p>

    <!-- 제3장 계약당사자의 의무 -->
    <h2>제3장 계약당사자의 의무</h2>

    <h3>제9조(홈페이지의 의무)</h3>
    <p>
      홈페이지는 서비스 제공과 관련하여 알고 있는 회원의 신상 정보를 본인 동의 없이 제3자에게 누설·배포하지 않습니다.<br>
      단, 전기통신기본법 등 법률의 규정에 따라 국가기관의 요구, 범죄 수사 목적, 기타 관계법령에서 정한 요청은 제외됩니다.
    </p>

    <h3>제10조(회원의 의무)</h3>
    <ol>
      <li>회원은 서비스를 이용할 때 다음 각호의 행위를 하지 않아야 합니다.
        <ol type="a">
          <li>다른 회원의 ID를 부정하게 사용하는 행위</li>
          <li>서비스에서 얻은 정보를 복제, 출판 또는 제3자에게 제공하는 행위</li>
          <li>홈페이지 및 제3자의 저작권 등 권리 침해 행위</li>
          <li>공공질서 및 미풍양속에 위반되는 내용 유포</li>
          <li>범죄와 결부된다고 판단되는 행위</li>
          <li>기타 관계법령 위반 행위</li>
        </ol>
      </li>
      <li>회원은 서비스를 이용하여 영업활동을 할 수 없으며, 영업활동에 따른 결과에 대해 홈페이지는 책임지지 않습니다.</li>
      <li>회원은 이용권한이나 계약상 지위를 타인에게 양도·증여하거나 담보로 제공할 수 없습니다.</li>
    </ol>
</div>
</div>
</template>


<style scoped>
/* 전체 스타일 */
.terms-of-service {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  font-family: 'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif;
  color: #333;
  line-height: 1.6;
}

.terms-of-service h1 {
  text-align: center;
  font-size: 2em;
  margin-bottom: 30px;
  color: #2c3e50;
}

.terms-of-service h2 {
  font-size: 1.5em;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #34495e;
  border-bottom: 2px solid #e1e1e1;
  padding-bottom: 5px;
}

.terms-of-service h3 {
  font-size: 1.2em;
  margin-top: 20px;
  margin-bottom: 8px;
  color: #2c3e50;
}

.terms-of-service p {
  margin: 8px 0 16px 0;
}

.terms-of-service ol {
  margin: 8px 0 16px 20px;
}

.terms-of-service ol li {
  margin-bottom: 8px;
}
</style>

