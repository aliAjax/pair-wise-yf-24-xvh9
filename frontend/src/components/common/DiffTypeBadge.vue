<script setup lang="ts">
import { computed } from "vue";
import { formatDiffType } from "../../utils/formatters";

const props = defineProps<{ value: string }>();
const tone = computed(() => `diff-${props.value.toLowerCase()}`);
</script>

<template>
  <span class="badge" :class="tone">{{ formatDiffType(value) }}</span>
</template>
