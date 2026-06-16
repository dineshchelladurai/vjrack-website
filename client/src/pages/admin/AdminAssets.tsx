import { useState } from "react";
import { useLocation } from "wouter";
import { ImagePlus, Loader2, Upload, Trash2, Package, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { categories, featuredProducts } from "@/lib/data";
import { useCustomAssets } from "@/hooks/useCustomAssets";

export default function AdminAssets() {
  const [, setLocation] = useLocation();
  const { customAssets, loading, refetchAssets } = useCustomAssets();
  const [uploading, setUploading] = useState<string | null>(null);

  // Top 6 categories only, as displayed on Home page
  const topCategories = categories.slice(0, 6);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5MB');
      return;
    }

    setUploading(id);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('id', id);

    try {
      const res = await fetch('/api/admin/custom-assets/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('vjrack-admin-token')}`
        },
        body: formData
      });

      if (!res.ok) {
        if (res.status === 401) {
          setLocation('/admin/login');
          return;
        }
        throw new Error('Upload failed');
      }

      await refetchAssets();
      toast.success('Image updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(null);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleReset = async (id: string) => {
    if (!confirm('Reset to default image?')) return;
    
    setUploading(id);
    try {
      const res = await fetch('/api/admin/custom-assets/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('vjrack-admin-token')}`
        },
        body: JSON.stringify({ id })
      });

      if (!res.ok) throw new Error('Reset failed');
      
      await refetchAssets();
      toast.success('Image reset to default');
    } catch (error) {
      console.error(error);
      toast.error('Failed to reset image');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Storefront Images</h1>
        <p className="text-gray-500 mt-2">Manage custom pictures for Top Categories and Featured Products on the home page.</p>
      </div>

      <div className="space-y-10">
        {/* Top Categories */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Grid className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Top Categories</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCategories.map(category => (
              <AssetCard 
                key={category.id}
                id={category.id}
                title={category.name}
                defaultImage={category.image}
                customImage={customAssets[category.id]}
                isUploading={uploading === category.id}
                onUpload={handleFileUpload}
                onReset={handleReset}
              />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b pb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map(product => (
              <AssetCard 
                key={product.id}
                id={product.id}
                title={product.name}
                defaultImage={product.image}
                customImage={customAssets[product.id]}
                isUploading={uploading === product.id}
                onUpload={handleFileUpload}
                onReset={handleReset}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function AssetCard({ 
  id, title, defaultImage, customImage, isUploading, onUpload, onReset 
}: { 
  id: string; title: string; defaultImage: string; customImage?: string; 
  isUploading: boolean; 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onReset: (id: string) => void;
}) {
  const currentImage = customImage || defaultImage;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-900 truncate" title={title}>{title}</h3>
      </div>
      
      <div className="relative aspect-[4/3] bg-gray-100 p-4 flex items-center justify-center overflow-hidden">
        <img 
          src={currentImage} 
          alt={title} 
          className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
          style={{ opacity: isUploading ? 0.3 : 1 }}
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="p-4 mt-auto border-t bg-white flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
            {customImage ? 'Customized' : 'Default'}
          </span>
          {customImage && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onReset(id)}
              disabled={isUploading}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Reset
            </Button>
          )}
        </div>

        <div className="relative">
          <Input 
            type="file" 
            accept="image/*" 
            onChange={(e) => onUpload(e, id)}
            className="hidden"
            id={`upload-${id}`}
            disabled={isUploading}
          />
          <label 
            htmlFor={`upload-${id}`}
            className={`flex items-center justify-center w-full py-2 px-4 rounded-lg border-2 border-dashed transition-colors cursor-pointer text-sm font-medium
              ${isUploading 
                ? 'border-gray-200 text-gray-400 bg-gray-50' 
                : 'border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40'
              }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            {customImage ? 'Change Image' : 'Upload Image'}
          </label>
        </div>
      </div>
    </div>
  );
}
