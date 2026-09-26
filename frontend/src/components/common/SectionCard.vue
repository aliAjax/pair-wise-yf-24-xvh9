<script setup lang="ts">
import { formatDate } from "../../utils/formatters";

defineProps<{
  sectionNo: string;
  heading: string;
  content: string;
  meta?: string;
  updatedAt?: string;
}>();
</script>
<template>
  <article class="section-card">
    <header>
      <strong>第{{ sectionNo }}条 · {{ heading }}</strong>
      <span v-if="updatedAt" class="muted">{{ formatDate(updatedAt) }}</span>
    </header>
    <p>{{ content }}</p>
    <em v-if="meta" class="badge">{{ meta }}</em>
  </article>
</template>
