<script setup>
defineProps({
  leftTitle: {
    type: String,
    default: "方案 A",
  },
  rightTitle: {
    type: String,
    default: "方案 B",
  },
  leftLabel: {
    type: String,
    default: "A",
  },
  rightLabel: {
    type: String,
    default: "B",
  },
  vertical: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="code-compare" :class="{ 'is-vertical': vertical }">
    <div class="compare-pane">
      <div class="pane-header neutral-header">
        <span class="label">{{ leftLabel }}</span>
        {{ leftTitle }}
      </div>
      <div class="pane-content">
        <slot name="left"></slot>
      </div>
    </div>

    <div class="compare-pane">
      <div class="pane-header neutral-header">
        <span class="label">{{ rightLabel }}</span>
        {{ rightTitle }}
      </div>
      <div class="pane-content">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
  align-items: start;
}

@media (max-width: 768px) {
  .code-compare {
    grid-template-columns: 1fr;
  }
}

.code-compare.is-vertical {
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

.neutral-header {
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  line-height: 1;
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
