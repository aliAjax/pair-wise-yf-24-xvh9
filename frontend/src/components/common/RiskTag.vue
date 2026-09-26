<script setup lang="ts">
import { computed } from "vue";
import { formatRisk } from "../../utils/formatters";

const props = defineProps<{ level: string }>();
const tone = computed(() => `risk-${props.level.toLowerCase()}`);
</script>

<template>
  <span class="badge" :class="tone">{{ formatRisk(level) }}风险</span>
</template>
