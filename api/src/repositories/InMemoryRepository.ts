/**
 * Minimal generic in-memory repository used by every entity in the demo.
 * Keeps the architecture close to octocat_supply's repository pattern while
 * staying dependency-free for the workshop.
 */
export interface Identified {
  id: number;
}

export class InMemoryRepository<T extends Identified> {
  private items: T[];
  private nextId: number;

  constructor(seed: T[]) {
    this.items = seed.map((item) => ({ ...item }));
    this.nextId =
      this.items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  getAll(): T[] {
    return this.items.map((item) => ({ ...item }));
  }

  getById(id: number): T | undefined {
    const found = this.items.find((item) => item.id === id);
    return found ? { ...found } : undefined;
  }

  find(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate).map((item) => ({ ...item }));
  }

  create(data: Omit<T, "id">): T {
    const item = { ...(data as T), id: this.nextId++ };
    this.items.push(item);
    return { ...item };
  }

  update(id: number, data: Partial<Omit<T, "id">>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    this.items[index] = { ...this.items[index], ...data, id };
    return { ...this.items[index] };
  }

  delete(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
