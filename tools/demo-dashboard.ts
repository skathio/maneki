#!/usr/bin/env node
// =============================================================================
// Encrypt the synthetic demo payload (tests/fixtures/demo-dashboard.ts) with a
// fresh throwaway key, so the unlocked dashboard can be built, served and
// screenshotted without the real key or the licensed real data.
//
//   node tools/demo-dashboard.ts --dst <dir>    then: node tools/build.ts --data <dir>
//
// Prints the throwaway key on stdout; open the served site at `#k=<key>`.
// The destination must be absent or an empty directory, because encryption
// rewrites it from scratch: a mistyped path (".", "site") must never be wiped.
// site/data/, the real published ciphertext, is refused even when empty.
// =============================================================================
import { mkdtemp, mkdir, readdir, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateKeyText } from "../site/src/lib/crypto.ts";
import { days, index, ledger } from "../tests/fixtures/demo-dashboard.ts";
import { encryptDashboard } from "./encrypt-dashboard.ts";

const REAL_DATA = resolve(dirname(fileURLToPath(import.meta.url)), "..", "site", "data");

/** Real path of `path`, resolving symlinks through its deepest existing ancestor. */
async function realish(path: string): Promise<string> {
  try {
    return await realpath(path);
  } catch {
    const parent = dirname(path);
    return parent === path ? path : join(await realish(parent), basename(path));
  }
}

const within = (child: string, parent: string): boolean => {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
};

async function assertSafeTarget(target: string, protectedDir: string): Promise<void> {
  const real = await realish(target);
  const guarded = await realish(protectedDir);
  if (within(real, guarded) || within(guarded, real)) {
    throw new Error(`refusing ${target}: it is or contains the published payload in ${protectedDir}`);
  }
  let entries: string[];
  try {
    entries = await readdir(real);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
    throw new Error(`refusing ${target}: not a directory`);
  }
  if (entries.length) throw new Error(`refusing ${target}: it is not empty and would be wiped`);
}

export async function demoDashboard(dst: string, protectedDir: string = REAL_DATA): Promise<{ keyText: string; files: number }> {
  const target = resolve(dst);
  await assertSafeTarget(target, protectedDir);
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
