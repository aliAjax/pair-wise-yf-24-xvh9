<script setup lang="ts">
import { reactive, watch } from "vue";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";

const emit = defineEmits<{ (e: "import", payload: { title: string; version_label: string; raw_text: string }): void }>();

const draft = useLocalStorageState("importDraft", { title: "隐私政策", version_label: "", raw_text: "" });
const form = reactive(draft.value);
watch(form, () => { draft.value = { ...form }; }, { deep: true });

const submit = () => {
  emit("import", { ...form });
};
</script>
<template>
  <form class="import-panel" @submit.prevent="submit">
    <label>政策名称
      <input v-model="form.title" placeholder="例如：隐私政策" />
    </label>
    <label>新版本号
      <input v-model="form.version_label" placeholder="例如：v3.2" />
    </label>
    <label class="full">条款正文（使用“1.”或“第1条”编号，便于自动分段）
      <textarea v-model="form.raw_text" rows="10" placeholder="1. 我们如何收集和使用您的个人信息&#10;……&#10;2. 信息的保存期限&#10;……"></textarea>
    </label>
    <button type="submit" class="primary">导入新版本</button>
  </form>
</template>
