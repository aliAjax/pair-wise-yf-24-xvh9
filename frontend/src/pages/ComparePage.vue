<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { useTextDiff } from "../hooks/useTextDiff";
import { DiffType } from "../constants/DiffType";
import { formatDiffType } from "../utils/formatters";
import RiskTag from "../components/common/RiskTag.vue";
import DiffViewer from "../components/common/DiffViewer.vue";
import EmptyState from "../components/common/EmptyState.vue";
import type { SectionDiff } from "../types/SectionDiff";

const store = usePolicyDocumentStore();
const { rows, sections } = storeToRefs(store);

const oldId = ref<number>(0);
const newId = ref<number>(0);
const selected = ref<SectionDiff | null>(null);

const oldSections = computed(() => sections.value.filter((s) => s.document_id === oldId.value).map((s) => ({ section_no: s.section_no, heading: s.heading, content: s.content })));
const newSections = computed(() => sections.value.filter((s) => s.document_id === newId.value).map((s) => ({ section_no: s.section_no, heading: s.heading, content: s.content })));
const { filteredRows, counts, diffType } = useTextDiff(oldSections, newSections);

const filterLabels: Record<string, string> = { ADDED: "新增", REMOVED: "移除", MODIFIED: "改写", MOVED: "移动", UNCHANGED: "未变" };

const pick = (row: SectionDiff) => { selected.value = row; };

onMounted(async () => {
  await store.load();
  if (rows.value.length >= 2) {
    oldId.value = rows.value[0].id;
    newId.value = rows.value[1].id;
  }
});
</script>

<template>
  <div class="page-stack">
    <section class="panel">
      <div class="version-picker">
        <label>旧版
          <select v-model.number="oldId"><option v-for="doc in rows" :key="doc.id" :value="doc.id">{{ doc.title }} {{ doc.version_label }}</option></select>
        </label>
        <label>新版
          <select v-model.number="newId"><option v-for="doc in rows" :key="doc.id" :value="doc.id">{{ doc.title }} {{ doc.version_label }}</option></select>
        </label>
        <div class="filter-chips">
          <button type="button" :class="{ active: diffType === '' }" @click="diffType = ''">全部 {{ counts.ADDED + counts.REMOVED + counts.MODIFIED + counts.MOVED + counts.UNCHANGED }}</button>
          <button v-for="type in DiffType" :key="type" type="button" :class="{ active: diffType === type }" @click="diffType = type">{{ filterLabels[type] }} {{ counts[type as keyof typeof counts] }}</button>
        </div>
      </div>
    </section>
    <section class="panel">
      <h2>按条款编号的差异清单</h2>
      <EmptyState v-if="filteredRows.length === 0" text="选择两个版本后查看条款差异" />
      <table v-else class="data-table">
        <thead><tr><th>条款</th><th>标题</th><th>差异类型</th><th>风险</th><th></th></tr></thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.section_no" :class="{ selected: selected?.section_no === row.section_no }" @click="pick(row)">
            <td>第{{ row.section_no }}条</td>
            <td>{{ row.heading }}</td>
            <td><span :class="`diff-type diff-${row.diff_type.toLowerCase()}`">{{ formatDiffType(row.diff_type) }}</span></td>
            <td><RiskTag :level="row.risk_level" /></td>
            <td>{{ row.category }}</td>
          </tr>
        </tbody>
      </table>
    </section>
    <section v-if="selected" class="panel">
      <h2>第{{ selected.section_no }}条正文对比</h2>
      <DiffViewer :old-content="selected.old_content" :new-content="selected.new_content" :diff-type="selected.diff_type" />
    </section>
  </div>
</template>
