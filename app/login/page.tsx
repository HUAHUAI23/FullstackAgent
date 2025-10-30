'use client';

import { useEffect, useState } from 'react';
import { Github, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for registration success message
  useEffect(() => {
    const registered = searchParams.get('registered');
    const usernameParam = searchParams.get('username');
    if (registered === 'true' && usernameParam) {
      setSuccessMessage('Account created successfully! Please sign in.');
      setUsername(usernameParam);
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage(''); // Clear success message on new login attempt

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        callbackUrl: '/projects',
      });

      if (result?.error) {
        // Check error type to determine action
        if (result.error.includes('UserNotFound')) {
          // User doesn't exist - redirect to register
          router.push(`/register?username=${encodeURIComponent(username)}`);
        } else if (result.error.includes('InvalidCredentials')) {
          setError('Invalid username or password');
        } else if (result.error.includes('CredentialsRequired')) {
          setError('Username and password are required');
        } else {
          setError('An error occurred. Please try again.');
        }
      } else if (result?.ok) {
        // Login successful - redirect to callbackUrl
        router.push('/projects');
        router.refresh();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Welcome to FullStack Agent</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-200">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="your-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {successMessage && (
              <p className="text-green-500 text-sm text-center">{successMessage}</p>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <User className="mr-2 h-5 w-5" />
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              No account? You will be redirected to register page
            </p>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-400">Or</span>
            </div>
          </div>

          <Button
            onClick={() => signIn('github', { callbackUrl: '/projects' })}
            className="w-full bg-white text-black hover:bg-gray-200"
            size="lg"
            variant="outline"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
