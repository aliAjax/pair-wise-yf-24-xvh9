<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { formatDate } from "../utils/formatters";
import ImportPanel from "../components/common/ImportPanel.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";

const store = usePolicyDocumentStore();
const { rows, sections, lastError } = storeToRefs(store);

const enriched = computed(() =>
  [...rows.value]
    .sort((a, b) => new Date(b.imported_at).getTime() - new Date(a.imported_at).getTime())
    .map((doc) => ({
      ...doc,
      section_count: sections.value.filter((s) => s.document_id === doc.id).length
    }))
);

const onImport = async (payload: { title: string; version_label: string; raw_text: string }) => {
  await store.importDocument(payload);
};

onMounted(() => { store.load(); });
</script>

<template>
  <div class="page-grid">
    <section class="panel">
      <h2>导入新版本</h2>
      <ImportPanel @import="onImport" />
      <p v-if="lastError" class="error-text">{{ lastError }}</p>
      <p class="hint">再导入同一政策的新版本后，前往「发布门禁」选择新旧版本：正文未变条款自动沿用原结论，正文变化条款回到待办；历史结论与已发布快照都会保留。</p>
    </section>
    <section class="panel">
      <h2>版本列表</h2>
      <EmptyState v-if="enriched.length === 0" text="尚未导入任何政策版本" />
      <article v-for="doc in enriched" :key="doc.id" class="doc-row">
        <div>
          <strong>{{ doc.title }} {{ doc.version_label }}</strong>
          <p class="muted">{{ formatDate(doc.imported_at) }} 导入 · {{ doc.section_count }} 个编号条款</p>
        </div>
        <StatusBadge value="IMPORTED" />
      </article>
    </section>
  </div>
</template>
