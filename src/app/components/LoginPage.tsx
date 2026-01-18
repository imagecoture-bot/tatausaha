import { useState } from 'react';
import { Lock, User, ArrowLeft, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onBack: () => void;
}

export function LoginPage({ onLogin, onBack }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError('Username atau password salah');
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">SMK AL-ISHLAH CISAUK</h1>
          </div>
          <p className="text-blue-100">Sistem Administrasi Biaya Sekolah</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login Admin</CardTitle>
            <CardDescription>
              Masukkan kredensial Anda untuk mengakses dashboard admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Demo Credentials:</p>
                <p>Username: <strong>admin</strong></p>
                <p>Password: <strong>admin123</strong></p>
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </form>
          </CardContent>
        </Card>

        <footer className="mt-8 text-center text-white text-sm">
          <p className="text-blue-100">
            Copyright &copy; {new Date().getFullYear()} SMK AL-ISHLAH CISAUK
          </p>
        </footer>
      </div>
    </div>
  );
}
