import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import React, { Suspense } from 'react';
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = React.lazy(() => import('@/pages/Home'));
const About = React.lazy(() => import('@/pages/About'));
const Shop = React.lazy(() => import('@/pages/Shop'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Blog = React.lazy(() => import('@/pages/Blog'));
const BlogPostPage = React.lazy(() => import('@/pages/BlogPost'));
const Gallery = React.lazy(() => import('@/pages/Gallery'));
const EnquiryPopup = React.lazy(() => import('./components/EnquiryPopup'));

// Admin Pages
const AdminLogin = React.lazy(() => import('@/pages/admin/AdminLogin'));
const AdminResetPassword = React.lazy(() => import('@/pages/admin/AdminResetPassword'));
const AdminLayout = React.lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminGallery = React.lazy(() => import('@/pages/admin/AdminGallery'));
const AdminBlog = React.lazy(() => import('@/pages/admin/AdminBlog'));
const AdminAssets = React.lazy(() => import('@/pages/admin/AdminAssets'));
const AdminSettings = React.lazy(() => import('@/pages/admin/AdminSettings'));
import ScrollToTop from "./components/ScrollToTop";
import CustomCursor from "@/components/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress";


function Router() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/about"} component={About} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/blog/:slug"} component={BlogPostPage} />
        <Route path={"/gallery"} component={Gallery} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/reset-password" component={AdminResetPassword} />
        <Route path="/admin">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Route>
        <Route path="/admin/gallery">
          <AdminLayout>
            <AdminGallery />
          </AdminLayout>
        </Route>
        <Route path="/admin/blog">
          <AdminLayout>
            <AdminBlog />
          </AdminLayout>
        </Route>
        <Route path="/admin/assets">
          <AdminLayout>
            <AdminAssets />
          </AdminLayout>
        </Route>
        <Route path="/admin/settings">
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        </Route>

        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <CustomCursor />
          <ScrollProgress />
          <Router />
          <Suspense fallback={null}>
            <EnquiryPopup />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
