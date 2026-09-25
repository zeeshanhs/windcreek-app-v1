"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AskPatContext, type StagedPhoto } from "./askpat-context";
import { demoAnswer } from "@/lib/askpat/responses";
import { readState, resetDemo, sendMessage, appendAnswer, recordUnknownFault, subscribe } from "@/lib/askpat/store";
import { scenarioChatId, users, type DemoState, type Reference, type User } from "@/lib/askpat/fixtures";
import ChatsView from "./askpat-chats";
import OrdersView from "./askpat-orders";
import Panels from "./askpat-panels";

const SESSION_KEY = "askpat-demo-user";
const INTENDED_KEY = "askpat-intended-route";

export default function AskPatApp() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<DemoState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [staged, setStaged] = useState<Record<string, StagedPhoto | undefined>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [sendErrors, setSendErrors] = useState<Record<string, string>>({});
  const [waitingChats, setWaitingChats] = useState<Record<string, boolean>>({});
  const [answerFailures, setAnswerFailures] = useState<Record<string, { messageId: string; text: string; references?: Reference[] }>>({});
  const openedPanel = useRef(false);
  const accountMenuRef = useRef<HTMLDetailsElement>(null);
  const signingOut = useRef(false);
  const expiring = useRef(false);
  const sendingNow = useRef(new Set<string>());
  const pendingSendIds = useRef<Record<string, string>>({});
  const usedFaults = useRef(new Set<string>());
  const sessionEpoch = useRef(0);
  const load = useCallback(async () => { setState(await readState()); }, []);

  useEffect(() => { usedFaults.current.clear(); }, [pathname]);

  useEffect(() => {
    let active = true;
    readState().then((loaded) => {
      if (!active) return;
      setState(loaded);
      const saved = sessionStorage.getItem(SESSION_KEY);
      setUser(users.find((candidate) => candidate.id === saved) ?? null);
      setReady(true);
    }).catch(() => { if (active) { setNotice("Changes can't be saved right now. Refresh to try again."); setReady(true); } });
    const unsubscribe = subscribe(() => { readState().then((loaded) => { if (active) setState(loaded); }).catch(() => { if (active) setNotice("We couldn't load this information. Try again."); }); });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (signingOut.current) { if (pathname === "/login") signingOut.current = false; return; }
    if (expiring.current) { if (pathname === "/login") expiring.current = false; return; }
    if (pathname !== "/login" && search.get("reason") === "expired" && user) {
      expiring.current = true;
      sessionEpoch.current += 1;
      sessionStorage.removeItem(SESSION_KEY);
      queueMicrotask(() => { setUser(null); setDrafts({}); setStaged({}); });
      router.replace("/login?reason=expired");
      return;
    }
    if (!user && pathname !== "/login") {
      sessionStorage.setItem(INTENDED_KEY, `${pathname}${search.toString() ? `?${search}` : ""}`);
      router.replace("/login");
    } else if (user && pathname === "/") router.replace("/chats");
    else if (user && pathname === "/scenarios/ahu-15") router.replace(`/chats/${scenarioChatId(user.id)}${search.toString() ? `?${search}` : ""}`, { scroll: false });
  }, [ready, user, pathname, search, router]);

  const navigate = useCallback((path: string, replace = false) => { if (replace) router.replace(path); else router.push(path); }, [router]);
  const openPanel = useCallback((panel: string, sourceId?: string, locator?: string) => {
    const params = new URLSearchParams(search.toString());
    params.set("panel", panel);
    if (panel === "citation" && state?.chats.some((chat) => chat.ownerId === user?.id && chat.scenarioId === "ahu-15" && pathname === `/chats/${chat.id}`)) {
      if (sourceId) params.set("citation", sourceId);
      params.delete("sourceId");
    } else {
      params.delete("citation");
      if (sourceId) params.set("sourceId", sourceId); else params.delete("sourceId");
    }
    if (locator) params.set("locator", locator); else params.delete("locator");
    openedPanel.current = true;
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, search, state, user]);
  const closePanel = useCallback(() => {
    if (openedPanel.current) { openedPanel.current = false; router.back(); }
    else router.replace(pathname, { scroll: false });
  }, [pathname, router]);
  const setDraft = useCallback((key: string, text: string) => setDrafts((current) => ({ ...current, [key]: text })), []);
  const stagePhoto = useCallback((key: string, photo?: StagedPhoto) => setStaged((current) => ({ ...current, [key]: photo })), []);
  const send = useCallback(async (chatId: string | null) => {
    if (!user || !state) return;
    const key = chatId ?? "new";
    const text = drafts[key] ?? "";
    const photo = staged[key];
    if ((!text.trim() && !photo) || sendingNow.current.has(key)) return;
    sendingNow.current.add(key);
    setBusy((current) => ({ ...current, [key]: true }));
    const operationId = pendingSendIds.current[key] ?? crypto.randomUUID();
    pendingSendIds.current[key] = operationId;
    try {
      const sendFault = `${pathname}:send-failure`;
      if (search.get("simulate") === "send-failure" && !usedFaults.current.has(sendFault)) { usedFaults.current.add(sendFault); throw new Error("simulated send rejection"); }
      const sent = await sendMessage({ chatId, ownerId: user.id, text, photo, operationId });
      delete pendingSendIds.current[key];
      setSendErrors((current) => ({ ...current, [key]: "" }));
      setDraft(key, ""); stagePhoto(key);
      await load();
      if (!chatId) navigate(`/chats/${sent.chatId}`);
      const snapshot = await readState();
      const chat = snapshot.chats.find((candidate) => candidate.id === sent.chatId);
      const order = snapshot.orders.find((candidate) => candidate.id === chat?.orderId);
      const answer = demoAnswer(text || "photo", chat, order, !!photo);
      const answerEpoch = sessionEpoch.current;
      setWaitingChats((current) => ({ ...current, [sent.chatId]: true }));
      window.setTimeout(async () => {
        try {
          if (sessionEpoch.current !== answerEpoch || sessionStorage.getItem(SESSION_KEY) !== user.id) return;
          const answerFault = `${pathname}:answer-failure`;
          if (search.get("simulate") === "answer-failure" && !usedFaults.current.has(answerFault)) {
            usedFaults.current.add(answerFault);
            setAnswerFailures((current) => ({ ...current, [sent.chatId]: { messageId: sent.messageId, text: answer.text, references: answer.references } }));
            return;
          }
          let responseText = answer.text;
          if (answer.unknownCode) {
            try {
              const faultLogFault = `${pathname}:fault-log-failure`;
              if (search.get("simulate") === "fault-log-failure" && !usedFaults.current.has(faultLogFault)) { usedFaults.current.add(faultLogFault); throw new Error("simulated fault-log rejection"); }
              await recordUnknownFault(sent.chatId, sent.messageId, answer.unknownCode.equipment, answer.unknownCode.code, chat?.messages.find((message) => message.id === sent.messageId)?.photoId);
              responseText += "\n\nUnrecognized code recorded for this chat.";
            }
            catch { responseText = "No confirmed answer was found. The unknown-fault record wasn't saved; your message is still here."; }
          }
          if (sessionEpoch.current !== answerEpoch || sessionStorage.getItem(SESSION_KEY) !== user.id) return;
          await appendAnswer(sent.chatId, user.id, sent.messageId, responseText, answer.references);
          await load();
        } catch { setAnswerFailures((current) => ({ ...current, [sent.chatId]: { messageId: sent.messageId, text: answer.text, references: answer.references } })); }
        finally { setWaitingChats((current) => ({ ...current, [sent.chatId]: false })); }
      }, 550);
    } catch { setSendErrors((current) => ({ ...current, [key]: "Your message wasn't sent. Try again. Your text and photo are still here." })); }
    finally { sendingNow.current.delete(key); setBusy((current) => ({ ...current, [key]: false })); }
  }, [user, state, drafts, staged, setDraft, stagePhoto, load, navigate, pathname, search]);
  const retryAnswer = useCallback(async (chatId: string) => {
    if (!user) return;
    const pending = answerFailures[chatId];
    if (!pending) return;
    try { await appendAnswer(chatId, user.id, pending.messageId, pending.text, pending.references); await load(); setAnswerFailures((current) => { const next = { ...current }; delete next[chatId]; return next; }); }
    catch { setNotice("We couldn't complete the response. Try again."); }
  }, [answerFailures, user, load]);

  if (!ready) return <main className="loading-screen" role="status">Loading AskPat…</main>;
  if (!state) return <main className="loading-screen"><p>We couldn&apos;t load this information. Try again.</p><button onClick={() => location.reload()}>Retry</button></main>;
  if (!user || pathname === "/login") return <Login currentUser={user} onSignIn={(account) => { sessionStorage.setItem(SESSION_KEY, account.id); setUser(account); setNotice(""); const intended = sessionStorage.getItem(INTENDED_KEY); sessionStorage.removeItem(INTENDED_KEY); router.replace(intended && intended !== "/login" ? intended : "/chats"); }} />;

  const value = { state, user, notice, setNotice, navigate, refresh: load, openPanel, closePanel, drafts, setDraft, staged, stagePhoto, send, sendErrors, waitingChats, answerFailures, retryAnswer };
  return <AskPatContext.Provider value={value}>
    <div className="demo-strip">Prototype · Fictional data</div>
    <header className="site-header">
      <Link href="/chats" className="brand-link" aria-label="Wind Creek Hospitality AskPat home"><Image src="/brand/wind-creek-logo.svg" width={196} height={39} alt="Wind Creek Hospitality" priority /><span>AskPat</span></Link>
      <nav aria-label="Main navigation" className="top-nav"><Link className={pathname.startsWith("/chats") ? "active" : ""} href="/chats">Chats</Link><Link className={pathname.startsWith("/orders") ? "active" : ""} href="/orders">Service orders</Link></nav>
      <div className="account-area"><span className="property-label">Training property</span><details ref={accountMenuRef} className="account-menu"><summary><span className="avatar">{user.initials}</span><span>{user.name} <small>· {user.role}</small></span></summary><div className="account-popup"><strong>{user.name}</strong><span>{user.email}</span><span>{user.role}</span><button type="button" onClick={async () => { sessionEpoch.current += 1; await resetDemo(); pendingSendIds.current = {}; sendingNow.current.clear(); setSendErrors({}); setWaitingChats({}); setAnswerFailures({}); setDrafts({}); setStaged({}); accountMenuRef.current?.removeAttribute("open"); setNotice("Demo reset to its original records."); }}>Reset demo</button><button type="button" onClick={() => { signingOut.current = true; sessionEpoch.current += 1; sessionStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(INTENDED_KEY); pendingSendIds.current = {}; sendingNow.current.clear(); setSendErrors({}); setWaitingChats({}); setAnswerFailures({}); setUser(null); setDrafts({}); setStaged({}); router.replace("/login?reason=signed-out"); }}>Sign out</button></div></details></div>
    </header>
    {notice && <div className="app-notice" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div>}
    {pathname.startsWith("/orders") ? <OrdersView pathname={pathname} /> : pathname.startsWith("/chats") ? <ChatsView pathname={pathname} busy={busy} /> : pathname === "/scenarios/ahu-15" ? <main className="loading-screen" role="status">Opening AHU-15 chat…</main> : <main className="loading-screen">This page isn&apos;t available. <Link href="/chats">Go to your chats</Link></main>}
    <Panels pathname={pathname} panel={search.get("panel")} sourceId={search.get("sourceId")} locator={search.get("locator")} />
  </AskPatContext.Provider>;
}

function Login({ currentUser, onSignIn }: { currentUser: User | null; onSignIn: (user: User) => void }) {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  return <main className="login-page"><div className="demo-strip">Prototype · Fictional data</div><div className="login-inner"><div className="login-brand"><Image src="/brand/wind-creek-logo.svg" width={220} height={43} alt="Wind Creek Hospitality" priority /><span>AskPat</span></div><form noValidate className="login-form" onSubmit={(event) => { event.preventDefault(); if (submitting) return; if (!email.trim()) { setError("Enter your email address."); emailRef.current?.focus(); return; } if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter an email address in the format name@example.com."); emailRef.current?.focus(); return; } if (!password) { setError("Enter your password."); passwordRef.current?.focus(); return; } if (search.get("reason") === "unavailable") { setError("Sign in is unavailable right now. Try again later."); setPassword(""); passwordRef.current?.focus(); return; } setSubmitting(true); const account = users.find((candidate) => candidate.email === email.trim().toLowerCase()); if (account && password === "demo") onSignIn(account); else { setError("Unable to sign in. Check your email and password and try again."); setPassword(""); passwordRef.current?.focus(); } setSubmitting(false); }}>
    <h1>SIGN IN</h1><p>Use your provided email and password to access AskPat.</p>
    {search.get("reason") === "signed-out" && <p className="success-text" role="status">You&apos;re signed out.</p>}{search.get("reason") === "expired" && <p className="error-text" role="alert">Your session has expired. Sign in again to continue. Unsent drafts were cleared.</p>}{search.get("reason") === "unavailable" && <p className="error-text" role="alert">Sign in is unavailable right now. Your information was not submitted. Try again later.</p>}
    <label htmlFor="email">Email address</label><input ref={emailRef} id="email" name="email" type="email" autoComplete="username" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
    <label htmlFor="password">Password</label><div className="password-row"><input ref={passwordRef} id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="quiet" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide password" : "Show password"}</button></div>
    {error && <p className="error-text" role="alert">{error}</p>}<button className="primary full" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button><p className="muted">Accounts are provided by your organization.</p>
  </form><div className="demo-credentials"><strong>Demonstration only. Do not enter real credentials.</strong><p>Fictional accounts: Morgan, Avery, Sam, and Jordan at <code>morgan.reed@example.com</code>, <code>avery.cole@example.com</code>, <code>sam.patel@example.com</code>, and <code>jordan.lane@example.com</code>. Password: <code>demo</code>.</p><button type="button" className="text-button" onClick={() => { setEmail("morgan.reed@example.com"); setPassword("demo"); emailRef.current?.focus(); }}>Fill Morgan&apos;s demo credentials</button></div>{currentUser && <button className="text-button" onClick={() => router.push("/chats")}>Return to chats</button>}</div></main>;
}
