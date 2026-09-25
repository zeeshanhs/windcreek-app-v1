import type { Chat, Order, Reference } from "./fixtures";
import { citations, followUps, ticketSummary, type CitationId } from "../../app/scenarios/ahu-15/scenario-data";

export type DemoAnswer = { text: string; references?: Reference[]; unknownCode?: { equipment: string; code: string } };
const register: Reference = { kind: "source", id: "DF-S01", label: "Demo source · Training equipment register · Entry EQ-D01", locator: "EQ-D01" };
const checklist = (step: number): Reference => ({ kind: "source", id: "DF-S03", label: `Demo source · Training identification checklist · Step ${step}`, locator: `Step ${step}` });
const citation = (id: CitationId): Reference => ({ kind: "citation", id: String(id), label: `Citation [${id}] · ${citations[id].sheet} · PDF page ${citations[id].page}` });

function scenarioAnswer(question: string, photoAttached: boolean): DemoAnswer {
  const q = question.toLowerCase();
  if (photoAttached) return { text: "This local demo cannot inspect a new photo of AHU-15. Describe the observation in text and verify it through your approved site process; the scripted drawings do not establish the current equipment condition." };
  if (/why|cause|reason/.test(q) && /break|trip|power|outage/.test(q)) return { text: "The script confirms that HR2A3-27 was tripped and control power returned after one reset. It does not establish why the breaker tripped. The scripted follow-up calls for an electrician if it trips again; no current breaker state is available here.", references: [citation(3)] };
  if (/fan|placeholder|point/.test(q) && /3|4|number|many|count|extra|unused/.test(q)) return { text: "The network drawing depicts four supply and four return fans, while the mechanical schedule calls for two per array. Marcus reports seeing only two per side. The script treats fan 3 and 4 points as likely template placeholders and asks controls support to verify and remove them from the graphic.", references: [citation(1), citation(6)] };
  if (/ups|battery|replace battery/.test(q)) return { text: "Marcus reported On Battery lit and Replace Battery blinking on the SDU500 UPS. The scripted follow-up is to replace its battery; this chat cannot verify its present condition.", references: [citation(3)] };
  if (/switch|network|cable|uplink|switch-x/.test(q)) return { text: "The network sheet labels AHU-15's uplink as “Switch-X,” so it does not identify the switch port. The script notes SW8 in IDF Room 224 and SW9 in IDF Room 213A, and says IT would need to trace the AHU-15 connection if required.", references: [citation(1), citation(2)] };
  if (/start|sequence|smoke|freeze|safet|low limit/.test(q)) return { text: "The scripted sequence opens smoke and fire/smoke dampers, enables supply after a 30-second delay, then enables return once supply is running. It also notes that low limit switch #1 is manual reset and its alarm needs acknowledgement and reset at the FMCS. This is drawing context, not a live status check.", references: [citation(5)] };
  if (/panel|controller|c019|module|transformer/.test(q)) return { text: "The script identifies AHU-15 as controller C019. Its panel drawing places TX1 in the AHU control panel and flags possible relocation to Electrical Room 217. After power returned, the script expected expansion modules at addresses 1–4 to respond; this chat cannot check them now.", references: [citation(3), citation(4)] };
  if (/ticket|order|logged|follow.?up/.test(q)) return { text: `“Logged” is part of the authored transcript; no service order or ticket was created. Its three scripted follow-ups are: ${followUps.map((item, index) => `${index + 1}. ${item}`).join("; ")}.` };
  if (/summar|what happened|status|resolved|recap/.test(q)) return { text: `${ticketSummary} This is the scripted incident record, not a live BMS reading or a service order.`, references: [citation(3), citation(4)] };
  return { text: "I can answer from the scripted AHU-15 exchange and its six supplied drawing pages. Ask about the power loss, UPS, network connection, startup sequence, fan-count discrepancy, or scripted follow-ups. This local demo cannot inspect the current BMS or create a ticket." };
}

/** Deliberately narrow response specimens. They are not model inference or equipment diagnosis. */
export function demoAnswer(question: string, chat: Chat | undefined, order: Order | undefined, photoAttached = false): DemoAnswer {
  if (chat?.scenarioId === "ahu-15") return scenarioAnswer(question, photoAttached);
  const q = question.toLowerCase();
  const equipment = chat?.equipment ?? order?.equipment;
  const lastAssistant = [...(chat?.messages ?? [])].reverse().find((message) => message.author === "assistant");
  const lastStep = lastAssistant?.references?.find((reference) => reference.id === "DF-S03")?.locator;
  if (lastStep === "Step 1" && /tag|ahu-|fcu-|rtu-|unreadable|unclear|can't read/.test(q)) {
    if (q.includes("unreadable") || q.includes("can't read") || q.includes("unclear")) return { text: "The label is unreadable, so identification remains incomplete. Use your approved site process to confirm the tag before using a unit-specific record.", references: [checklist(2)] };
    if (q.includes("ahu-d01")) return { text: "The reported tag is AHU-D01. Compare it with the selected demo register entry. Does the visible label match, differ, or remain unreadable?", references: [checklist(2), register] };
    return { text: "That tag does not match AHU-D01 in the selected demo register entry. Record the mismatch and confirm the equipment identity through your approved site process before continuing.", references: [checklist(2), register] };
  }
  if (lastStep === "Step 2" && /match|differ|unreadable|unclear/.test(q)) return q.includes("match") && !q.includes("mismatch") && !q.includes("not")
    ? { text: "The label and demo register match for AHU-D01. Record that identification result. This does not establish a mechanical cause.", references: [checklist(3)] }
    : { text: "Identification remains incomplete. Record the mismatch or unreadable label and use your approved site process to confirm the tag.", references: [checklist(3)] };
  if (equipment === "AHU-D01" && q.includes("fcu-d02")) return { text: "This question concerns FCU-D02. Use it as the equipment context for this conversation? The linked service order will not change.", references: [{ kind: "source", id: "DF-S01", label: "Demo source · Training equipment register · Entry EQ-D02", locator: "EQ-D02" }] };
  if (!equipment && q.includes("which unit") && !q.includes("conference room c")) return { text: "I found two possible units in the demo register for that broad description: AHU-D01 and FCU-D02. Which tag is on the equipment you are checking?", references: [register, { kind: "source", id: "DF-S01", label: "Demo source · Training equipment register · Entry EQ-D02", locator: "EQ-D02" }] };
  if (/close (this |the )?order/.test(q)) return order?.status === "open"
    ? { text: `SO #${order.id} can be closed after you review the order and enter a resolution note. Choose Review closure; this chat message has not changed the order.` }
    : order ? { text: `SO #${order.id} is already Closed. This conversation remains available; no second closure was requested.` }
    : { text: "This conversation is not linked to a service order. Open the relevant order to review closure." };
  if (q.includes("test-x9")) return equipment
    ? { text: "I don't have a confirmed meaning for TEST-X9 in the available material. Please confirm the code and the equipment tag; a readable photo may help.", unknownCode: { equipment, code: "TEST-X9" } }
    : { text: "I don't have a confirmed meaning for TEST-X9 in the available material. Which unit shows this code? I need the equipment tag before recording a unit-specific unknown fault." };
  if (q.includes("heat wheel") && (q.includes("moving") || q.includes("photo") || q.includes("image"))) return { text: "A still image cannot establish whether a heat wheel is moving. Please describe a direct observation through your approved site process; I cannot confirm movement from this photo." };
  if (photoAttached) return { text: "The detail needed to read this is not clear. Add a clearer photo or type the label or value you can see. The attached image stays in this local demo chat." };
  if (q.includes("history") || q.includes("maintenance")) return equipment === "AHU-D01"
    ? { text: "The demo history contains a visual inspection recorded as completed on 22 Sep 2026 and a documentation review scheduled for 28 Sep 2026. These are training records, not live maintenance data.", references: [{ kind: "source", id: "DF-S02", label: "Demo source · Training maintenance record" }] }
    : { text: "No maintenance records were returned for this unit. That does not establish whether maintenance is due." };
  if (q.includes("tag") && q.includes("match")) return { text: "Record whether the visible label matches the demo register entry, or whether identification remains incomplete. This does not establish a mechanical cause.", references: [checklist(3)] };
  if (q.includes("tag") && (q.includes("unreadable") || q.includes("unclear") || q.includes("different"))) return { text: "Identification remains incomplete. Confirm the equipment tag through your approved site process before using a unit-specific record.", references: [checklist(2)] };
  if (q.includes("step") || q.includes("identify") || q.includes("checklist")) return { text: "Read the equipment tag from an already visible label without opening a cover. What tag is shown?", references: [checklist(1)] };
  if (q.includes("which unit") || q.includes("serves conference") || q.includes("source identifies")) return { text: "AHU-D01 is listed as serving Conference Room C in the demo equipment register. The order report does not establish the cause of any airflow concern.", references: [register] };
  if (q.includes("summar") || q.includes("handoff")) {
    if (order?.id === "1042") return { text: `Equipment: AHU-D01.\nReported issue: Low airflow in Conference Room C.\nChecks/results: Equipment tag confirmed by Morgan; no diagnostic checks recorded.\nObservations: Lower-than-usual airflow reported by requester.\nReadings: None provided.\nPhotos: None attached.\nNext handoff: Appropriate facilities specialist through the existing operational process.\nOrder: SO #1042 ${order.status === "open" ? "remains Open" : "is Closed"}.`, references: [{ kind: "remark", id: "1042", label: "Order remark · SO #1042" }, register] };
    return { text: "I can summarize only the details provided in this conversation. No service order is attached, and no diagnostic result has been confirmed." };
  }
  if (q === "photo" || q.includes("blurry") || q.includes("unreadable image")) return { text: "The detail needed to read this is not clear. Add a clearer photo or type the label or value you can see. The attached image stays in this local demo chat." };
  if (q.includes("photo") || q.includes("image")) return { text: "This condition isn't within the supported visual checks. Describe what you observed or provide the reading directly. A still photo cannot confirm motion or a mechanical cause." };
  if (q.includes("unsafe") || q.includes("hazard")) return { text: "Do not continue an unsafe inspection. This may require qualified personnel. I don't have a verified procedure for this condition; use your approved site process before proceeding." };
  if (q.includes("manual") || q.includes("threshold") || q.includes("specification")) return { text: "I don't have a source that supports an answer for this unit. Share the equipment tag or identify the approved document. No technical manual is available in this demo." };
  if (!equipment) return { text: "Which equipment tag or location does this concern? The available information does not establish the cause. The missing detail is the equipment tag." };
  if (q.includes("airflow") || q.includes("too hot")) return { text: "I have the reported symptom and the unit context. The cause is not established yet. What direct observation or approved source should we check next?" };
  return { text: `I have the reported context for ${equipment}, but the available demo material does not establish the cause. Share the specific observation or approved source you want to check.` };
}
