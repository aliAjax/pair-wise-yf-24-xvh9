<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { useGateReviewStore } from "../stores/GateReviewStore";
import { useReviewNoteStore } from "../stores/ReviewNoteStore";
import { PrivacyRiskLevel } from "../constants/PrivacyRiskLevel";
import { formatRisk } from "../utils/formatters";
import SectionCard from "../components/common/SectionCard.vue";
import EmptyState from "../components/common/EmptyState.vue";
import StatusBadge from "../components/common/StatusBadge.vue";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const gateStore = useGateReviewStore();
const noteStore = useReviewNoteStore();
const { candidate } = storeToRefs(documentStore);

const filter = ref<string>("ALL");
const noteDrafts = ref<Record<string, string>>({});
const reviewer = ref(localStorage.getItem("policy-diff:reviewer") ?? "");

const sections = computed(() => (candidate.value ? sectionStore.byDocument(candidate.value.id) : []));
const filtered = computed(() =>
  filter.value === "ALL" ? sections.value : sections.value.filter((section) => section.risk_level === filter.value)
);
const notesFor = (sectionNo: string) =>
  noteStore.rows.filter((note) => note.tag === sectionNo).slice().reverse();

async function onChangeRisk(id: number, level: string) {
  await sectionStore.updateRiskLevel(id, level);
  const section = sectionStore.rows.find((row) => row.id === id);
  if (section) await gateStore.syncRiskLevel(section.section_no, level);
}

async function addNote(sectionNo: string) {
  const comment = (noteDrafts.value[sectionNo] ?? "").trim();
  if (!comment) return;
  localStorage.setItem("policy-diff:reviewer", reviewer.value);
  await noteStore.addNote({ diff_result_id: 0, tag: sectionNo, comment, reviewer: reviewer.value || "匿名" });
  noteDrafts.value[sectionNo] = "";
}
</script>

<template>
  <section class="stack">
    <div class="panel">
      <h2>风险标注 · {{ candidate?.version_label ?? "无候选版本" }}</h2>
      <p class="hint">调整条款风险等级会同步到当前轮门禁清单；备注会进入审阅记录。</p>
      <div class="filter-bar">
        <button :class="{ active: filter === 'ALL' }" @click="filter = 'ALL'">全部 {{ sections.length }}</button>
        <button
          v-for="level in PrivacyRiskLevel"
          :key="level"
          :class="{ active: filter === level }"
          @click="filter = level"
        >
          {{ formatRisk(level) }}风险 {{ sections.filter((s) => s.risk_level === level).length }}
        </button>
      </div>
      <label class="reviewer-global">审阅人 <input v-model="reviewer" placeholder="姓名" /></label>
    </div>

    <EmptyState v-if="filtered.length === 0" message="没有符合条件的条款" />
    <SectionCard
      v-for="section in filtered"
      :key="section.id"
      :section="section"
      @changeRisk="onChangeRisk"
    >
      <template #actions>
        <div class="note-box">
          <div v-for="note in notesFor(section.section_no)" :key="note.id" class="note-item">
            <StatusBadge :value="note.status" />
            <span>{{ note.comment }} — {{ note.reviewer }}</span>
          </div>
          <div class="note-form">
            <input v-model="noteDrafts[section.section_no]" placeholder="给该条款写备注…" />
            <button @click="addNote(section.section_no)">添加备注</button>
          </div>
        </div>
      </template>
    </SectionCard>
  </section>
</template>
