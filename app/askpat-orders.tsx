"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAskPat } from "./askpat-context";
import { issueFor, issues, locationFor, locations, userFor, formatTime, type Issue, type Location, type Order } from "@/lib/askpat/fixtures";
import { addRemark, createOrder, getOrCreateLinkedChat, readState } from "@/lib/askpat/store";

let listMemory = { query: "", status: "all", sort: "newest", scroll: 0 };
const statusLabel = (order: Order) => order.status === "open" ? "Open" : "Closed";

export default function OrdersView({ pathname }: { pathname: string }) {
  const { state } = useAskPat();
  const id = pathname.split("/")[2];
  if (id === "new") return <OrderForm />;
  if (id) {
    const order = state.orders.find((candidate) => candidate.id === id);
    return order ? <OrderDetail order={order} /> : <main className="content-page"><p>This item isn&apos;t available to your account.</p><Link href="/orders">Back to service orders</Link></main>;
  }
  return <OrderList />;
}

function OrderList() {
  const { state, notice } = useAskPat();
  const [query, setQuery] = useState(listMemory.query);
  const [status, setStatus] = useState(listMemory.status);
  const [sort, setSort] = useState(listMemory.sort);
  useEffect(() => { window.scrollTo(0, listMemory.scroll); return () => { listMemory.scroll = window.scrollY; }; }, []);
  useEffect(() => { listMemory = { ...listMemory, query, status, sort }; }, [query, status, sort]);
  const all = state.orders;
  const filtered = all.filter((order) => {
    if (status !== "all" && order.status !== status) return false;
    const haystack = `${order.id} ${issueFor(order.issueId)?.label} ${locationFor(order.locationId)?.label}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  }).sort((a, b) => sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt));
  return <main className="content-page order-list-page"><div className="page-heading"><div><h1>SERVICE ORDERS</h1><p>View reported issues and open an order for details.</p></div><Link className="primary" href="/orders/new">New service order</Link></div>
    <div className="list-tools"><div className="field"><label htmlFor="order-search">Search service orders</label><div className="search-row"><input id="order-search" placeholder="Order number, issue or location" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button className="quiet" onClick={() => setQuery("")}>Clear search</button>}</div></div><label className="sort-field">Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Created: newest first</option><option value="oldest">Created: oldest first</option></select></label></div>
    <div className="filter-row" aria-label="Order status filter">{(["all", "open", "closed"] as const).map((value) => <button key={value} type="button" aria-pressed={status === value} className={status === value ? "selected" : ""} onClick={() => setStatus(value)}>{value === "all" ? "All" : value === "open" ? "Open" : "Closed"} {value === "all" ? all.length : all.filter((item) => item.status === value).length}</button>)}</div>
    <p className="result-count" role="status">{filtered.length} {filtered.length === 1 ? "order matches" : "orders match"}{notice.includes("created") ? ` · ${notice}` : ""}</p>
    {all.length === 0 ? <div className="empty-state"><p>No service orders yet. Report an issue to create the first one.</p><Link href="/orders/new">New service order</Link></div> : filtered.length === 0 ? <div className="empty-state"><p>No orders match these filters. Clear a filter or try another search.</p><button className="text-button" onClick={() => { setQuery(""); setStatus("all"); }}>Clear filters</button></div> : <><div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>Order</th><th>Issue</th><th>Location</th><th>Requested by</th><th>Created</th><th>Status</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id}><td><Link href={`/orders/${order.id}`} aria-label={`View service order ${order.id}: ${issueFor(order.issueId)?.label}`}>SO #{order.id}</Link></td><td>{issueFor(order.issueId)?.label}</td><td>{locationFor(order.locationId)?.label}</td><td>{userFor(order.requesterId)?.name}</td><td>{formatTime(order.createdAt)}</td><td><Status order={order} /></td></tr>)}</tbody></table></div><div className="mobile-orders">{filtered.map((order) => <article className="mobile-order" key={order.id}><div className="mobile-order-top"><Link href={`/orders/${order.id}`}>SO #{order.id}</Link><Status order={order} /></div><strong>{issueFor(order.issueId)?.label}</strong><dl><dt>Location</dt><dd>{locationFor(order.locationId)?.label}</dd><dt>Requested by</dt><dd>{userFor(order.requesterId)?.name}</dd><dt>Created</dt><dd>{formatTime(order.createdAt)}</dd></dl></article>)}</div></>}
  </main>;
}

function Status({ order }: { order: Order }) { return <span className={`status status-${order.status}`}>{statusLabel(order)}</span>; }

type Choice = Issue | Location;
function SearchPicker<T extends Choice>({ label, value, items, categoryKey, onSelect, error }: { label: string; value: string; items: T[]; categoryKey: "category" | "area"; onSelect: (id: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [active, setActive] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const categories = Array.from(new Set(items.map((item) => categoryKey === "category" ? (item as Issue).category : (item as Location).area)));
  const filtered = items.filter((item) => (category === "all" || (categoryKey === "category" ? (item as Issue).category : (item as Location).area) === category) && `${item.label} ${item.id}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { if (open) searchRef.current?.focus(); }, [open]);
  const selected = items.find((item) => item.id === value);
  return <div className="field picker-field"><label>{label} — required</label><p className="field-help">Filter by {categoryKey === "category" ? "category or search all issues" : "area or search rooms and locations"}, then choose one.</p><button ref={triggerRef} type="button" className="picker-trigger" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((current) => !current)}>{selected?.label ?? `Choose ${categoryKey === "category" ? "an issue" : "a location"}…`} <span aria-hidden="true">⌄</span></button>{error && <p className="error-text">{error}</p>}
    {open && <div className="picker-popover" role="dialog" aria-label={`Choose ${categoryKey === "category" ? "issue" : "location"}`} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setOpen(false); triggerRef.current?.focus(); } if (event.key === "ArrowDown") { event.preventDefault(); setActive((current) => Math.min(current + 1, filtered.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActive((current) => Math.max(current - 1, 0)); } if (event.key === "Enter" && document.activeElement === searchRef.current && filtered[active]) { event.preventDefault(); onSelect(filtered[active].id); setOpen(false); triggerRef.current?.focus(); } }}><div className="picker-head"><strong>Choose {categoryKey === "category" ? "issue" : "location"}</strong><button type="button" className="quiet" onClick={() => { setOpen(false); triggerRef.current?.focus(); }}>Close</button></div><label htmlFor={`${categoryKey}-search`}>Search {categoryKey === "category" ? "issues" : "locations"}</label><input ref={searchRef} id={`${categoryKey}-search`} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} /><label htmlFor={`${categoryKey}-filter`}>{categoryKey === "category" ? "Category" : "Area"}</label><select id={`${categoryKey}-filter`} value={category} onChange={(event) => { setCategory(event.target.value); setActive(0); }}><option value="all">All {categoryKey === "category" ? "categories" : "areas"}</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><p className="result-count" role="status">{filtered.length} matches</p><div className="picker-results" role="listbox" aria-label={label}>{filtered.length ? filtered.map((item, index) => <button key={item.id} type="button" role="option" aria-selected={item.id === value} className={index === active ? "highlighted" : ""} onMouseEnter={() => setActive(index)} onClick={() => { onSelect(item.id); setOpen(false); triggerRef.current?.focus(); }}><strong>{item.label}</strong><small>{categoryKey === "category" ? (item as Issue).category : (item as Location).area} · {item.id}</small></button>) : <p>No matches. Try different words or another category.</p>}</div><button type="button" className="text-button" onClick={() => { setQuery(""); setCategory("all"); }}>Reset filter</button></div>}
  </div>;
}

function OrderForm() {
  const { user, setNotice, navigate } = useAskPat();
  const search = useSearchParams();
  const [issueId, setIssueId] = useState(""); const [locationId, setLocationId] = useState(""); const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({}); const [working, setWorking] = useState(false); const [failure, setFailure] = useState("");
  const operationId = useRef(crypto.randomUUID());
  const simulatedFailureUsed = useRef(false);
  const ready = !!issueId && !!locationId && !!remark.trim();
  return <main className="content-page form-page"><Link className="back-link" href="/orders">← Back to service orders</Link><h1>NEW SERVICE ORDER</h1><p>Tell the technician team what needs attention and where. All three fields are required.</p><p className="context-line">Requested by {user.name} · Training property</p>
    <form onSubmit={async (event) => { event.preventDefault(); const nextErrors = { issue: !issueId ? "Choose an issue." : "", location: !locationId ? "Choose a location." : "", remark: !remark.trim() ? "Add a short description of the problem." : "" }; setErrors(nextErrors); if (Object.values(nextErrors).some(Boolean)) return; setWorking(true); setFailure(""); try { if (!simulatedFailureUsed.current && search.get("simulate")?.startsWith("create-")) { simulatedFailureUsed.current = true; throw new Error(search.get("simulate") ?? ""); } const id = await createOrder({ issueId, locationId, remark, requesterId: user.id }, operationId.current); setNotice(`Service order SO #${id} created.`); navigate("/orders"); } catch (failure) { setFailure(failure instanceof Error && failure.message === "create-uncertain" ? "We haven't confirmed whether the order was created. Check the list before trying again." : "The order wasn't created. Your information has been kept. Try again."); } finally { setWorking(false); } }}>
      <SearchPicker label="Issue" value={issueId} items={issues} categoryKey="category" onSelect={(id) => { setIssueId(id); setErrors((e) => ({ ...e, issue: "" })); }} error={errors.issue} />
      <SearchPicker label="Location" value={locationId} items={locations} categoryKey="area" onSelect={(id) => { setLocationId(id); setErrors((e) => ({ ...e, location: "" })); }} error={errors.location} />
      <div className="field"><label htmlFor="new-remark">New Remark — required</label><p className="field-help">Describe what you observed so the technician team can investigate.</p><textarea id="new-remark" rows={6} maxLength={2000} value={remark} onChange={(event) => setRemark(event.target.value)} />{errors.remark && <p className="error-text">{errors.remark}</p>}<small>{remark.length} / 2,000 characters</small></div>
      {!ready && <p className="field-help">{issueId && locationId ? "Add a short description of the problem. Spaces alone can't be submitted." : "Choose an issue and location, then add a remark to continue."}</p>}{failure && <p className="error-text" role="alert">{failure}</p>}{(failure.includes("Check the list") || failure.includes("list couldn't be checked")) && <button type="button" className="outline" onClick={async () => { try { const latest = await readState(); const id = latest.receipts[operationId.current]; if (id && latest.orders.some((order) => order.id === id)) { setNotice(`Service order SO #${id} was created.`); navigate("/orders"); } else setFailure("No order was found for this request. Your draft is here; you can retry safely."); } catch { setFailure("The list couldn't be checked. Your draft is here; try checking again."); } }}>Check order list</button>}<div className="form-actions"><button type="submit" className="primary" disabled={!ready || working}>{working ? "Creating service order…" : "Create service order"}</button><button type="button" className="quiet" onClick={() => { if (issueId || locationId || remark) { if (!window.confirm("Discard this service order draft? No service order has been created.")) return; } navigate("/orders"); }}>Cancel</button></div>
    </form>
  </main>;
}

function OrderDetail({ order }: { order: Order }) {
  const { user, state, navigate, openPanel, setNotice, refresh, drafts, setDraft } = useAskPat();
  const remarkKey = `remark:${order.id}`; const remark = drafts[remarkKey] ?? "";
  const [saving, setSaving] = useState(false); const [remarkError, setRemarkError] = useState(""); const [remarkOpen, setRemarkOpen] = useState(!!remark); const [openingChat, setOpeningChat] = useState(false);
  const remarkOperation = useRef(crypto.randomUUID());
  const linked = state.chats.find((chat) => chat.ownerId === user.id && chat.orderId === order.id);
  return <main className="content-page detail-page"><p className="breadcrumb"><Link href="/orders">Service orders</Link> / SO #{order.id}</p><div className="detail-heading"><div><span className="eyebrow">SO #{order.id}</span><h1>{issueFor(order.issueId)?.label.toUpperCase()}</h1><Status order={order} /></div><div className="detail-actions"><button className="primary" disabled={openingChat} onClick={async () => { setOpeningChat(true); try { const id = await getOrCreateLinkedChat(user.id, order.id, crypto.randomUUID()); await refresh(); navigate(`/chats/${id}`); } catch { setNotice("We couldn't open the order chat. Try again."); } finally { setOpeningChat(false); } }}>{openingChat ? "Opening your order chat…" : linked ? "Continue your chat" : "Chat about this order"}</button>{order.status === "open" && <button className="outline" onClick={() => openPanel("close-order")}>Close order</button>}</div></div>
    <div className="detail-grid"><div className="detail-main"><section><h2>Reported issue</h2><p>{order.remarks[0]?.text}</p></section><section><div className="section-heading"><h2>Remarks</h2>{order.status === "open" && !remarkOpen && <button className="text-button" onClick={() => setRemarkOpen(true)}>Add remark</button>}</div><ol className="remarks-list">{order.remarks.slice(1).map((item) => <li key={item.id}><p>{item.text}</p><small>{userFor(item.authorId)?.name} · {formatTime(item.at)}</small></li>)}</ol>{order.remarks.length === 1 && <p className="muted">No additional remarks.</p>}{order.status === "closed" ? <p className="muted">This order is closed. Remarks are read-only.</p> : remarkOpen && <form onSubmit={async (event) => { event.preventDefault(); if (!remark.trim()) { setRemarkError("Add a remark."); return; } setSaving(true); try { await addRemark(order.id, user.id, remark, remarkOperation.current); remarkOperation.current = crypto.randomUUID(); await refresh(); setDraft(remarkKey, ""); setRemarkOpen(false); setRemarkError(""); setNotice("Remark added."); } catch { setRemarkError("The remark wasn't saved. Your text has been kept."); } finally { setSaving(false); } }}><label htmlFor="remark-text">Remark</label><textarea id="remark-text" rows={5} maxLength={2000} value={remark} onChange={(event) => setDraft(remarkKey, event.target.value)} />{remarkError && <p className="error-text" role="alert">{remarkError}</p>}<div className="form-actions"><button className="primary" disabled={saving || !remark.trim()}>{saving ? "Saving remark…" : "Save remark"}</button><button type="button" className="quiet" onClick={() => { setRemarkOpen(false); setDraft(remarkKey, ""); remarkOperation.current = crypto.randomUUID(); }}>Cancel</button></div></form>}</section><section><details className="history"><summary>Order history</summary><ol>{order.events.map((event) => <li key={event.id}><strong>{event.kind === "created" ? "Created" : event.kind === "remark" ? "Remark added" : "Closed"}</strong> · {userFor(event.actorId)?.name} · {formatTime(event.at)}{event.kind === "closed" && event.text ? <p>{event.text}</p> : null}</li>)}</ol></details></section></div><aside className="detail-meta"><h2>Order information</h2><dl><dt>Location</dt><dd>{locationFor(order.locationId)?.label}</dd><dt>Equipment</dt><dd>{order.equipment ?? "Not identified"}{order.equipment && <small>Demo register association</small>}</dd><dt>Requested by</dt><dd>{userFor(order.requesterId)?.name}</dd><dt>Created</dt><dd>{formatTime(order.createdAt)}</dd><dt>Property</dt><dd>Training property</dd></dl>{order.closure && <div className="closure-summary"><h3>Closure explanation</h3><p>{order.closure.note}</p><small>{userFor(order.closure.actorId)?.name} · {formatTime(order.closure.at)}</small></div>}</aside></div>
  </main>;
}
