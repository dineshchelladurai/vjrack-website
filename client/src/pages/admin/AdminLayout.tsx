import { Link, useLocation } from "wouter";
import { LayoutDashboard, Image as ImageIcon, FileText, MessageSquare, Settings, LogOut, ChevronLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  const handleLogout = async () => {
    const token = sessionStorage.getItem('vjrack-admin-token');
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch (e) {}
      sessionStorage.removeItem('vjrack-admin-token');
    }
    navigate('/admin/login');
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Gallery", path: "/admin/gallery", icon: ImageIcon },
    { name: "Storefront Images", path: "/admin/assets", icon: ImageIcon },
    { name: "Blog Posts", path: "/admin/blog", icon: FileText },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <img src="/vjrack-logo.png" alt="VJ Rack" className="h-10 w-auto object-contain" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</span>
        </div>
        
        <div className="p-4 flex-grow space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <button 
            onClick={() => {
              const token = sessionStorage.getItem('vjrack-admin-token');
              if (token) {
                fetch('/api/admin/logout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token }),
                }).catch(() => {});
                sessionStorage.removeItem('vjrack-admin-token');
              }
              navigate('/');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Website</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
