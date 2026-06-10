"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Upload Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }
      const { url } = await res.json();
      onChange(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="space-y-2">
      {label && <label className="block text-white/50 text-xs uppercase tracking-wider">{label}</label>}

      {value ? (
        <div className="relative group h-48 rounded-sm overflow-hidden border border-white/10">
          <Image src={value} alt="Uploaded" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-500 text-white p-2 rounded-sm hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 right-2 text-white/70 text-xs truncate bg-black/50 px-2 py-1 rounded">
            {value}
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-all",
            isDragActive ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <Loader2 size={32} className="text-gold animate-spin" />
            ) : isDragActive ? (
              <Upload size={32} className="text-gold" />
            ) : (
              <ImageIcon size={32} className="text-white/20" />
            )}
            <div>
              <p className="text-white/50 text-sm">
                {uploading ? "Uploading..." : isDragActive ? "Drop it here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-white/30 text-xs mt-1">JPG, PNG, WebP up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Or paste URL */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL..."
          className="flex-1 bg-dark border border-white/10 focus:border-gold text-white placeholder-white/20 rounded-sm px-3 py-2 text-xs outline-none transition-colors"
        />
      </div>
    </div>
  );
}
