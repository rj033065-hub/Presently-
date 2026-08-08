'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { uploadImage } from '@/lib/community-api';
import { Button } from '@/components/ui/button';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: 'landscape' | 'square' | 'banner';
  folder?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function ImageUploader({
  value,
  onChange,
  onRemove,
  label = 'Upload Cover Image',
  aspectRatio = 'banner',
  folder = 'community',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid image file type. Please upload JPEG, PNG, WEBP, or GIF.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setError(`Image size exceeds 5MB limit (${sizeMb}MB provided). Please select a smaller file.`);
      return;
    }

    try {
      setUploading(true);
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setError(null);
    onChange('');
    if (onRemove) onRemove();
  };

  const heightClass =
    aspectRatio === 'banner' ? 'h-48 sm:h-60' : aspectRatio === 'landscape' ? 'h-40' : 'h-32';

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">{label}</label>}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 group shadow-sm`}>
          <img src={value} alt="Uploaded asset preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="rounded-full shadow-md"
            >
              <X className="w-4 h-4 mr-1.5" />
              Remove Image
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full ${heightClass} rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-indigo-500 dark:hover:border-indigo-400 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center group`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Uploading Image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Click or drag image to upload
              </span>
              <span className="text-[11px] text-zinc-400">
                PNG, JPG, WEBP, GIF up to 5MB
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
