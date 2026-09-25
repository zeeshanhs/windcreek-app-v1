export type User = { id: string; name: string; initials: string; role: "Technician" | "Team member"; email: string };
export type Issue = { id: string; label: string; category: string };
export type Location = { id: string; label: string; area: string; equipment?: string };
export type Remark = { id: string; authorId: string; text: string; at: string };
export type OrderEvent = { id: string; kind: "created" | "remark" | "closed"; actorId: string; at: string; text?: string };
export type Order = { id: string; issueId: string; locationId: string; requesterId: string; createdAt: string; status: "open" | "closed"; version: number; equipment?: string; remarks: Remark[]; events: OrderEvent[]; closure?: { actorId: string; at: string; note: string } };
export type Photo = { id: string; name: string; type: string; size: number; blob: Blob; description: string };
export type Reference = { kind: "source" | "remark" | "status" | "citation"; id: string; label: string; locator?: string };
export type Message = { id: string; chatId: string; author: "user" | "assistant"; text: string; at: string; status: "sent" | "sending" | "failed"; references?: Reference[]; photoId?: string };
export type Chat = { id: string; ownerId: string; orderId: string | null; title: string; equipment?: string; scenarioId?: "ahu-15"; createdAt: string; updatedAt: string; messages: Message[] };
export type Fault = { id: string; chatId: string; equipment: string; code: string; at: string; messageId: string; photoId?: string };
export type DemoState = { users: User[]; orders: Order[]; chats: Chat[]; photos: Photo[]; faults: Fault[]; receipts: Record<string, string>; sequence: number; clock: string };

export const users: User[] = [
  { id: "USR-M", name: "Morgan Reed", initials: "MR", role: "Technician", email: "morgan.reed@example.com" },
  { id: "USR-A", name: "Avery Cole", initials: "AC", role: "Team member", email: "avery.cole@example.com" },
  { id: "USR-S", name: "Sam Patel", initials: "SP", role: "Technician", email: "sam.patel@example.com" },
  { id: "USR-J", name: "Jordan Lane", initials: "JL", role: "Team member", email: "jordan.lane@example.com" },
];
export const issues: Issue[] = [
  { id: "ISS-D01", label: "AC/Heat - Repair/Replace", category: "HVAC & Temperature" },
  { id: "ISS-D02", label: "Sink - Faucet - Dripping", category: "Plumbing & Water" },
  { id: "ISS-D03", label: "Ceiling Lamp/Light - Repair/Replace", category: "Electrical & Lighting" },
  { id: "ISS-D04", label: "Door - Latch - Repair/Replace", category: "Doors, Windows & Locks" },
  { id: "ISS-D05", label: "AC/Heat - Too Hot - Repair/Replace", category: "HVAC & Temperature" },
  { id: "ISS-D06", label: "Supply Fan - Repair/Replace", category: "Other" },
];
export const locations: Location[] = [
  { id: "LOC-D01", label: "Conference Room C", area: "Meeting & Events", equipment: "AHU-D01" },
  { id: "LOC-D02", label: "Staff restroom — west corridor", area: "Restrooms" },
  { id: "LOC-D03", label: "Meeting foyer", area: "Meeting & Events" },
  { id: "LOC-D04", label: "Conference Room A", area: "Meeting & Events" },
  { id: "LOC-D05", label: "Guestroom 702", area: "Guestrooms", equipment: "FCU-D02" },
  { id: "LOC-D06", label: "Lobby service area", area: "Public & Circulation", equipment: "SF-D03" },
  { id: "LOC-D07", label: "Guestroom 703", area: "Guestrooms" },
];

const at = (day: number, time: string) => `2026-09-${String(day).padStart(2, "0")}T${time}:00Z`;
const order = (id: string, issueId: string, locationId: string, requesterId: string, createdAt: string, initial: string, equipment?: string, extra?: { authorId: string; at: string; text: string }, closure?: { actorId: string; at: string; note: string }): Order => ({
  id, issueId, locationId, requesterId, createdAt, status: closure ? "closed" : "open", version: closure ? 2 : 1, equipment,
  remarks: [{ id: `${id}-R1`, authorId: requesterId, text: initial, at: createdAt }, ...(extra ? [{ id: `${id}-R2`, ...extra }] : [])],
  events: [{ id: `${id}-E1`, kind: "created", actorId: requesterId, at: createdAt }, ...(extra ? [{ id: `${id}-E2`, kind: "remark" as const, actorId: extra.authorId, at: extra.at, text: extra.text }] : []), ...(closure ? [{ id: `${id}-E3`, kind: "closed" as const, actorId: closure.actorId, at: closure.at, text: closure.note }] : [])],
  closure,
});
const refs = {
  register: { kind: "source" as const, id: "DF-S01", label: "Demo source · Training equipment register · Entry EQ-D01", locator: "EQ-D01" },
  remark1042: { kind: "remark" as const, id: "1042", label: "Order remark · SO #1042" },
};
const msg = (chatId: string, suffix: string, author: "user" | "assistant", text: string, time: string, references?: Reference[]): Message => ({ id: `${chatId}-${suffix}`, chatId, author, text, at: time, status: "sent", references });
const chat = (id: string, ownerId: string, orderId: string | null, title: string, equipment: string | undefined, updatedAt: string, messages: Message[]): Chat => ({ id, ownerId, orderId, title, equipment, createdAt: messages[0]?.at ?? updatedAt, updatedAt, messages });

export const scenarioChatId = (ownerId: string) => `CH-AHU15-${ownerId}`;
export const scenarioChat = (ownerId: string): Chat => ({
  id: scenarioChatId(ownerId), ownerId, orderId: null, scenarioId: "ahu-15",
  title: "AHU-15 Drops Off the BMS", equipment: "AHU-15",
  createdAt: at(24, "10:29"), updatedAt: at(24, "10:29"), messages: [],
});

export function ensureScenarioChats(state: DemoState): boolean {
  let added = false;
  for (const user of users) {
    if (state.chats.some((item) => item.id === scenarioChatId(user.id))) continue;
    state.chats.push(scenarioChat(user.id));
    added = true;
  }
  return added;
}

export function initialState(): DemoState {
  return {
    users: structuredClone(users),
    orders: [
      order("1042", "ISS-D01", "LOC-D01", "USR-A", at(24, "09:20"), "Airflow in Conference Room C feels lower than usual. Please investigate.", "AHU-D01", { authorId: "USR-M", at: at(24, "09:48"), text: "Equipment tag reads AHU-D01. No cause has been confirmed." }),
      order("1041", "ISS-D02", "LOC-D02", "USR-A", at(24, "09:05"), "The faucet in the staff restroom is dripping after use."),
      order("1040", "ISS-D03", "LOC-D03", "USR-S", at(24, "08:50"), "One ceiling light in the meeting foyer is not illuminating."),
      order("1039", "ISS-D04", "LOC-D04", "USR-J", at(23, "16:30"), "The Conference Room A door latch is not engaging consistently."),
      order("1038", "ISS-D05", "LOC-D05", "USR-A", at(23, "14:10"), "Guestroom 702 feels warmer than the neighboring rooms.", "FCU-D02", undefined, { actorId: "USR-M", at: at(23, "15:20"), note: "Requester confirmed that the original report no longer needs attention." }),
      order("1037", "ISS-D06", "LOC-D06", "USR-J", at(22, "10:00"), "Please review the reported fan issue in the lobby service area.", "SF-D03", undefined, { actorId: "USR-S", at: at(22, "11:00"), note: "Duplicate report. The related report remains with the external operations team." }),
    ],
    chats: [
      ...users.map((user) => scenarioChat(user.id)),
      chat("CH-D01", "USR-M", "1042", "AHU-D01 airflow question", "AHU-D01", at(24, "10:20"), [
        msg("CH-D01", "M1", "user", "Which unit serves Conference Room C?", at(24, "10:16")),
        msg("CH-D01", "M2", "assistant", "AHU-D01 is listed as serving Conference Room C in the demo equipment register. The order reports low airflow; that report does not establish the cause.", at(24, "10:16"), [refs.register]),
        msg("CH-D01", "M3", "user", "I'm looking at AHU-D01. Summarize what we know before I check the approved procedure.", at(24, "10:19")),
        msg("CH-D01", "M4", "assistant", "Reported: Lower-than-usual airflow in Conference Room C.\nIdentified: AHU-D01, using your confirmation and the demo register.\nNot established: The cause or current operating readings.\n\nThe service order remains Open.", at(24, "10:20"), [refs.remark1042, refs.register]),
      ]),
      chat("CH-D02", "USR-M", null, "AHU-D01 source documents", "AHU-D01", at(24, "10:05"), [msg("CH-D02", "M1", "user", "Which source identifies the area served by AHU-D01?", at(24, "10:04")), msg("CH-D02", "M2", "assistant", "The demo equipment register lists Conference Room C for AHU-D01.", at(24, "10:05"), [refs.register])]),
      chat("CH-D03", "USR-M", "1041", "Staff restroom sink report", undefined, at(24, "09:30"), [msg("CH-D03", "M1", "user", "Summarize the reported sink issue.", at(24, "09:29")), msg("CH-D03", "M2", "assistant", "The order reports a dripping faucet in the staff restroom — west corridor. No equipment unit or cause has been confirmed.", at(24, "09:30"), [{ kind: "remark", id: "1041", label: "Order remark · SO #1041" }])]),
      chat("CH-D04", "USR-M", null, "AHU-D01 service history", "AHU-D01", at(23, "15:45"), [msg("CH-D04", "M1", "user", "What service history is available for AHU-D01?", at(23, "15:44")), msg("CH-D04", "M2", "assistant", "The demo history contains one completed inspection on 22 Sep 2026 and one documentation review scheduled for 28 Sep 2026. These are training records, not live maintenance data.", at(23, "15:45"), [{ kind: "source", id: "DF-S02", label: "Demo source · Training maintenance record" }])]),
      chat("CH-D05", "USR-M", "1038", "Guestroom 702 follow-up", "FCU-D02", at(23, "15:25"), [msg("CH-D05", "M1", "user", "Can I continue asking about FCU-D02 after this order is closed?", at(23, "15:24")), msg("CH-D05", "M2", "assistant", "Yes. This conversation can continue. SO #1038 is Closed, and sending another message will not reopen it.", at(23, "15:25"), [{ kind: "status", id: "1038", label: "Current order status · SO #1038" }])]),
      chat("CH-S01", "USR-S", "1042", "Conference Room C follow-up", "AHU-D01", at(24, "10:10"), [msg("CH-S01", "M1", "user", "What has the requester reported?", at(24, "10:09")), msg("CH-S01", "M2", "assistant", "The report describes lower-than-usual airflow in Conference Room C. No cause is confirmed in the order.", at(24, "10:10"), [refs.remark1042])]),
    ],
    photos: [], faults: [], receipts: {}, sequence: 1, clock: at(24, "10:29"),
  };
}

export const sourceRecords = {
  "DF-S01": { title: "Training equipment register", version: "Demonstration revision 1 · 23 Sep 2026", rows: [
    ["EQ-D01", "AHU-D01", "Conference Room C", "Roof mechanical area — training zone"],
    ["EQ-D02", "FCU-D02", "Guestroom 702", "Level 7 service alcove — training zone"],
    ["EQ-D03", "SF-D03", "Lobby service area", "Ground-level plant area — training zone"],
  ] },
  "DF-S02": { title: "Training maintenance record", version: "Demonstration revision 1", text: "AHU-D01: visual inspection recorded as completed on 22 Sep 2026; documentation review scheduled for 28 Sep 2026. No other maintenance records are present in this fixture." },
  "DF-S03": { title: "Training identification checklist", version: "Demonstration revision 1", steps: ["Step 1: Read the equipment tag from an already visible label without opening a cover.", "Step 2: Compare the reported tag with the selected demo register entry.", "Step 3: Record whether the label and register match, or whether identification remains incomplete."] },
} as const;

export const issueFor = (id: string) => issues.find((issue) => issue.id === id);
export const locationFor = (id: string) => locations.find((location) => location.id === id);
export const userFor = (id: string) => users.find((user) => user.id === id);
export const formatTime = (value: string) => {
  const date = new Date(value);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getUTCMonth()];
  return `${date.getUTCDate()} ${month} ${date.getUTCFullYear()}, ${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")} UTC`;
};
export const formatShortTime = (value: string) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", hour12: false }).format(new Date(value));
