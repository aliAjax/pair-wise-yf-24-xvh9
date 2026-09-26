<script setup lang="ts">
import { computed, onMounted, ref, type Component } from "vue";
import { routes } from "./router/routes";
import { usePolicyDocumentStore } from "./stores/PolicyDocumentStore";
import { usePolicySectionStore } from "./stores/PolicySectionStore";
import { useDiffResultStore } from "./stores/DiffResultStore";
import { useReviewNoteStore } from "./stores/ReviewNoteStore";
import { useGateReviewStore } from "./stores/GateReviewStore";
import { useReleaseSnapshotStore } from "./stores/ReleaseSnapshotStore";
import DocumentsPage from "./pages/DocumentsPage.vue";
import ComparePage from "./pages/ComparePage.vue";
import RisksPage from "./pages/RisksPage.vue";
import ReviewPage from "./pages/ReviewPage.vue";
import SnapshotsPage from "./pages/SnapshotsPage.vue";
import StatusBadge from "./components/common/StatusBadge.vue";

const pages: Record<string, Component> = {
  "/documents": DocumentsPage,
  "/compare": ComparePage,
  "/risks": RisksPage,
  "/review": ReviewPage,
  "/snapshots": SnapshotsPage
};

const active = ref<string>(routes[0]?.route ?? "/documents");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
const currentPage = computed(() => pages[active.value] ?? DocumentsPage);
const ready = ref(false);

onMounted(async () => {
  const documentStore = usePolicyDocumentStore();
  const sectionStore = usePolicySectionStore();
  const diffStore = useDiffResultStore();
  const noteStore = useReviewNoteStore();
  const gateStore = useGateReviewStore();
  const snapshotStore = useReleaseSnapshotStore();
  await Promise.all([
    documentStore.load(),
    sectionStore.load(),
    diffStore.load(),
    noteStore.load(),
    gateStore.load(),
    snapshotStore.load()
  ]);
  // 首次启动：把种子文档解析成条款，并为最新两个版本生成第一轮门禁清单。
  await documentStore.ensureDerived();
  ready.value = true;
});
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">隐私政策差异对比器</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">{{ route.name }}</button>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head">
        <div><p class="eyebrow">policy-diff</p><h1>{{ current?.name }}</h1></div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <component :is="currentPage" v-if="ready" />
      <p v-else class="hint">正在加载本地数据…</p>
    </main>
  </div>
</template>
