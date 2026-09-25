"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAskPat } from "./askpat-context";
import { formatTime, issueFor, locationFor, sourceRecords, userFor, type Order } from "@/lib/askpat/fixtures";
import { AlreadyClosedError, VersionConflictError, closeOrder, readState } from "@/lib/askpat/store";
import CitationViewer from "./scenarios/ahu-15/citation-viewer";

export default function Panels({ pathname, panel, sourceId, locator }: { pathname: string; panel: string | null; sourceId: string | null; locator: string | null }) {
  const { state, user, closePanel } = useAskPat();
  const search = useSearchParams();
  const chatId = pathname.startsWith("/chats/") && pathname !== "/chats/new" ? pathname.split("/")[2] : null;
  const chat = state.chats.find((item) => item.id === chatId && item.ownerId === user.id);
  const orderId = pathname.startsWith("/orders/") && pathname !== "/orders/new" ? pathname.split("/")[2] : chat?.orderId;
  const order = state.orders.find((item) => item.id === orderId);
  const isChatRoute = pathname.startsWith("/chats/") || pathname === "/chats";
  if (!panel) return null;
  if (pathname === "/scenarios/ahu-15") return null;
  if (panel === "citation" && chat?.scenarioId === "ahu-15") return <CitationViewer key={search.get("citation") ?? "invalid"} citationValue={search.get("citation")} />;
  if (panel === "order" && order && chat) return <Dialog title="ORDER INFORMATION" onClose={closePanel}><OrderInfo order={order} anchor={sourceId} /></Dialog>;
  if (panel === "close-order" && order) return search.get("simulate") === "order-context-failed" && order.status === "open"
    ? <Dialog title="CLOSE SERVICE ORDER" onClose={closePanel}><p>Order information couldn&apos;t be refreshed. The last loaded state was Open. Return to the conversation and retry context before closing.</p></Dialog>
    : <CloseOrderPanel order={order} />;
  if (panel === "photo" && isChatRoute && (pathname === "/chats/new" || pathname === "/chats" || !!chat)) return <PhotoPanel chatId={chat?.id ?? null} />;
  if (panel === "source" && chat && sourceId) {
    const permitted = sourceId === "ahu1-points.pdf" || chat.messages.some((message) => message.references?.some((reference) => reference.kind === "source" && reference.id === sourceId));
    return <Dialog title="SOURCE REFERENCE" onClose={closePanel}><SourceViewer key={sourceId} sourceId={permitted ? sourceId : "denied"} locator={locator} simulateFailure={search.get("simulate") === "source-load-failed"} /></Dialog>;
  }
  return <Dialog title="Unavailable" onClose={closePanel}><p>This item isn&apos;t available to your account.</p></Dialog>;
}

function CloseOrderPanel({ order }: { order: Order }) {
  const { closePanel } = useAskPat();
  const [dirty, setDirty] = useState(false);
  const requestClose = () => { if (dirty && !window.confirm("Discard this resolution note? The order will stay open.")) return; closePanel(); };
  return <Dialog title="CLOSE SERVICE ORDER" onClose={requestClose}><CloseOrder order={order} onDirty={setDirty} onRequestClose={requestClose} /></Dialog>;
}

function PhotoPanel({ chatId }: { chatId: string | null }) {
  const { closePanel } = useAskPat();
  const [dirty, setDirty] = useState(false);
  const requestClose = () => { if (dirty && !window.confirm("Discard the selected photo? Your chat text will be kept.")) return; closePanel(); };
  return <Dialog title="ADD A PHOTO" onClose={requestClose}><PhotoPicker chatId={chatId} onDirty={setDirty} onRequestClose={requestClose} /></Dialog>;
}

function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const element = dialog.current;
    returnFocus.current = document.activeElement as HTMLElement;
    element?.showModal();
    return () => { element?.close(); returnFocus.current?.focus(); };
  }, []);
  return <dialog ref={dialog} className={`app-dialog ${title === "SOURCE REFERENCE" ? "source-dialog" : ""}`} aria-label={title} onCancel={(event) => { event.preventDefault(); onClose(); }}><div className="dialog-head"><h2>{title}</h2><button type="button" className="icon-button" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>×</button></div><div className="dialog-body">{children}</div></dialog>;
}

function OrderInfo({ order, anchor }: { order: Order; anchor: string | null }) {
  const { navigate, openPanel } = useAskPat();
  const remarkHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (anchor === "remark") requestAnimationFrame(() => { remarkHeading.current?.scrollIntoView({ block: "start" }); remarkHeading.current?.focus(); }); }, [anchor]);
  return <><div className="order-summary"><strong>SO #{order.id}</strong><span className={`status status-${order.status}`}>{order.status === "open" ? "Open" : "Closed"}</span></div><h3>{issueFor(order.issueId)?.label}</h3><dl className="info-list"><dt>Location</dt><dd>{locationFor(order.locationId)?.label}</dd><dt>Equipment</dt><dd>{order.equipment ?? "Not identified"}</dd><dt>Requested by</dt><dd>{userFor(order.requesterId)?.name}</dd><dt>Created</dt><dd>{formatTime(order.createdAt)}</dd><dt>Property</dt><dd>Training property</dd></dl><section className="dialog-section" id="order-reported-issue"><h3 ref={remarkHeading} tabIndex={-1}>Reported issue</h3><p>{order.remarks[0]?.text}</p></section><section className="dialog-section"><h3>Remarks</h3>{order.remarks.slice(1).map((item) => <p key={item.id}>{item.text}<small className="block">{userFor(item.authorId)?.name} · {formatTime(item.at)}</small></p>)}{order.remarks.length === 1 && <p>No additional remarks.</p>}</section>{order.closure && <section className="dialog-section"><h3>Closure explanation</h3><p>{order.closure.note}</p><small>{userFor(order.closure.actorId)?.name} · {formatTime(order.closure.at)}</small></section>}<details className="history"><summary>Order history</summary><ol>{order.events.map((event) => <li key={event.id}>{event.kind === "created" ? "Created" : event.kind === "remark" ? "Remark added" : "Closed"} · {userFor(event.actorId)?.name} · {formatTime(event.at)}</li>)}</ol></details><div className="dialog-actions"><button className="outline" onClick={() => navigate(`/orders/${order.id}`)}>View order</button>{order.status === "open" && <button className="quiet" onClick={() => openPanel("close-order")}>Close order</button>}</div></>;
}

function CloseOrder({ order, onDirty, onRequestClose }: { order: Order; onDirty: (dirty: boolean) => void; onRequestClose: () => void }) {
  const { user, closePanel, refresh, setNotice } = useAskPat();
  const search = useSearchParams();
  const [note, setNote] = useState(""); const [working, setWorking] = useState(false); const [error, setError] = useState(""); const [current, setCurrent] = useState(order);
  const operationId = useRef(crypto.randomUUID());
  const expectedVersion = useRef(order.version);
  const simulatedFailureUsed = useRef(false);
  if (current.status === "closed") return <><p>This order has already been closed.</p><p>{current.closure?.note}</p><small>{current.closure && `${userFor(current.closure.actorId)?.name} · ${formatTime(current.closure.at)}`}</small><div className="dialog-actions"><button className="outline" onClick={closePanel}>Return to order</button></div></>;
  return <><div className="order-summary"><strong>SO #{current.id}</strong><span className="status status-open">Open</span></div><p>{issueFor(current.issueId)?.label} · {locationFor(current.locationId)?.label}</p><p>This will mark the service order Closed. Its chats will remain available. Work-session controls are managed outside AskPat.</p><form onSubmit={async (event) => { event.preventDefault(); if (!note.trim()) { setError("Add a resolution note."); return; } setWorking(true); setError(""); try { if (!simulatedFailureUsed.current && search.get("simulate")?.startsWith("close-")) { simulatedFailureUsed.current = true; throw new Error(search.get("simulate") ?? ""); } await closeOrder(current.id, user.id, note, expectedVersion.current, operationId.current); await refresh(); setNotice(`Service order SO #${current.id} closed.`); closePanel(); } catch (failure) { if (failure instanceof AlreadyClosedError) { setCurrent(failure.order); await refresh(); } else if (failure instanceof VersionConflictError) { setCurrent(failure.order); expectedVersion.current = failure.order.version; setError("The order changed while you were reviewing it. Review the current details before closing."); await refresh(); } else if (failure instanceof Error && failure.message === "close-uncertain") setError("Closure has not been confirmed. Refresh the order before trying again."); else setError("The order is still Open. Your note has been kept. Try again."); } finally { setWorking(false); } }}><label htmlFor="resolution-note">Resolution note — required</label><p className="field-help">Explain why this order is being closed and any follow-up that remains.</p><textarea id="resolution-note" rows={6} maxLength={2000} value={note} onChange={(event) => { setNote(event.target.value); onDirty(!!event.target.value.trim()); }} /><small>{note.length} / 2,000 characters</small>{!note.trim() && <p className="field-help">Add a resolution note to continue.</p>}{error && <p className="error-text" role="alert">{error}</p>}{error.includes("Refresh the order") && <button type="button" className="outline" onClick={async () => { const latest = (await readState()).orders.find((candidate) => candidate.id === current.id); if (latest) { setCurrent(latest); expectedVersion.current = latest.version; await refresh(); setError(""); } }}>Refresh order</button>}<div className="dialog-actions"><button type="button" className="quiet" disabled={working} onClick={onRequestClose}>Cancel</button><button className="primary" disabled={!note.trim() || working}>{working ? "Closing service order…" : "Close service order"}</button></div></form></>;
}

function PhotoPicker({ chatId, onDirty, onRequestClose }: { chatId: string | null; onDirty: (dirty: boolean) => void; onRequestClose: () => void }) {
  const { closePanel, stagePhoto, staged } = useAskPat();
  const key = chatId ?? "new";
  const [file, setFile] = useState<File | null>(staged[key]?.file ?? null); const [description, setDescription] = useState(staged[key]?.description ?? ""); const [error, setError] = useState(""); const [url, setUrl] = useState(""); const [previewFailed, setPreviewFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!file) return; const objectUrl = URL.createObjectURL(file); queueMicrotask(() => setUrl(objectUrl)); return () => URL.revokeObjectURL(objectUrl); }, [file]);
  const choose = (files: FileList | File[]) => { if (files.length > 1) { setError("Add one photo at a time in this prototype."); return; } const candidate = files[0]; if (!candidate) return; if (!["image/png", "image/jpeg"].includes(candidate.type)) { setError("Choose a PNG or JPEG image. Documents aren't uploaded here."); return; } if (candidate.size > 10 * 1024 * 1024) { setError("This photo is larger than 10 MB. Choose a smaller image."); return; } setFile(candidate); setPreviewFailed(false); onDirty(true); setError(""); };
  return <><p>Add a photo of the equipment or label you want to discuss.</p><div className="photo-drop" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files); }}><span aria-hidden="true">▧</span><p>Choose a photo or drop it here</p><button className="outline" onClick={() => input.current?.click()}>Choose file</button><input ref={input} className="sr-only" type="file" accept="image/png,image/jpeg" multiple onChange={(event) => { if (event.target.files) choose(event.target.files); }} /><small>PNG or JPEG · Up to 10 MB · One photo per message</small></div>{error && <p className="error-text" role="alert">{error}</p>}{file && <div className="photo-preview">{url && <Image unoptimized src={url} alt={`Preview of selected photo ${file.name}`} width={400} height={300} onError={() => { setPreviewFailed(true); setError("We couldn't read this photo. Choose a different PNG or JPEG."); }} />}<strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small><label htmlFor="photo-description">Photo description — optional</label><input id="photo-description" value={description} onChange={(event) => { setDescription(event.target.value); onDirty(true); }} /><div className="photo-mini-actions"><button className="quiet" onClick={() => input.current?.click()}>Replace photo</button><button className="quiet" onClick={() => { setFile(null); setUrl(""); onDirty(true); }}>Remove photo</button></div></div>}<div className="dialog-actions"><button className="quiet" onClick={onRequestClose}>Cancel</button><button className="primary" disabled={!file || previewFailed} onClick={() => { if (!file || previewFailed) return; stagePhoto(key, { file, description }); closePanel(); }}>Add to message</button></div></>;
}

function SourceViewer({ sourceId, locator, simulateFailure }: { sourceId: string; locator: string | null; simulateFailure: boolean }) {
  const { closePanel, openPanel } = useAskPat();
  const [retried, setRetried] = useState(false);
  const source = sourceRecords[sourceId as keyof typeof sourceRecords];
  if (sourceId === "denied") return <><p>This source isn&apos;t available to your account.</p><div className="dialog-actions"><button className="outline" onClick={closePanel}>Close</button></div></>;
  if (!source) return <><p>The source file isn&apos;t available in this prototype.</p><p className="muted">The reference exists in the supplied HTML, but its document was not supplied.</p><div className="dialog-actions"><button className="outline" onClick={closePanel}>Close</button></div></>;
  if (simulateFailure && !retried) return <><p role="alert">We couldn&apos;t open the source. Try again.</p><div className="dialog-actions"><button className="outline" onClick={() => setRetried(true)}>Retry source</button><button className="quiet" onClick={closePanel}>Close</button></div></>;
  const cited = locator ?? (sourceId === "DF-S01" ? "EQ-D01" : null);
  return <><div className="source-meta"><span className="demo-source">Demo source</span><h3>{source.title}</h3><p>{source.version}{cited ? ` · ${cited.startsWith("EQ-") ? "Entry " : ""}${cited}` : ""}</p><p>Authored training record, not an actual property document.</p></div>{"rows" in source && <div className="source-table-wrap"><table className="source-table"><thead><tr><th>Entry</th><th>Equipment tag</th><th>Listed service area</th><th>Listed equipment location</th></tr></thead><tbody>{source.rows.map((row) => <tr key={row[0]} className={row[0] === cited ? "cited-row" : ""}><td>{row[0]} {row[0] === cited && <small>Cited entry</small>}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td></tr>)}</tbody></table></div>}{"text" in source && <p className="source-text">{source.text}</p>}{"steps" in source && <ol className="source-steps">{source.steps.map((step, index) => <li className={cited === `Step ${index + 1}` ? "cited-row" : ""} key={step}>{step}{cited === `Step ${index + 1}` && <small> Cited step</small>}</li>)}</ol>}{sourceId === "DF-S01" && <button className="text-button" onClick={() => openPanel("source", "ahu1-points.pdf")}>Original referenced PDF (unavailable)</button>}<div className="dialog-actions"><button className="outline" onClick={closePanel}>Close</button></div></>;
}
