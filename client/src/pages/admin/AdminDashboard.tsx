import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon, FileText, MessageSquare } from 'lucide-react';
import { useLocation } from 'wouter';

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState({
    enquiries: 0,
    blogs: 0,
    hiddenImages: 0,
    customImages: 0
  });

  useEffect(() => {
    // Verify token
    const token = sessionStorage.getItem('vjrack-admin-token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Fetch stats (we can aggregate from existing endpoints or just make a new one)
    Promise.all([
      fetch('/api/enquiries', { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()),
      fetch('/api/blog').then(res => res.json()),
      fetch('/api/gallery/custom').then(res => res.json()),
      fetch('/api/gallery/hidden').then(res => res.json())
    ]).then(([enqData, blogData, customData, hiddenData]) => {
      setStats({
        enquiries: enqData.enquiries?.length || 0,
        blogs: blogData.posts?.length || 0,
        customImages: customData.customImages?.length || 0,
        hiddenImages: hiddenData.hiddenImages?.length || 0
      });
    }).catch(console.error);

  }, [navigate]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Enquiries</CardTitle>
            <MessageSquare className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.enquiries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Published Blogs</CardTitle>
            <FileText className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.blogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Custom Gallery Images</CardTitle>
            <ImageIcon className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.customImages}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.hiddenImages} default images hidden</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Enquiries</h3>
            <p className="text-sm text-gray-500">Download customer enquiries as an Excel-compatible CSV file.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => window.open(`/api/admin/enquiries/download?range=last_month&token=${sessionStorage.getItem('vjrack-admin-token')}`)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition-colors flex-1 md:flex-none text-center"
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => window.open(`/api/admin/enquiries/download?range=all&token=${sessionStorage.getItem('vjrack-admin-token')}`)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors flex-1 md:flex-none text-center"
            >
              Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
