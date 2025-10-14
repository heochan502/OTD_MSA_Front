<script setup></script>

<template>
  <div class="card-wrap otd-top-margin">
    <div class="otd-box-style otd-shadow first">
      <img class="medal" src="/image/challenge/medal1.png" alt="1" />
      <span class="otd-caption"
        >당신은 만점 챌린저!<br />
        31일 개근 달성!</span
      >
      <div>
        <img class="point" src="/image/main/point.png" alt="point" />
        <span class="otd-body-3">100P</span>
      </div>
    </div>
    <div class="otd-box-style otd-shadow second">
      <img class="medal" src="/image/challenge/medal2.png" alt="2" />
      <span class="otd-caption"
        >멈추지 않는 열정! <br />
        25일 달성!</span
      >
      <div>
        <img class="point" src="/image/main/point.png" alt="point" />
        <span class="otd-body-3">70P</span>
      </div>
    </div>
    <div class="otd-box-style otd-shadow third">
      <img class="medal" src="/image/challenge/medal3.png" alt="3" />
      <span class="otd-caption"
        >작지만 확실한 성취!<br />
        20일 달성!</span
      >
      <div>
        <img class="point" src="/image/main/point.png" alt="point" />
        <span class="otd-body-3">50P</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-wrap {
  display: flex;
  gap: 15px;
  justify-content: center;
  .otd-box-style {
    display: flex;
    min-width: 107px;
    min-height: 132px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 10px;
  }
}
.first {
  border: 2px solid #ffba57;
}
.second {
  border: 2px solid #9e9e9e;
}
.third {
  border: 2px solid #ce7430;
}
.medal {
  width: 25px;
}
.point {
  width: 16px;
}
</style>
