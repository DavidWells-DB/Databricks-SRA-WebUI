import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Node 22 ships an experimental WHATWG localStorage that requires the
// --localstorage-file flag to actually work. jsdom doesn't override it,
// so window.localStorage ends up as a stub with no working setItem/getItem.
// Provide an in-memory shim that covers every test.
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: createMemoryStorage(),
});

beforeEach(() => {
  window.localStorage.clear();
});
