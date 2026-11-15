#!/usr/bin/env node
// =============================================================================
// Encrypt the synthetic demo payload (tests/fixtures/demo-dashboard.ts) with a
// fresh throwaway key, so the unlocked dashboard can be built, served and
// screenshotted without the real key or the licensed real data.
//
//   node tools/demo-dashboard.ts --dst <dir>    then: node tools/build.ts --data <dir>
//
// Prints the throwaway key on stdout; open the served site at `#k=<key>`.
// Refuses to write into site/data/, which holds the real published ciphertext.
// =============================================================================
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyText } from "../site/src/lib/crypto.ts";
import { days, index, ledger } from "../tests/fixtures/demo-dashboard.ts";
import { encryptDashboard } from "./encrypt-dashboard.ts";

const REAL_DATA = resolve(dirname(fileURLToPath(import.meta.url)), "..", "site", "data");

export async function demoDashboard(dst: string): Promise<{ keyText: string; files: number }> {
  const target = resolve(dst);
  if (target === REAL_DATA || target.startsWith(`${REAL_DATA}/`)) throw new Error(`refusing to overwrite the published payload in ${REAL_DATA}`);
  const src = await mkdtemp(join(tmpdir(), "maneki-demo-"));
  try {
    const plain: Record<string, unknown> = { "index.json": index, "ledger.json": ledger };
    for (const [date, day] of Object.entries(days)) plain[`days/${date}.json`] = day;
    for (const [rel, doc] of Object.entries(plain)) {
      await mkdir(dirname(join(src, rel)), { recursive: true });
      await writeFile(join(src, rel), JSON.stringify(doc));
    }
    const keyText = generateKeyText();
    const { files } = await encryptDashboard({ src, dst: target, keyText });
    return { keyText, files };
  } finally {
    await rm(src, { recursive: true, force: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const dst = args[0] === "--dst" ? args[1] : undefined;
  if (!dst) {
    console.error("usage: demo-dashboard.ts --dst <dir>");
    process.exit(1);
  }
  try {
    const { keyText, files } = await demoDashboard(dst);
    console.error(`demo-dashboard: ${files} synthetic files -> ${dst}`);
    console.log(keyText);
  } catch (err) {
    console.error(`demo-dashboard: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
