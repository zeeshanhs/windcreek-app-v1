"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAskPat } from "@/app/askpat-context";
import { citationByQuery } from "./scenario-data";

export default function CitationViewer({ citationValue }: { citationValue: string | null }) {
  const { closePanel } = useAskPat();
  const citation = citationByQuery(citationValue);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const dialog = dialogRef.current;
    const returnFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); returnFocus?.focus(); };
  }, []);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => setViewport({ width: element.clientWidth, height: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [citation]);

  const fitScale = citation && viewport.width && viewport.height
    ? Math.min((viewport.width - 16) / citation.width, (viewport.height - 16) / citation.height, 1)
    : 0;
  const maxZoom = fitScale ? 1 / fitScale : 1;
  const actualZoom = Math.min(zoom, maxZoom);
  const imageWidth = citation && fitScale ? Math.round(citation.width * fitScale * actualZoom) : 0;
  const imageHeight = citation && fitScale ? Math.round(citation.height * fitScale * actualZoom) : 0;

  const changeZoom = (next: number) => {
    const scrollport = viewportRef.current;
    const oldWidth = imageWidth;
    const oldHeight = imageHeight;
    const centerX = scrollport ? (scrollport.scrollLeft + scrollport.clientWidth / 2) / Math.max(oldWidth, 1) : 0.5;
    const centerY = scrollport ? (scrollport.scrollTop + scrollport.clientHeight / 2) / Math.max(oldHeight, 1) : 0.5;
    const clamped = Math.min(Math.max(next, 1), maxZoom);
    setZoom(clamped);
    if (scrollport && citation && fitScale) {
      requestAnimationFrame(() => {
        const nextWidth = citation.width * fitScale * clamped;
        const nextHeight = citation.height * fitScale * clamped;
        scrollport.scrollLeft = Math.max(0, centerX * nextWidth - scrollport.clientWidth / 2);
        scrollport.scrollTop = Math.max(0, centerY * nextHeight - scrollport.clientHeight / 2);
      });
    }
  };

  return <dialog ref={dialogRef} className="app-dialog citation-dialog" aria-label={citation ? `Citation ${citation.id} document viewer` : "Citation unavailable"} onCancel={(event) => { event.preventDefault(); closePanel(); }}>
    <div className="citation-dialog-head">
      <div>
        <span className="scenario-eyebrow">{citation ? `Citation [${citation.id}] · Full page` : "Citation unavailable"}</span>
        <h2>{citation ? citation.document : "Citation unavailable"}</h2>
        {citation && <p>{citation.sheet} · PDF page {citation.page}</p>}
      </div>
      <button type="button" className="icon-button citation-close" aria-label="Close citation viewer" onClick={closePanel}>×</button>
    </div>
    {citation ? <>
      <div className="citation-toolbar" aria-label="Document zoom controls">
        <button type="button" className="outline" disabled={!fitScale || actualZoom <= 1} onClick={() => changeZoom(actualZoom / 1.5)}>Zoom out</button>
        <span role="status" aria-live="polite">{Math.round(actualZoom * 100)}% of fit</span>
        <button type="button" className="outline" disabled={!fitScale || actualZoom >= maxZoom} onClick={() => changeZoom(actualZoom * 1.5)}>Zoom in</button>
        <button type="button" className="quiet" disabled={!fitScale || actualZoom <= 1} onClick={() => changeZoom(1)}>Fit page</button>
      </div>
      <div className="citation-viewport" ref={viewportRef} aria-label={`${citation.sheet}, full page image`}>
        {loadState === "loading" && <p className="citation-feedback" role="status">Loading citation page…</p>}
        {loadState === "error" && <div className="citation-feedback" role="alert"><p>We couldn&apos;t load this citation page. The image is unavailable.</p><button type="button" className="outline" onClick={() => { setLoadState("loading"); setAttempt((value) => value + 1); }}>Retry image</button></div>}
        {fitScale > 0 && loadState !== "error" && <div className="citation-image-frame" style={{ width: imageWidth, height: imageHeight }}>
          <Image
            key={attempt}
            unoptimized
            src={`${citation.image}${attempt ? `?retry=${attempt}` : ""}`}
            alt={`Full page scan of ${citation.sheet}, PDF page ${citation.page}`}
            width={citation.width}
            height={citation.height}
            loading="eager"
            style={{ width: imageWidth, height: imageHeight, maxWidth: "none" }}
            onLoad={() => setLoadState("ready")}
            onError={() => setLoadState("error")}
          />
        </div>}
      </div>
    </> : <div className="citation-unavailable" role="alert"><p>Citation {citationValue ? `[${citationValue}]` : "number"} is unavailable. Choose a marker numbered 1 through 6 in the scenario.</p></div>}
  </dialog>;
}
