<script setup lang="ts">
import { computed, onMounted, ref, type Component } from "vue";
import { routes } from "./router/routes";
import { mockData } from "./mocks/seedData";
import StatusBadge from "./components/common/StatusBadge.vue";
import StatCard from "./components/common/StatCard.vue";
import DocumentsPage from "./pages/DocumentsPage.vue";
import ComparePage from "./pages/ComparePage.vue";
import RisksPage from "./pages/RisksPage.vue";
import ReviewPage from "./pages/ReviewPage.vue";
import ReleaseGatePage from "./pages/ReleaseGatePage.vue";
import { useReleaseGateStore } from "./stores/ReleaseGateStore";

const pageMap: Record<string, Component> = {
  "/documents": DocumentsPage,
  "/compare": ComparePage,
  "/risks": RisksPage,
  "/review": ReviewPage,
  "/release": ReleaseGatePage
};

const active = ref<string>(routes[4]?.route ?? "/release");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);
const activePage = computed(() => pageMap[active.value] ?? DocumentsPage);
const entries = Object.entries(mockData);
const gateStore = useReleaseGateStore();

onMounted(() => { gateStore.load(); });
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
      <section class="page-head"><div><p class="eyebrow">policy-diff</p><h1>{{ current?.name }}</h1></div><StatusBadge value="LOCAL_DATA" /></section>
      <section class="metrics"><StatCard label="核心模型" :value="entries.length" /><StatCard label="共享枚举" :value="4" /><StatCard label="只读发布快照" :value="gateStore.snapshots.length" /></section>
      <component :is="activePage" />
    </main>
  </div>
</template>
