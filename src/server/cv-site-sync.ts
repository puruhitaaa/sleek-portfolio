import { createId } from "@paralleldrive/cuid2";
import { asc, eq } from "drizzle-orm";

import { env } from "@/env";
import { db } from "@/server/db";
import { cvSiteSyncOutbox } from "@/server/db/schema";

export interface CvSiteSyncProject {
  id: string;
  name: string;
  description: string;
  image: string;
  websiteLink: string | null;
  githubLink: string | null;
  youtubeLink: string | null;
  isPinned: boolean;
  isPublished: boolean;
}

type SyncAction = "upsert" | "delete";

type SyncResult =
  | { skipped: true }
  | { skipped: false; ok: true }
  | { skipped: false; ok: false; error: string };

type SyncPayload = ProjectRow | string;

type ProjectRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  websiteLink: string | null;
  githubLink: string | null;
  youtubeLink: string | null;
  isPinned: boolean | null;
  isPublished: boolean | null;
};

const SYNC_TIMEOUT_MS = 5_000;
const OUTBOX_RETRY_LIMIT = 25;

function toCvSiteProject(project: ProjectRow): CvSiteSyncProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    image: project.image,
    websiteLink: project.websiteLink,
    githubLink: project.githubLink,
    youtubeLink: project.youtubeLink,
    isPinned: project.isPinned ?? false,
    isPublished: project.isPublished ?? false,
  };
}

function isCvSiteSyncProject(value: unknown): value is CvSiteSyncProject {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { id?: unknown }).id === "string" &&
    typeof (value as { name?: unknown }).name === "string" &&
    typeof (value as { description?: unknown }).description === "string" &&
    typeof (value as { image?: unknown }).image === "string" &&
    typeof (value as { isPinned?: unknown }).isPinned === "boolean" &&
    typeof (value as { isPublished?: unknown }).isPublished === "boolean"
  );
}

function getProjectId(payload: SyncPayload): string {
  return typeof payload === "string" ? payload : payload.id;
}

function toPayload(action: SyncAction, payload: SyncPayload) {
  if (action === "delete") {
    return { action, id: getProjectId(payload) };
  }

  if (typeof payload === "string") {
    throw new Error("cv-site upsert requires a project payload");
  }

  return { action, project: toCvSiteProject(payload) };
}

export async function syncProjectToCvSite(
  action: SyncAction,
  payload: SyncPayload,
): Promise<SyncResult> {
  const url = env.CV_SITE_SYNC_URL;
  const secret = env.CV_SITE_SYNC_SECRET;

  if (!url && !secret) {
    return { skipped: true };
  }

  if (!url || !secret) {
    console.warn(
      "cv-site sync partially configured; set both CV_SITE_SYNC_URL and CV_SITE_SYNC_SECRET",
    );
    return { skipped: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-secret": secret,
      },
      body: JSON.stringify(toPayload(action, payload)),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = `cv-site sync failed: ${response.status} ${response.statusText}`;
      console.error(error);
      return { skipped: false, ok: false, error };
    }

    return { skipped: false, ok: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown cv-site sync error";
    console.error("cv-site sync error:", message);
    return { skipped: false, ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

async function queueFailedSync(
  action: SyncAction,
  payload: SyncPayload,
  error: string,
): Promise<void> {
  const projectId = getProjectId(payload);
  const project =
    action === "upsert" ? toCvSiteProject(payload as ProjectRow) : null;

  await db.transaction(async (tx) => {
    await tx
      .delete(cvSiteSyncOutbox)
      .where(eq(cvSiteSyncOutbox.projectId, projectId));
    await tx.insert(cvSiteSyncOutbox).values({
      id: createId(),
      action,
      projectId,
      project,
      attempts: 1,
      lastError: error,
      updatedAt: new Date(),
    });
  });
}

export async function retryPendingCvSiteSyncs(): Promise<void> {
  if (!env.CV_SITE_SYNC_URL || !env.CV_SITE_SYNC_SECRET) {
    return;
  }

  const pending = await db
    .select()
    .from(cvSiteSyncOutbox)
    .orderBy(asc(cvSiteSyncOutbox.createdAt))
    .limit(OUTBOX_RETRY_LIMIT);

  for (const entry of pending) {
    if (entry.action !== "upsert" && entry.action !== "delete") {
      await db
        .delete(cvSiteSyncOutbox)
        .where(eq(cvSiteSyncOutbox.id, entry.id));
      continue;
    }

    const action: SyncAction = entry.action;
    let payload: SyncPayload | null = null;

    if (action === "delete") {
      payload = entry.projectId;
    } else if (isCvSiteSyncProject(entry.project)) {
      payload = entry.project;
    }

    if (payload === null) {
      await db
        .delete(cvSiteSyncOutbox)
        .where(eq(cvSiteSyncOutbox.id, entry.id));
      continue;
    }

    const result = await syncProjectToCvSite(action, payload);
    if (result.skipped) {
      return;
    }

    if (result.ok) {
      await db
        .delete(cvSiteSyncOutbox)
        .where(eq(cvSiteSyncOutbox.id, entry.id));
      continue;
    }

    await db
      .update(cvSiteSyncOutbox)
      .set({
        attempts: entry.attempts + 1,
        lastError: result.error,
        updatedAt: new Date(),
      })
      .where(eq(cvSiteSyncOutbox.id, entry.id));
  }
}

export async function syncProjectWithOutbox(
  action: SyncAction,
  payload: SyncPayload,
): Promise<void> {
  await retryPendingCvSiteSyncs();

  const result = await syncProjectToCvSite(action, payload);
  if (!result.skipped && !result.ok) {
    await queueFailedSync(action, payload, result.error);
  }
}
