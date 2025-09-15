<script setup>
const props = defineProps({ post: { type: Object, required: true } });
</script>

<template>
  <article class="card">
    <div class="meta">
      <span class="avatar" aria-hidden="true"></span>
      <div class="meta-text">
        <div class="author-row">
          <span class="author">{{ post.author }}</span>
          <span class="time">· {{ post.time }}</span>
        </div>
        <div class="badge">인기</div>
      </div>
      <div class="right-skel" aria-hidden="true"></div>
    </div>

    <h3 class="title">{{ post.title }}</h3>

    <div class="stats">
      <span class="like">❤️ {{ post.likes }}</span>
      <span class="comment">💬 {{ post.comments }}</span>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  row-gap: 8px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eaeaea;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.06);
}
.meta-text {
  flex: 1;
  min-width: 0;
}
.author-row {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 12px;
}
.author {
  color: var(--color-typo-secondary);
  font-weight: 600;
}
.time {
  color: var(--color-typo-caption);
}
.badge {
  display: inline-block;
  margin-top: 2px;
  background: #ffedcf;
  color: #ff9f1c;
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
}
.right-skel {
  width: 74px;
  height: 44px;
  border-radius: 999px;
  background: #ececec;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.06);
}
.title {
  font-size: var(--fs-body-1);
  font-weight: var(--fw-bold);
  color: var(--color-typo-primary);
}
.stats {
  display: flex;
  gap: 12px;
  color: var(--color-typo-secondary);
  font-size: 12px;
}
</style>
