import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Trash2, Upload, Plus, X, ImagePlus, CheckCircle2, AlertCircle, Loader2, Images } from 'lucide-react';
import { galleryCategories } from '@/lib/galleryData';
import { toast } from 'sonner';

const MAX_FILES_PER_BATCH = 10;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

interface PreviewFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function AdminGallery() {
  const [, navigate] = useLocation();
  const [customImages, setCustomImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Multi-upload form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);
  const [formCategory, setFormCategory] = useState(galleryCategories[1] || 'Commercial Racks');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('vjrack-admin-token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [selectedFiles]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/gallery/custom');
      const data = await res.json();
      if (data.success) setCustomImages(data.customImages);
    } catch (e) {
      console.error(e);
    }
  };

  const getToken = () => sessionStorage.getItem('vjrack-admin-token');

  // ─── File Validation & Selection ─────────────────────────────
  const validateAndAddFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const errors: string[] = [];
    const validFiles: PreviewFile[] = [];

    // Check total count
    const totalCount = selectedFiles.length + fileArray.length;
    if (totalCount > MAX_FILES_PER_BATCH) {
      toast.error(`Maximum ${MAX_FILES_PER_BATCH} images per upload. You already have ${selectedFiles.length} selected.`);
      return;
    }

    for (const file of fileArray) {
      // Check type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" — Invalid file type. Only JPG, PNG, GIF, WebP allowed.`);
        continue;
      }
      // Check size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" — Too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      // Check duplicate
      if (selectedFiles.some(sf => sf.file.name === file.name && sf.file.size === file.size)) {
        errors.push(`"${file.name}" — Already selected.`);
        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending'
      });
    }

    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} image${validFiles.length > 1 ? 's' : ''} added`);
    }
  }, [selectedFiles]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
  };

  // ─── Drag & Drop ─────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  }, [validateAndAddFiles]);

  // ─── Batch Upload Handler ────────────────────────────────────
  const handleBatchUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Mark all as uploading
    setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));

    const formData = new FormData();
    selectedFiles.forEach(sf => {
      formData.append('images', sf.file);
    });
    formData.append('category', formCategory);

    try {
      const res = await fetch('/api/gallery/upload-batch', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setCustomImages(data.customImages);

        // Update individual file statuses
        setSelectedFiles(prev =>
          prev.map((f, i) => ({
            ...f,
            status: data.results[i]?.success ? 'success' as const : 'error' as const,
            error: data.results[i]?.error
          }))
        );

        toast.success(data.message);

        // Clear after a short delay to show success states
        setTimeout(() => {
          clearAllFiles();
          setShowAddForm(false);
        }, 1500);
      } else {
        toast.error(data.error || 'Upload failed');
        setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      setSelectedFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Delete Handler ──────────────────────────────────────────
  const deleteCustomImage = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this image?')) return;
    try {
      const res = await fetch(`/api/gallery/custom/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setCustomImages(data.customImages);
        toast.success('Image deleted');
      }
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">
            {customImages.length} image{customImages.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <Button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) clearAllFiles(); }}>
          {showAddForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Upload Images</>}
        </Button>
      </div>

      {/* ── Multi-Upload Form ──────────────────────────────────── */}
      {showAddForm && (
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Upload Images</h2>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                Max {MAX_FILES_PER_BATCH} images per batch · {MAX_FILE_SIZE_MB}MB each
              </span>
            </div>

            {/* Category selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category for all images</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full md:w-64 border p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                {galleryCategories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={(e) => {
                  if (e.target.files) validateAndAddFiles(e.target.files);
                  e.target.value = ''; // Reset so same file can be selected again
                }}
                className="hidden"
              />
              <ImagePlus className={`w-12 h-12 mx-auto mb-3 ${isDragOver ? 'text-primary' : 'text-gray-400'}`} />
              <p className="text-base font-medium text-gray-700">
                {isDragOver ? 'Drop images here!' : 'Drag & drop images here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse · JPG, PNG, GIF, WebP
              </p>
              {selectedFiles.length > 0 && (
                <p className="text-sm text-primary font-medium mt-2">
                  {selectedFiles.length} / {MAX_FILES_PER_BATCH} images selected
                </p>
              )}
            </div>

            {/* File Previews */}
            {selectedFiles.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    Selected Images ({selectedFiles.length})
                  </p>
                  <button
                    onClick={clearAllFiles}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                    disabled={isUploading}
                  >
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {selectedFiles.map((sf, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                      <img
                        src={sf.preview}
                        alt={sf.file.name}
                        className={`w-full h-full object-cover transition-opacity ${
                          sf.status === 'error' ? 'opacity-40' : ''
                        }`}
                      />

                      {/* Status Overlay */}
                      {sf.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      {sf.status === 'success' && (
                        <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      )}
                      {sf.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      )}

                      {/* Remove button */}
                      {sf.status === 'pending' && !isUploading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}

                      {/* File info */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                        <p className="text-[10px] text-white truncate">{sf.file.name}</p>
                        <p className="text-[9px] text-white/70">{(sf.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFiles.length > 0 && (
              <div className="mt-5 flex items-center gap-4">
                <Button
                  onClick={handleBatchUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="px-6"
                >
                  {isUploading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''}...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" /> Upload {selectedFiles.length} Image{selectedFiles.length > 1 ? 's' : ''}</>
                  )}
                </Button>
                <p className="text-xs text-gray-500">
                  Images are automatically optimized & converted to WebP
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Uploaded Images Grid ───────────────────────────────── */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Gallery Images</h2>
        {customImages.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No images uploaded yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "Upload Images" above to add your gallery photos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {customImages.map(img => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-[3/4] bg-gray-100">
                <img src={img.thumbnailSrc || img.src} alt={img.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteCustomImage(img.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">{img.category}</span>
                    {img.alt && <p className="text-xs text-white/80 mt-1 truncate">{img.alt}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
