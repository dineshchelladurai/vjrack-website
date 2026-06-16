import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import { Trash2, Edit, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBlog() {
  const [, navigate] = useLocation();
  const [blogs, setBlogs] = useState<any[]>([]);
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [author, setAuthor] = useState('');
  const [image, setImage] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('vjrack-admin-token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchBlogs();
  }, [navigate]);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getToken = () => sessionStorage.getItem('vjrack-admin-token');

  // Generate slug from title automatically
  useEffect(() => {
    if (!formId && title) { // only auto-slug if creating new
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  }, [title, formId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      id: formId || undefined,
      title,
      slug,
      author: author || 'Admin',
      image,
      content,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(formId ? "Blog updated" : "Blog published");
        fetchBlogs();
        resetForm();
      } else {
        toast.error(data.error || "Failed to save blog");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this blog post?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Blog deleted");
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const openEditor = (blog: any = null) => {
    if (blog) {
      setFormId(blog.id);
      setTitle(blog.title);
      setSlug(blog.slug);
      setAuthor(blog.author);
      setImage(blog.image);
      setContent(blog.content);
    } else {
      resetForm();
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormId('');
    setTitle('');
    setSlug('');
    setAuthor('Admin');
    setImage('');
    setContent('');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">{formId ? 'Edit Blog Post' : 'New Blog Post'}</h1>
          <Button variant="outline" onClick={resetForm}>Cancel</Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g., Guide to Supermarket Racks"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL Slug</label>
                  <Input 
                    value={slug} 
                    onChange={(e) => setSlug(e.target.value)} 
                    placeholder="guide-to-supermarket-racks"
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <Input 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)} 
                    placeholder="Admin"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Feature Image URL</label>
                  <Input 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    placeholder="https://example.com/image.jpg"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content (Markdown supported)</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post here... You can use **bold** or *italic*."
                  className="w-full h-96 border rounded-md p-4 font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Blog Posts</h1>
        <Button onClick={() => openEditor()}>
          <Plus className="w-4 h-4 mr-2" /> Write New Post
        </Button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No blog posts yet</h3>
          <p className="text-gray-500 mt-1">Create your first blog post to engage your visitors.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-medium text-gray-600">Post Title</th>
                <th className="p-4 font-medium text-gray-600">Date</th>
                <th className="p-4 font-medium text-gray-600">Author</th>
                <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(blog => (
                <tr key={blog.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{blog.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{blog.slug}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(blog.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{blog.author}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openEditor(blog)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-2"
                      title="Edit Post"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(blog.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
