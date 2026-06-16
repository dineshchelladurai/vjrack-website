import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [view, setView] = useState<'login' | 'forgot' | '2fa'>('login');
  
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [tempSecret, setTempSecret] = useState('');
  const [setup2FAUrl, setSetup2FAUrl] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    
    try {
      const payload: any = { password };
      if (view === '2fa') payload.code = totpCode;
      if (tempSecret) payload.tempSecret = tempSecret;

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        if (data.requiresSetup) {
          setSetup2FAUrl(data.qrCodeUrl);
          setTempSecret(data.tempSecret);
          setView('2fa');
        } else if (data.requires2FA) {
          setView('2fa');
        } else {
          sessionStorage.setItem('vjrack-admin-token', data.token);
          navigate('/admin');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('/api/admin/forgot-password', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage("A password reset link has been sent to the configured recovery email.");
      } else {
        setError(data.error || 'Failed to send recovery email.');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100">
        
        <div className="flex justify-center mb-6">
          <img src="/vjrack-logo.png" alt="VJ Rack" className="h-12 w-auto object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          {view === 'login' && 'Admin Login'}
          {view === 'forgot' && 'Reset Password'}
          {view === '2fa' && 'Two-Factor Authentication'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setView('forgot'); setError(''); setMessage(''); }}
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {view === '2fa' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {setup2FAUrl && (
              <div className="text-center space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">Scan this QR code with Google Authenticator or Authy</p>
                <img src={setup2FAUrl} alt="2FA Setup" className="mx-auto w-40 h-40 border bg-white p-2" />
              </div>
            )}
            <div>
              <Label>Authenticator Code</Label>
              <Input
                type="text"
                placeholder="000000"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="text-center text-2xl tracking-widest"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || totpCode.length !== 6}>
              Verify
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {view === 'forgot' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-6">
              If you have configured a recovery email in the admin settings, clicking the button below will send a secure reset link.
            </p>
            <Button onClick={handleForgotPassword} className="w-full" disabled={isLoading}>
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Recovery Email'}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
