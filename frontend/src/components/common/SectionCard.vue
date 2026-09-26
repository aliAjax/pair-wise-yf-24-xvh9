<script setup lang="ts">
import type { PolicySection } from "../../types/PolicySection";
import RiskTag from "./RiskTag.vue";

defineProps<{ section: PolicySection; readonly?: boolean }>();
const emit = defineEmits<{ changeRisk: [id: number, level: string] }>();

const LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
</script>

<template>
  <article class="section-card">
    <header>
      <strong class="section-no">{{ section.section_no }}</strong>
      <span class="heading">{{ section.heading }}</span>
      <span class="badge">{{ section.category }}</span>
      <RiskTag :level="section.risk_level" />
    </header>
    <pre class="section-content">{{ section.content }}</pre>
    <footer v-if="!readonly">
      <label>
        风险等级
        <select :value="section.risk_level" @change="emit('changeRisk', section.id, ($event.target as HTMLSelectElement).value)">
          <option v-for="level in LEVELS" :key="level" :value="level">{{ level }}</option>
        </select>
      </label>
      <slot name="actions" />
    </footer>
  </article>
</template>
