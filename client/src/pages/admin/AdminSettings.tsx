import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const [, navigate] = useLocation();
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('vjrack-admin-token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setRecoveryEmail(data.settings.recoveryEmail || '');
        }
      })
      .catch(console.error);
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    const token = sessionStorage.getItem('vjrack-admin-token');

    try {
      const payload: any = { recoveryEmail };
      if (newPassword) payload.newPassword = newPassword;

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Settings saved successfully.");
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Settings</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center text-sm border border-red-100">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center text-sm border border-green-100">
          <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Security & Recovery</CardTitle>
          <CardDescription>
            Update your recovery email and admin password. Your recovery email will be used if you forget your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Recovery Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Make sure you have access to this email.</p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
