"use client";

import Link from "next/link";
import { useAskPat } from "@/app/askpat-context";
import { citations, followUps, messages, ticketSummary, type Block, type Inline } from "./scenario-data";

export default function ScenarioView() {
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

  return <main className="scenario-page">
    <div className="scenario-inner">
      <Link className="scenario-back" href="/chats">← Your chats</Link>
      <header className="scenario-heading">
        <span className="scenario-eyebrow">Scripted example · fictional incident</span>
        <h1>AHU-15 DROPS OFF THE BMS</h1>
        <p>US-09 · Unit Shows Offline or Not Responding on the Building System</p>
        <p className="scenario-disclaimer">This preloaded conversation illustrates a fictional incident. Viewing it does not contact the BMS or create a service order or ticket.</p>
      </header>
      <section className="scenario-transcript" aria-label="Scripted conversation">
        {messages.map((message, index) => <article className={`scenario-message ${message.speaker === "Marcus" ? "scenario-message-marcus" : "scenario-message-askpat"}`} key={index}>
          <div className="message-byline"><strong>{message.speaker}</strong>{message.time && <span className="scenario-time">{message.time}</span>}</div>
          <div className="scenario-content">{message.blocks.map(renderBlock)}</div>
        </article>)}
      </section>
      <section className="scenario-summary" aria-labelledby="scenario-summary-title">
        <span className="scenario-eyebrow">Scripted record · no ticket was created</span>
        <h2 id="scenario-summary-title">Scenario ticket summary</h2>
        <p>{ticketSummary}</p>
        <h3>Three follow-ups in the script</h3>
        <ul>{followUps.map((followUp) => <li key={followUp}>{followUp}</li>)}</ul>
      </section>
    </div>
  </main>;
}
