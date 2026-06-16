import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminResetPassword() {
  const [location, navigate] = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Extract token from URL
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-gray-100 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">This password reset link is invalid or missing a security token.</p>
          <Button onClick={() => navigate('/admin/login')} className="w-full">Back to Login</Button>
        </div>
      </div>
    );
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Password successfully reset! Redirecting to login...");
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        setError(data.error || 'Failed to reset password.');
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

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Create New Password</h2>

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

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
