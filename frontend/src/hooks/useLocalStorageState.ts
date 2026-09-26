import { ref, watch, type Ref } from "vue";
import { STORAGE_KEYS } from "../constants/storageKeys";

export function useLocalStorageState<T>(key: keyof typeof STORAGE_KEYS, initial: T): Ref<T> {
  const state = ref(initial) as Ref<T>;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    if (raw) state.value = JSON.parse(raw) as T;
  } catch {
    // Keep the in-memory initial value when local storage is unavailable or corrupt.
  }
  watch(state, (value) => {
    try {
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    } catch {
      // Persisting drafts is best-effort and must not block the import flow.
    }
  }, { deep: true });
  return state;
}
