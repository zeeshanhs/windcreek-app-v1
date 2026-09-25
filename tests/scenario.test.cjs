/* eslint-disable @typescript-eslint/no-require-imports */
require("./register-ts.cjs");
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { citations, citationByQuery, messages, followUps } = require("../app/scenarios/ahu-15/scenario-data.ts");

test("scripted scenario keeps its complete turn and citation structure", () => {
  assert.equal(messages.length, 12);
  assert.deepEqual(messages.map((message) => message.speaker), Array.from({ length: 12 }, (_, index) => index % 2 ? "AskPat" : "Marcus"));
  assert.deepEqual(messages.filter((message) => message.time).map((message) => message.time), ["2:14 PM", "2:16 PM", "2:31 PM", "2:44 PM", "2:52 PM", "2:55 PM"]);
  assert.equal(followUps.length, 3);
  const markers = messages.flatMap((message) => message.blocks.flatMap((block) => block.kind === "paragraph" ? block.content : block.items.flat()).filter((part) => part.kind === "citation").map((part) => part.id));
  assert.equal(markers.length, 13);
  assert.deepEqual([...new Set(markers)].sort(), [1, 2, 3, 4, 5, 6]);
  assert.ok(markers.every((id) => citationByQuery(String(id)) === citations[id]));
  assert.equal(citationByQuery("../1"), null);
  assert.equal(citationByQuery("7"), null);
  assert.equal(citationByQuery(null), null);
});

test("each citation maps to an unchanged supplied page image", () => {
  const mapped = Object.values(citations);
  assert.equal(mapped.length, 6);
  assert.equal(new Set(mapped.map((citation) => citation.image)).size, 6);
  for (const citation of mapped) {
    const name = path.basename(citation.image);
    const input = fs.readFileSync(path.join(__dirname, "../_PROJECT/tasks/WCAP-002/inputs/citations", name));
    const served = fs.readFileSync(path.join(__dirname, "../public/scenarios/ahu-15", name));
    const digest = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");
    assert.equal(digest(served), digest(input), `Citation ${citation.id} image changed`);
  }
  assert.equal(citations[6].page, 30);
  assert.equal(path.basename(citations[6].image), "UPDATED_M_Series_-_Mechanical_page-30.jpg");
});
