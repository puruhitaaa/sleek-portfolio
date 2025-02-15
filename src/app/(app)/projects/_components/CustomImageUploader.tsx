import { useState, useRef, ChangeEvent, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { client } from "@/lib/client"
import { TrashIcon } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { fileToBase64 } from "@/components/minimal-tiptap/utils"
interface UploadedImage {
  url: string
  public_id: string
}

interface CustomImageUploadProps {
  image?: string
  onUpload: (url: string) => void
}

export default function CustomImageUpload({
  image,
  onUpload,
}: CustomImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    fileInputRef.current?.click()
  }

  const uploadImageMutation = useMutation({
    mutationFn: async (file: string) => {
      const result = await client.cloudinary.uploadImage.$post({
        image: file,
        folder: "projects",
      })
      return result.json()
    },
    onMutate: () => {
      const loadingToast = toast.loading("Uploading image...")

      return { loadingToast }
    },
    onError: (error, _, context) => {
      toast.dismiss(context?.loadingToast)
      toast.error(error.message || "Failed to upload image")
    },
    onSuccess: (data, _, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success("Image uploaded successfully")
      onUpload(data.secure_url)
      setUploadedImage({ ...data, url: data.secure_url })
    },
    onSettled: () => {
      setUploading(false)
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: async () => {
      const result = await client.cloudinary.deleteImage.$post({
        publicId: uploadedImage?.public_id!,
      })
      return result.json()
    },
    onMutate: () => {
      const loadingToast = toast.loading("Deleting image...")

      return { loadingToast }
    },
    onError: (error, _, context) => {
      toast.dismiss(context?.loadingToast)
      toast.error(error.message || "Failed to delete image")
    },
    onSuccess: (_, __, context) => {
      toast.dismiss(context?.loadingToast)
      toast.success("Image deleted successfully")
      setUploadedImage(null)
    },
  })

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const base64Image = await fileToBase64(file)
    await uploadImageMutation.mutateAsync(base64Image)
  }

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!uploadedImage) return

    await deleteImageMutation.mutateAsync()
  }

  useEffect(() => {
    if (image) {
      setUploadedImage({ public_id: "", url: image })
    }
  }, [image])

  return (
    <div className='flex flex-col items-center gap-2'>
      {uploadedImage ? (
        <div className='relative w-full aspect-video bg-muted rounded-md'>
          <img
            src={uploadedImage.url}
            alt='Uploaded image'
            className='absolute inset-0 rounded-md w-full h-full object-cover'
          />
          <Button
            variant='destructive'
            size='icon'
            className='absolute top-2 right-2'
            onClick={handleDelete}
            disabled={uploading}
          >
            <TrashIcon size={16} />
          </Button>
        </div>
      ) : (
        <>
          <Button
            className='text-zinc-100 dark:text-foreground'
            onClick={handleClick}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </Button>
          <Input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            className='hidden'
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  )
}
