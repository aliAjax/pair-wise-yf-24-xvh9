<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { diffSections } from "../hooks/useTextDiff";
import DiffViewer from "../components/common/DiffViewer.vue";
import StatCard from "../components/common/StatCard.vue";
import EmptyState from "../components/common/EmptyState.vue";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const { sorted } = storeToRefs(documentStore);

const oldId = ref<number>(0);
const newId = ref<number>(0);

watch(
  sorted,
  (documents) => {
    if (documents.length >= 2 && !oldId.value && !newId.value) {
      oldId.value = documents[documents.length - 2].id;
      newId.value = documents[documents.length - 1].id;
    }
  },
  { immediate: true }
);

const diffRows = computed(() => {
  if (!oldId.value || !newId.value || oldId.value === newId.value) return [];
  return diffSections(sectionStore.byDocument(oldId.value), sectionStore.byDocument(newId.value));
});

const countOf = (type: string) => diffRows.value.filter((row) => row.diff_type === type).length;
</script>

<template>
  <section class="stack">
    <div class="panel">
      <h2>选择对比版本</h2>
      <div class="field-row">
        <label>
          基准版本（旧）
          <select v-model.number="oldId">
            <option v-for="doc in sorted" :key="doc.id" :value="doc.id">{{ doc.version_label }}（{{ doc.title }}）</option>
          </select>
        </label>
        <label>
          目标版本（新）
          <select v-model.number="newId">
            <option v-for="doc in sorted" :key="doc.id" :value="doc.id">{{ doc.version_label }}（{{ doc.title }}）</option>
          </select>
        </label>
      </div>
    </div>

    <template v-if="diffRows.length > 0">
      <div class="metrics four">
        <StatCard label="新增条款" :value="countOf('ADDED')" />
        <StatCard label="移除条款" :value="countOf('REMOVED')" />
        <StatCard label="改写条款" :value="countOf('MODIFIED')" />
        <StatCard label="未变条款" :value="countOf('UNCHANGED')" />
      </div>
      <div class="panel">
        <h2>条款差异（按条款编号）</h2>
        <DiffViewer :rows="diffRows" />
      </div>
    </template>
    <EmptyState v-else message="请导入至少两个版本并选择不同的对比版本" />
  </section>
</template>
