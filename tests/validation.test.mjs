import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("report validation includes server-side asset checks", async () => {
  const source = await readFile(new URL("../lib/report.ts", import.meta.url), "utf8");
  assert.match(source, /cloudinaryPublicId/);
  assert.match(source, /startsWith\("https:\/\/"\)/);
});

test("RBAC migration defines trusted roles and protected workflow records", async () => {
  const source = await readFile(new URL("../supabase/migrations/002_rbac_workflow.sql", import.meta.url), "utf8");
  assert.match(source, /create type public\.app_role/);
  assert.match(source, /create table public\.profiles/);
  assert.match(source, /create table public\.team_member_applications/);
  assert.match(source, /create table public\.report_status_history/);
  assert.match(source, /enable row level security/);
  assert.match(source, /current_app_role/);
});
