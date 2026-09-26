<script setup lang="ts">
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { usePolicyDocumentStore, type ImportPayload } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { useReleaseSnapshotStore } from "../stores/ReleaseSnapshotStore";
import { formatDate } from "../utils/formatters";
import ImportPanel from "../components/common/ImportPanel.vue";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const snapshotStore = useReleaseSnapshotStore();
const { sorted, candidate } = storeToRefs(documentStore);

const message = ref("");
const error = ref("");

async function onImport(payload: ImportPayload) {
  message.value = "";
  error.value = "";
  try {
    const result = await documentStore.importDocument(payload);
    if (result.round) {
      message.value =
        `已导入 ${result.document.version_label}，解析 ${result.sections} 个条款；` +
        `第 ${result.round.round} 轮门禁清单已生成：${result.round.inherited} 条沿用原结论，${result.round.pending} 条回到待办。`;
    } else {
      message.value = `已导入 ${result.document.version_label}，解析 ${result.sections} 个条款；再导入一个版本即可生成对比与门禁清单。`;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}
</script>

<template>
  <section class="stack">
    <div class="metrics">
      <StatCard label="已导入版本" :value="sorted.length" />
      <StatCard label="条款总数" :value="sectionStore.rows.length" />
      <StatCard label="当前候选版本" :value="candidate?.version_label ?? '-'" />
    </div>

    <div class="panel">
      <h2>导入新版本</h2>
      <p class="hint">导入后会自动分段、与上一版本对比：正文未变的条款沿用原结论，变化的条款回到待办，旧结论记录保留。</p>
      <ImportPanel @submit="onImport" />
      <p v-if="message" class="notice ok">{{ message }}</p>
      <p v-if="error" class="notice error">{{ error }}</p>
    </div>

    <div class="panel">
      <h2>版本列表</h2>
      <article class="row" v-for="doc in [...sorted].reverse()" :key="doc.id">
        <div>
          <strong>{{ doc.title }} {{ doc.version_label }}</strong>
          <p class="hint">导入于 {{ formatDate(doc.imported_at) }} · {{ sectionStore.byDocument(doc.id).length }} 个条款</p>
        </div>
        <StatusBadge v-if="snapshotStore.isReleased(doc.id)" value="已发布" />
        <StatusBadge v-else-if="candidate?.id === doc.id" value="当前候选" />
        <StatusBadge v-else value="历史版本" />
      </article>
    </div>
  </section>
</template>
