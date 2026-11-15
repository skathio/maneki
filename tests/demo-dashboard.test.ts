import { strict as assert } from "node:assert";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { decryptJson, importKeyText } from "../site/src/lib/crypto.ts";
import type { DashboardIndex, Envelope } from "../site/src/lib/types.ts";
import { demoDashboard } from "../tools/demo-dashboard.ts";
import { index } from "./fixtures/demo-dashboard.ts";

test("demo dashboard encrypts the synthetic payload under the printed key", async () => {
  const dst = await mkdtemp(join(tmpdir(), "maneki-demo-test-"));
  try {
    const { keyText, files } = await demoDashboard(dst);
    assert.equal(files, 2 + index.days.length);
    const env = JSON.parse(await readFile(join(dst, "index.json"), "utf8")) as Envelope;
    const doc = await decryptJson<DashboardIndex>(await importKeyText(keyText), env, "index.json");
    assert.deepEqual(doc, index);
  } finally {
    await rm(dst, { recursive: true, force: true });
  }
});

test("demo dashboard refuses to overwrite the published payload", async () => {
  await assert.rejects(demoDashboard("site/data"), /refusing/);
  await assert.rejects(demoDashboard("site/data/days"), /refusing/);
});
