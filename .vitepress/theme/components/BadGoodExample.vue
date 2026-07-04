<script setup>
defineProps({
  badTitle: {
    type: String,
    default: "错误写法 (Bad)",
  },
  goodTitle: {
    type: String,
    default: "正确写法 (Good)",
  },
  vertical: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="bad-good-example" :class="{ 'is-vertical': vertical }">
    <div class="compare-pane bad-pane">
      <div class="pane-header bad-header">
        <span class="icon">❌</span>
        {{ badTitle }}
      </div>
      <div class="pane-content">
        <slot name="bad"></slot>
      </div>
    </div>

    <div class="compare-pane good-pane">
      <div class="pane-header good-header">
        <span class="icon">✅</span>
        {{ goodTitle }}
      </div>
      <div class="pane-content">
        <slot name="good"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bad-good-example {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
  align-items: start;
}

@media (max-width: 768px) {
  .bad-good-example {
    grid-template-columns: 1fr;
  }
}

.bad-good-example.is-vertical {
  grid-template-columns: 1fr;
}

.compare-pane {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.pane-header {
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bad-header {
  background-color: rgba(234, 88, 88, 0.1);
  color: #d85656;
}

.good-header {
  background-color: rgba(66, 184, 131, 0.1);
  color: #349d6e;
}

.pane-content {
  flex: 100%;
  display: flex;
}

.pane-content :deep(div[class*="language-"]) {
  margin: 0 !important;
  border-radius: 0 !important;
  display: flex;
  flex: 100%;
}
</style>
