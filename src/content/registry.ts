import { REGISTRY_KINDS } from "../core/types-def.ts";
import type { RegistryKind, RegistryEntry, RegistryFile, AttrRole } from "../core/types-def.ts";

export type Registries = { [K in RegistryKind]: Record<string, RegistryEntry> };

export function emptyRegistries(): Registries {
  return Object.fromEntries(REGISTRY_KINDS.map(kind => [kind, Object.create(null)])) as Registries;
}

export function mergeRegistry(regs: Registries, file: RegistryFile): void {
  for (const entry of file.entries) regs[file.kind][entry.id] = structuredClone(entry);
}

export function hasEntry(regs: Registries, kind: RegistryKind, id: string): boolean {
  return Object.hasOwn(regs[kind], id);
}

export function attrByRole(regs: Registries, role: AttrRole): string | undefined {
  return Object.values(regs.attrs).find(entry => entry.role === role)?.id;
}
