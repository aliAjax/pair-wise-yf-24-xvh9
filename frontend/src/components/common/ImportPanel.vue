<script setup lang="ts">
import { ref, computed } from "vue";
import { parsePolicyText, assessRisk } from "../../hooks/usePolicyParser";
import { formatRisk } from "../../utils/formatters";

const emit = defineEmits<{
  submit: [payload: { title: string; version_label: string; raw_text: string }];
}>();

const title = ref("隐私政策");
const versionLabel = ref("");
const rawText = ref("");

const preview = computed(() => {
  if (!rawText.value.trim()) return null;
  const sections = parsePolicyText(rawText.value);
  const risks: Record<string, number> = {};
  for (const section of sections) {
    const level = assessRisk(section.content);
    risks[level] = (risks[level] ?? 0) + 1;
  }
  return { count: sections.length, risks };
});

const canSubmit = computed(
  () => title.value.trim() !== "" && versionLabel.value.trim() !== "" && rawText.value.trim() !== ""
);

function submit() {
  if (!canSubmit.value) return;
  emit("submit", { title: title.value, version_label: versionLabel.value, raw_text: rawText.value });
  rawText.value = "";
  versionLabel.value = "";
}
</script>

<template>
  <div class="import-panel">
    <div class="field-row">
      <label>文档标题<input v-model="title" placeholder="隐私政策" /></label>
      <label>版本号<input v-model="versionLabel" placeholder="例如 v3.0" /></label>
    </div>
    <label class="field-block">
      政策全文（按条款编号自动分段，支持 1. / 1.1 / 一、 / 第X条）
      <textarea v-model="rawText" rows="10" placeholder="粘贴新版隐私政策全文…"></textarea>
    </label>
    <div class="import-preview" v-if="preview">
      <span class="badge">识别 {{ preview.count }} 个条款</span>
      <span class="badge" v-for="(count, level) in preview.risks" :key="level" :class="`risk-${String(level).toLowerCase()}`">
        {{ formatRisk(String(level)) }}风险 {{ count }}
      </span>
    </div>
    <button class="primary" :disabled="!canSubmit" @click="submit">导入并生成门禁清单</button>
  </div>
</template>
