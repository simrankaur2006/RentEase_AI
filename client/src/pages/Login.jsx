import { SignIn } from '@clerk/clerk-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Log in');
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in to see your saved places and recommendations.</p>
      </div>
      <SignIn routing="path" path="/login" signUpUrl="/register" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
