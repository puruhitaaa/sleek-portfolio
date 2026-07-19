import { apiEnv } from "@baiqueee/env/api";

export type CvSiteSyncProject = {
  id: string;
  name: string;
  description: string;
  image: string;
  websiteLink: string | null;
  githubLink: string | null;
  youtubeLink: string | null;
  isPinned: boolean;
  isPublished: boolean;
};

type SyncResult =
  | { skipped: true }
  | { skipped: false; ok: true }
  | { skipped: false; ok: false; error: string };

type UpsertPayload = {
  action: "upsert";
  project: CvSiteSyncProject;
};

type DeletePayload = {
  action: "delete";
  id: string;
};

const SYNC_TIMEOUT_MS = 5_000;

export async function syncProjectToCvSite(
  action: "upsert" | "delete",
  payload: CvSiteSyncProject | string,
): Promise<SyncResult> {
  const url = apiEnv.CV_SITE_SYNC_URL;
  const secret = apiEnv.CV_SITE_SYNC_SECRET;

  if (!url || !secret) {
    return { skipped: true };
  }

  const body: UpsertPayload | DeletePayload =
    action === "delete"
      ? {
          action: "delete",
          id: typeof payload === "string" ? payload : payload.id,
        }
      : {
          action: "upsert",
          project: payload as CvSiteSyncProject,
        };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-secret": secret,
      },
      body: JSON.stringify(body),
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
