"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/eden";
import { siteConfig } from "@/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileToBase64 } from "@/components/minimal-tiptap/utils";
import { toast } from "sonner";
import { Edit3, Camera, Save, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "hughdev101@gmail.com";
const DEFAULT_AVATAR = "/assets/images/home-pic.webp";

export default function HeaderProfile() {
  const { data: authData } = useSession();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin =
    authData?.session &&
    authData?.user?.email === ADMIN_EMAIL &&
    authData?.user?.role === "admin";

  const { data: bioData } = useQuery({
    queryKey: ["bio"],
    queryFn: async () => {
      const { data, error } = await api.bio.get();
      if (error) throw new Error("Failed to fetch profile");
      return data;
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(bioData?.name ?? siteConfig.name);
  const [roleDraft, setRoleDraft] = useState(bioData?.role ?? siteConfig.role);
  const [avatarDraft, setAvatarDraft] = useState(bioData?.avatar ?? DEFAULT_AVATAR);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (bioData) {
      setNameDraft(bioData.name ?? siteConfig.name);
      setRoleDraft(bioData.role ?? siteConfig.role);
      setAvatarDraft(bioData.avatar ?? DEFAULT_AVATAR);
    }
  }, [bioData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (values: { name: string; role: string; avatar: string }) => {
      const { data, error } = await api.bio.put(values);
      if (error) {
        throw new Error(
          typeof error.value === "object" && error.value && "message" in error.value
            ? String(error.value.message)
            : "Failed to update profile",
        );
      }
      return data;
    },
    onMutate: () => {
      const toastLoading = toast.loading("Saving profile changes...");
      return { toastLoading };
    },
    onSuccess: (data, _, context) => {
      toast.dismiss(context?.toastLoading);
      toast.success("Profile updated successfully");
      queryClient.setQueryData(["bio"], data);
      queryClient.invalidateQueries({ queryKey: ["bio"] });
      setIsEditing(false);
    },
    onError: (error: Error, _, context) => {
      toast.dismiss(context?.toastLoading);
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const loadingToast = toast.loading("Uploading avatar image...");

      const base64Image = await fileToBase64(file);
      const { data, error } = await api.cloudinary.upload.post({
        image: base64Image,
        folder: "profile",
      });

      toast.dismiss(loadingToast);

      if (error || !data) {
        throw new Error("Failed to upload avatar image");
      }

      setAvatarDraft(data.secure_url);
      toast.success("Avatar image uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!nameDraft.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!roleDraft.trim()) {
      toast.error("Role cannot be empty");
      return;
    }

    await updateProfileMutation.mutateAsync({
      name: nameDraft,
      role: roleDraft,
      avatar: avatarDraft,
    });
  };

  const handleCancel = () => {
    if (bioData) {
      setNameDraft(bioData.name ?? siteConfig.name);
      setRoleDraft(bioData.role ?? siteConfig.role);
      setAvatarDraft(bioData.avatar ?? DEFAULT_AVATAR);
    }
    setIsEditing(false);
  };

  const displayName = bioData?.name ?? siteConfig.name;
  const displayRole = bioData?.role ?? siteConfig.role;
  const displayAvatar = bioData?.avatar ?? DEFAULT_AVATAR;

  if (isEditing) {
    return (
      <div className="space-y-3 rounded-xl border border-stone-800/90 bg-stone-900/60 p-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Edit Profile Info
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending || isUploadingImage}
              className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100"
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={updateProfileMutation.isPending || isUploadingImage}
              className="h-7 bg-zinc-100 px-2.5 text-xs text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {updateProfileMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Save className="mr-1 h-3 w-3" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Avatar selector */}
          <div className="relative shrink-0">
            <div
              onClick={() => !isUploadingImage && fileInputRef.current?.click()}
              className="group relative h-14 w-14 cursor-pointer overflow-hidden rounded-full border border-stone-700 bg-stone-800"
            >
              <Image
                src={avatarDraft || DEFAULT_AVATAR}
                alt={nameDraft || "Avatar"}
                fill
                className="object-cover"
                unoptimized={avatarDraft.startsWith("http")}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {isUploadingImage ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageFileChange}
              disabled={isUploadingImage}
            />
          </div>

          {/* Name & Role inputs */}
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Name</label>
              <Input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="h-8 border-stone-800 bg-stone-900/90 text-sm text-zinc-100 focus-visible:ring-stone-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Role / Title</label>
              <Input
                value={roleDraft}
                onChange={(e) => setRoleDraft(e.target.value)}
                className="h-8 border-stone-800 bg-stone-900/90 text-sm text-zinc-100 focus-visible:ring-stone-700"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image
            src={displayAvatar}
            alt={displayName}
            fill
            className="rounded-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
            unoptimized={displayAvatar.startsWith("http")}
          />
        </div>
        <div>
          <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
            {displayName}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {displayRole}
          </p>
        </div>
      </div>

      {isAdmin && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-7 gap-1 border-stone-800/90 bg-stone-900/70 px-2.5 text-xs text-zinc-400 hover:bg-stone-800 hover:text-zinc-100"
        >
          <Edit3 className="h-3 w-3" />
          <span>Edit Profile</span>
        </Button>
      )}
    </div>
  );
}
