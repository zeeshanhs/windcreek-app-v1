"use client";

import { useAskPat } from "@/app/askpat-context";
import { citations, followUps, messages, ticketSummary, type Block, type Inline } from "./scenario-data";

export default function ScenarioTranscript() {
  const { openPanel } = useAskPat();

  const renderInline = (parts: Inline[]) => parts.map((part, index) => {
    if (part.kind === "strong") return <strong key={index}>{part.text}</strong>;
    if (part.kind === "citation") {
      const source = citations[part.id];
      return <button
        key={index}
        type="button"
        className="scenario-citation"
        aria-label={`Open citation ${part.id}, ${source.sheet}, PDF page ${source.page}`}
        onClick={() => openPanel("citation", String(part.id))}
      >[{part.id}]</button>;
    }
    return part.text;
  });

  const renderBlock = (block: Block, index: number) => block.kind === "paragraph"
    ? <p key={index}>{renderInline(block.content)}</p>
    : <ol key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}</ol>;

  return <>
    <p className="scenario-chat-note">Scripted opening · fictional incident (US-09). Follow-ups are saved in this browser&apos;s demo chat. No BMS or ticket service is connected.</p>
    {messages.map((message, index) => <article className={`message message-${message.speaker === "Marcus" ? "user" : "assistant"} scenario-scripted-message`} key={index}>
      <div className="message-byline"><strong>{message.speaker}</strong>{message.time && <span className="scenario-time">{message.time}</span>}</div>
      <div className="scenario-content">{message.blocks.map(renderBlock)}</div>
    </article>)}
    <section className="scenario-summary" aria-labelledby="scenario-summary-title">
      <span className="scenario-eyebrow">Scripted record · no ticket was created</span>
      <h2 id="scenario-summary-title">Scenario ticket summary</h2>
      <p>{ticketSummary}</p>
      <h3>Three follow-ups in the script</h3>
      <ul>{followUps.map((followUp) => <li key={followUp}>{followUp}</li>)}</ul>
    </section>
  </>;
}
