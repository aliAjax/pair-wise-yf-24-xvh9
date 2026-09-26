<script setup lang="ts">
import { computed } from "vue";
import { formatDiffType } from "../../utils/formatters";

const props = defineProps<{
  oldContent?: string;
  newContent?: string;
  diffType?: string;
  compact?: boolean;
}>();
const typeClass = computed(() => `diff-type diff-${(props.diffType ?? "MODIFIED").toLowerCase()}`);
</script>
<template>
  <div class="diff-viewer" :class="{ compact }">
    <p v-if="diffType" :class="typeClass">{{ formatDiffType(diffType) }}</p>
    <div class="diff-cols">
      <div class="diff-col">
        <label>旧版正文</label>
        <pre>{{ oldContent || "（无）" }}</pre>
      </div>
      <div class="diff-col">
        <label>新版正文</label>
        <pre>{{ newContent || "（无）" }}</pre>
      </div>
    </div>
  </div>
</template>
