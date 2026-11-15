import { strict as assert } from "node:assert";
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { decryptJson, importKeyText } from "../site/src/lib/crypto.ts";
import type { DashboardIndex, Envelope } from "../site/src/lib/types.ts";
import { demoDashboard } from "../tools/demo-dashboard.ts";
import { index } from "./fixtures/demo-dashboard.ts";

// Every path here is inside a fresh temp dir, with a stand-in for site/data, so
// a regressed guard can never delete the real payload.
async function sandbox(): Promise<{ root: string; guarded: string }> {
  const root = await mkdtemp(join(tmpdir(), "maneki-demo-test-"));
  const guarded = join(root, "site", "data");
  await mkdir(guarded, { recursive: true });
  await writeFile(join(guarded, "keyinfo.json"), "{}");
  return { root, guarded };
}

test("demo dashboard encrypts the synthetic payload under the printed key", async () => {
  const { root, guarded } = await sandbox();
  try {
    const dst = join(root, "out");
    const { keyText, files } = await demoDashboard(dst, guarded);
    assert.equal(files, 2 + index.days.length);
    const env = JSON.parse(await readFile(join(dst, "index.json"), "utf8")) as Envelope;
    const doc = await decryptJson<DashboardIndex>(await importKeyText(keyText), env, "index.json");
    assert.deepEqual(doc, index);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("demo dashboard writes into an existing empty directory", async () => {
  const { root, guarded } = await sandbox();
  try {
    const dst = join(root, "empty");
    await mkdir(dst);
    await demoDashboard(dst, guarded);
    assert.ok((await readdir(dst)).includes("index.json"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("demo dashboard refuses the payload, its ancestors, symlinks to it and non-empty dirs", async () => {
  const { root, guarded } = await sandbox();
  try {
    const link = join(root, "link");
    await symlink(guarded, link);
    const busy = join(root, "busy");
    await mkdir(busy);
    await writeFile(join(busy, "keep.txt"), "x");
    const file = join(root, "file.txt");
    await writeFile(file, "x");
    for (const dst of [guarded, join(guarded, "days"), join(root, "site"), root, link, busy, file]) {
      await assert.rejects(demoDashboard(dst, guarded), /refusing/, dst);
    }
    assert.deepEqual(await readdir(guarded), ["keyinfo.json"]);
    assert.deepEqual(await readdir(busy), ["keep.txt"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
