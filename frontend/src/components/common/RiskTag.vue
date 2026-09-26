<script setup lang="ts">
import { computed } from "vue";
import { formatRisk } from "../../utils/formatters";

const props = defineProps<{ level: string; plain?: boolean }>();
const className = computed(() => `risk risk-${(props.level ?? "LOW").toLowerCase()}`);
</script>
<template><span :class="className"><em v-if="!plain">●</em>{{ formatRisk(level) }}风险</span></template>
