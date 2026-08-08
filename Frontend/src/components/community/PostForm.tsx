'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Tag, CommunityPost } from '@/types/community';
import { createPost, updatePost, getCategories, getTags } from '@/lib/community-api';
import { ImageUploader } from './ImageUploader';
import { RichTextEditor } from './RichTextEditor';
import { CategoryChip } from './CategoryChip';
import { TagChip } from './TagChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Hash,
  FileText,
  Eye,
  Trash2,
  Plus,
} from 'lucide-react';

interface PostFormProps {
  initialPost?: CommunityPost;
  isEdit?: boolean;
}

const LOCAL_STORAGE_DRAFT_KEY = 'presently_community_draft_v1';

export function PostForm({ initialPost, isEdit = false }: PostFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [customSlug, setCustomSlug] = useState(initialPost?.slug || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState(initialPost?.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl || '');
  const [status, setStatus] = useState<'Draft' | 'Published'>(
    (initialPost?.status as any) === 'Published' ? 'Published' : 'Draft'
  );
  const [visibility, setVisibility] = useState<'Public' | 'Private' | 'Unlisted'>(
    (initialPost?.visibility as any) || 'Public'
  );

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialPost?.categories?.map((c) => c.id) || []
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialPost?.tags?.map((t) => t.id) || []
  );

  const [galleryImages, setGalleryImages] = useState<
    Array<{ imageUrl: string; altText?: string; displayOrder: number }>
  >(
    initialPost?.images?.map((img, idx) => ({
      imageUrl: img.imageUrl,
      altText: img.altText || '',
      displayOrder: img.displayOrder ?? idx,
    })) || []
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  // Fetch Categories & Tags
  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [cats, tgs] = await Promise.all([getCategories(), getTags()]);
        setCategories(cats);
        setTags(tgs);
      } catch (e) {
        console.error('Failed to load taxonomy:', e);
      }
    }
    loadTaxonomy();
  }, []);

  // Restore Auto-saved Draft if creating new post
  useEffect(() => {
    if (!isEdit && !initialPost) {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved);
          if (draft.title) setTitle(draft.title);
          if (draft.content) setContent(draft.content);
          if (draft.excerpt) setExcerpt(draft.excerpt);
          if (draft.coverImageUrl) setCoverImageUrl(draft.coverImageUrl);
          if (draft.selectedCategoryIds) setSelectedCategoryIds(draft.selectedCategoryIds);
          if (draft.selectedTagIds) setSelectedTagIds(draft.selectedTagIds);
          if (draft.galleryImages) setGalleryImages(draft.galleryImages);
        }
      } catch (e) {
        // Ignore localStorage error
      }
    }
  }, [isEdit, initialPost]);

  // Mark form dirty when fields change
  useEffect(() => {
    if (title || content || excerpt || coverImageUrl) {
      setIsDirty(true);
    }
  }, [title, content, excerpt, coverImageUrl, selectedCategoryIds, selectedTagIds, galleryImages]);

  // Periodic Auto-save draft to localStorage (Every 15s if dirty)
  const saveLocalDraft = useCallback(() => {
    if (!isEdit && isDirty && (title || content)) {
      try {
        const draftPayload = {
          title,
          content,
          excerpt,
          coverImageUrl,
          selectedCategoryIds,
          selectedTagIds,
          galleryImages,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(draftPayload));
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAutoSavedTime(now);
      } catch (e) {
        // Ignore
      }
    }
  }, [isEdit, isDirty, title, content, excerpt, coverImageUrl, selectedCategoryIds, selectedTagIds, galleryImages]);

  useEffect(() => {
    const timer = setInterval(() => {
      saveLocalDraft();
    }, 15000);
    return () => clearInterval(timer);
  }, [saveLocalDraft]);

  // Unsaved changes warning before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !submitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, submitting]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddGalleryImage = (url: string) => {
    if (!url) return;
    setGalleryImages((prev) => [
      ...prev,
      { imageUrl: url, altText: '', displayOrder: prev.length },
    ]);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (targetStatus: 'Draft' | 'Published') => {
    setError(null);

    // Validation
    if (!title.trim() || title.length < 3) {
      setError('Post title must be at least 3 characters long.');
      return;
    }

    if (!content.trim() || content.length < 10) {
      setError('Post content story must be at least 10 characters long.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title.trim(),
        slug: customSlug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content: content.trim(),
        cover_image_url: coverImageUrl || undefined,
        status: targetStatus,
        visibility: visibility,
        category_ids: selectedCategoryIds,
        tag_ids: selectedTagIds,
        images: galleryImages.map((img, idx) => ({
          image_url: img.imageUrl,
          alt_text: img.altText || undefined,
          display_order: idx,
        })),
      };

      let resultPost: CommunityPost;

      if (isEdit && initialPost) {
        resultPost = await updatePost(initialPost.id, payload);
      } else {
        resultPost = await createPost(payload);
        // Clear local draft storage on successful post creation
        localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);
      }

      setIsDirty(false);
      router.push(`/community/posts/${resultPost.slug || resultPost.id}`);
    } catch (err: any) {
      console.error('Post submit error:', err);
      const detail = err.response?.data?.detail || err.message || 'Failed to save post.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(status);
      }}
      className="space-y-8 bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg shadow-zinc-200/30 dark:shadow-none"
    >
      {/* Header Bar & Auto-save Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {isEdit ? 'Edit Unboxing Story' : 'Share Unboxing Experience'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Inspire the Presently community with real recipient reactions and gifting wisdom.
          </p>
        </div>

        {autoSavedTime && !isEdit && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/60 self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Draft auto-saved at {autoSavedTime}</span>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Form Section 1: Core Details */}
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Story Title <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g. Unboxing the Keychron Q1 Keyboard for my Husband's Workstation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-base rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 font-semibold"
            required
          />
        </div>

        {/* Custom Slug & Excerpt Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Custom Slug */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              URL Slug (Optional)
            </label>
            <Input
              type="text"
              placeholder="auto-generated-from-title"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              className="h-10 text-xs rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 font-mono"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Post Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="Public">Public (Visible to everyone)</option>
              <option value="Unlisted">Unlisted (Accessible via direct link)</option>
              <option value="Private">Private (Only visible to you)</option>
            </select>
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Short Summary / Excerpt (Optional)
          </label>
          <Input
            type="text"
            placeholder="A brief teaser summarizing the gift occasion, recipient reaction, or outcome..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="h-11 text-sm rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60"
          />
        </div>
      </div>

      {/* Form Section 2: Cover Image Upload */}
      <ImageUploader
        value={coverImageUrl}
        onChange={setCoverImageUrl}
        onRemove={() => setCoverImageUrl('')}
        label="Main Cover Image (Cloudinary Upload)"
        aspectRatio="banner"
      />

      {/* Form Section 3: Rich Text Content */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Story Narrative & Experience <span className="text-rose-500">*</span>
        </label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>

      {/* Form Section 4: Taxonomy Selection (Categories & Tags) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {/* Categories Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
            <FolderOpen className="w-4 h-4 text-indigo-500" />
            <h3>Select Categories</h3>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40">
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                name={cat.name}
                slug={cat.slug}
                isActive={selectedCategoryIds.includes(cat.id)}
                onClick={() => toggleCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        {/* Tags Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
            <Hash className="w-4 h-4 text-rose-500" />
            <h3>Select Tags</h3>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40">
            {tags.map((tag) => (
              <TagChip
                key={tag.id}
                name={tag.name}
                slug={tag.slug}
                isActive={selectedTagIds.includes(tag.id)}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Form Section 5: Gallery Images Upload */}
      <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-sm">
            <FileText className="w-4 h-4 text-indigo-500" />
            <h3>Unboxing Photo Gallery</h3>
          </div>
          <span className="text-xs text-zinc-500">Upload multiple photos</span>
        </div>

        {/* Gallery Upload Input */}
        <ImageUploader
          onChange={handleAddGalleryImage}
          label=""
          aspectRatio="square"
        />

        {/* Uploaded Gallery Thumbnails */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-28 group bg-zinc-100 dark:bg-zinc-800"
              >
                <img src={img.imageUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Footer Actions */}
      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Save Draft Button */}
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => handleSubmit('Draft')}
            className="w-full sm:w-auto border-zinc-300 dark:border-zinc-700"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>Save as Draft</span>
          </Button>

          {/* Publish Button */}
          <Button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit('Published')}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-md shadow-indigo-500/20"
          >
            <Send className="w-4 h-4 mr-2" />
            <span>{isEdit ? 'Save Changes' : 'Publish Story'}</span>
          </Button>
        </div>
      </div>
    </form>
  );
}
