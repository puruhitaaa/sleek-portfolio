"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/eden";
import { siteConfig } from "@/site";
import { toast } from "sonner";
import { Eye, Edit3, Save, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type BioData = {
  id?: string;
  greeting: string;
  content: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

interface BioSectionProps {
  initialData?: BioData;
}

const DEFAULT_BIO_CONTENT = siteConfig.bio.paragraphs
  .map((p) => `<p>${p}</p>`)
  .join("");

const ADMIN_EMAIL = "hughdev101@gmail.com";

export default function BioSection({ initialData }: BioSectionProps) {
  const { data: authData } = useSession();
  const queryClient = useQueryClient();

  const isAdmin =
    authData?.session &&
    authData?.user?.email === ADMIN_EMAIL &&
    authData?.user?.role === "admin";

  const { data: bioData, isLoading } = useQuery({
    queryKey: ["bio"],
    queryFn: async () => {
      const { data, error } = await api.bio.get();
      if (error) {
        throw new Error("Failed to fetch bio");
      }
      return data;
    },
    initialData: initialData ?? {
      id: "default",
      greeting: siteConfig.bio.greeting,
      content: DEFAULT_BIO_CONTENT,
    },
  });

  const [mode, setMode] = useState<"render" | "wysiwyg">("render");
  const [greetingDraft, setGreetingDraft] = useState(
    bioData?.greeting ?? siteConfig.bio.greeting,
  );
  const [contentDraft, setContentDraft] = useState(
    bioData?.content ?? DEFAULT_BIO_CONTENT,
  );

  // Sync draft state whenever remote bioData updates
  useEffect(() => {
    if (bioData) {
      setGreetingDraft(bioData.greeting);
      setContentDraft(bioData.content);
    }
  }, [bioData]);

  const updateMutation = useMutation({
    mutationFn: async (values: { greeting: string; content: string }) => {
      const { data, error } = await api.bio.put(values);
      if (error) {
        throw new Error(
          typeof error.value === "object" && error.value && "message" in error.value
            ? String(error.value.message)
            : "Failed to update bio",
        );
      }
      return data;
    },
    onMutate: () => {
      const toastLoading = toast.loading("Saving bio changes...");
      return { toastLoading };
    },
    onSuccess: (data, _, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Bio updated successfully");
      queryClient.setQueryData(["bio"], data);
      queryClient.invalidateQueries({ queryKey: ["bio"] });
      setMode("render");
    },
    onError: (error: Error, _, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error(error.message || "Failed to update bio");
    },
  });

  const handleSave = async () => {
    if (!greetingDraft.trim()) {
      toast.error("Greeting cannot be empty");
      return;
    }
    if (!contentDraft.trim()) {
      toast.error("Bio content cannot be empty");
      return;
    }

    await updateMutation.mutateAsync({
      greeting: greetingDraft,
      content: contentDraft,
    });
  };

  const handleCancel = () => {
    if (bioData) {
      setGreetingDraft(bioData.greeting);
      setContentDraft(bioData.content);
    }
    setMode("render");
  };

  return (
    <section className="space-y-4">
      {/* Header with Admin Toggle */}
      <div className="flex items-center justify-between gap-4">
        {mode === "render" ? (
          <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
            {bioData?.greeting ?? siteConfig.bio.greeting}
          </h2>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Editing Bio
          </span>
        )}

        {/* Toggle between Render and WYSIWYG Editor (Visible exclusively for hughdev101@gmail.com) */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => {
                if (value === "render" || value === "wysiwyg") {
                  setMode(value);
                }
              }}
              className="rounded-lg border border-stone-800/80 bg-stone-900/60 p-0.5 text-xs"
            >
              <ToggleGroupItem
                value="render"
                aria-label="Render view"
                size="sm"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 data-[state=on]:bg-stone-800 data-[state=on]:text-zinc-100",
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Render</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="wysiwyg"
                aria-label="WYSIWYG editor"
                size="sm"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 data-[state=on]:bg-stone-800 data-[state=on]:text-zinc-100",
                )}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>WYSIWYG Editor</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>

      {/* Content Rendering based on Mode */}
      {mode === "render" ? (
        <div className="space-y-4">
          {isLoading && !bioData ? (
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ) : (
            <div
              className="space-y-4 text-justify text-zinc-600 dark:text-zinc-400 [&_p]:leading-relaxed [&_p]:text-zinc-600 dark:[&_p]:text-zinc-400 [&_a]:text-zinc-900 dark:[&_a]:text-zinc-100 [&_a]:underline"
              dangerouslySetInnerHTML={{
                __html: bioData?.content || DEFAULT_BIO_CONTENT,
              }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-stone-800/90 bg-stone-900/40 p-4 backdrop-blur-sm">
          {/* Greeting Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Greeting Title
            </label>
            <Input
              value={greetingDraft}
              onChange={(e) => setGreetingDraft(e.target.value)}
              className="border-stone-800 bg-stone-900/90 text-zinc-100 focus-visible:ring-stone-700"
            />
          </div>

          {/* MinimalTiptapEditor */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Bio Text (WYSIWYG)
            </label>
            <MinimalTiptapEditor
              value={contentDraft}
              onChange={(value) =>
                setContentDraft(typeof value === "string" ? value : String(value))
              }
              editable={true}
              className="min-h-[260px] rounded-lg border-stone-800 bg-stone-900/90 dark:border-stone-800 dark:bg-stone-900"
              editorContentClassName="p-3 text-justify text-zinc-200"
              immediatelyRender={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
              className="text-zinc-400 hover:text-zinc-100"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
