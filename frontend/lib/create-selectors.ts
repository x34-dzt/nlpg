import type { StoreApi, UseBoundStore } from "zustand"

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  type StoreState = ReturnType<S["getState"]>
  const store = _store as WithSelectors<typeof _store>
  store.use = {} as { [K in keyof StoreState]: () => StoreState[K] }
  for (const k of Object.keys(store.getState())) {
    ;(store.use as Record<string, () => unknown>)[k] = () =>
      store((s) => (s as Record<string, unknown>)[k])
  }
  return store
}
