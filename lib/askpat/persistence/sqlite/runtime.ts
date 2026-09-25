import { eq } from "drizzle-orm";
import type { SqliteConnection } from "./connection";
import * as t from "./schema";

/** Call after a validated browser-data import, before accepting new writes. */
export function reconcileRuntimeCounters(connection: SqliteConnection) {
  connection.db.transaction((tx) => {
    const runtime = tx.select().from(t.demoRuntime).where(eq(t.demoRuntime.id, 1)).get();
    if (!runtime) throw new Error("Database is not seeded.");
    const orderNumbers = tx.select({ id: t.orders.id }).from(t.orders).all().map(({ id }) => /^\d+$/.test(id) ? Number(id) : 0);
    const ids = [
      ...tx.select({ id: t.chats.id }).from(t.chats).all().map((row) => row.id),
      ...tx.select({ id: t.messages.id }).from(t.messages).all().map((row) => row.id),
      ...tx.select({ id: t.photos.id }).from(t.photos).all().map((row) => row.id),
    ];
    const sequences = ids.map((id) => /(?:^CH-[GL]|^PH-|\-M)(\d+)$/.exec(id)?.[1]).filter((value): value is string => !!value).map(Number);
    const times = [runtime.clock,
      ...tx.select({ at: t.orders.createdAt }).from(t.orders).all().map((row) => row.at),
      ...tx.select({ at: t.orderRemarks.at }).from(t.orderRemarks).all().map((row) => row.at),
      ...tx.select({ at: t.orderEvents.at }).from(t.orderEvents).all().map((row) => row.at),
      ...tx.select({ at: t.chats.updatedAt }).from(t.chats).all().map((row) => row.at),
      ...tx.select({ at: t.messages.at }).from(t.messages).all().map((row) => row.at).filter((at): at is string => at !== null),
      ...tx.select({ at: t.unknownFaults.at }).from(t.unknownFaults).all().map((row) => row.at),
    ];
    const latest = Math.max(...times.map((time) => Date.parse(time)));
    if (!Number.isFinite(latest)) throw new Error("Imported timestamp is invalid.");
    tx.update(t.demoRuntime).set({
      nextOrderNumber: Math.max(runtime.nextOrderNumber, ...orderNumbers.map((n) => n + 1)),
      nextSequence: Math.max(runtime.nextSequence, ...sequences.map((n) => n + 1)),
      clock: new Date(latest).toISOString(),
    }).where(eq(t.demoRuntime.id, 1)).run();
  }, { behavior: "immediate" });
}
