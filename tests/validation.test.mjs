import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("report validation includes server-side asset checks", async () => {
  const source = await readFile(new URL("../lib/report.ts", import.meta.url), "utf8");
  assert.match(source, /cloudinaryPublicId/);
  assert.match(source, /startsWith\("https:\/\/"\)/);
});
