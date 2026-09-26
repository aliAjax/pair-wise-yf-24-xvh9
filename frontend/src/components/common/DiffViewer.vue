<script setup lang="ts">
import { ref, computed } from "vue";
import type { DiffRow } from "../../hooks/useTextDiff";
import { DiffType } from "../../constants/DiffType";
import { formatDiffType } from "../../utils/formatters";
import DiffTypeBadge from "./DiffTypeBadge.vue";
import RiskTag from "./RiskTag.vue";
import EmptyState from "./EmptyState.vue";

const props = defineProps<{ rows: DiffRow[] }>();

const filter = ref<string>("ALL");
const filtered = computed(() =>
  filter.value === "ALL" ? props.rows : props.rows.filter((row) => row.diff_type === filter.value)
);
const expanded = ref<string | null>(null);

function countOf(type: string) {
  return props.rows.filter((row) => row.diff_type === type).length;
}
</script>

<template>
  <div class="diff-viewer">
    <div class="filter-bar">
      <button :class="{ active: filter === 'ALL' }" @click="filter = 'ALL'">全部 {{ rows.length }}</button>
      <button
        v-for="type in DiffType"
        :key="type"
        :class="{ active: filter === type }"
        @click="filter = type"
      >
        {{ formatDiffType(type) }} {{ countOf(type) }}
      </button>
    </div>
    <EmptyState v-if="filtered.length === 0" message="该筛选条件下没有差异条款" />
    <article v-for="row in filtered" :key="row.section_no" class="diff-row">
      <header @click="expanded = expanded === row.section_no ? null : row.section_no">
        <strong class="section-no">{{ row.section_no }}</strong>
        <span class="heading">{{ row.heading }}</span>
        <DiffTypeBadge :value="row.diff_type" />
        <RiskTag :level="row.risk_level" />
      </header>
      <div v-if="expanded === row.section_no" class="diff-body">
        <div class="diff-side old" v-if="row.old_content">
          <p class="side-label">上一版本</p>
          <pre>{{ row.old_content }}</pre>
        </div>
        <div class="diff-side new" v-if="row.new_content">
          <p class="side-label">当前版本</p>
          <pre>{{ row.new_content }}</pre>
        </div>
      </div>
    </article>
  </div>
</template>
