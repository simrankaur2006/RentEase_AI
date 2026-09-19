import { SignUp } from '@clerk/clerk-react';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Register() {
  useDocumentTitle('Create account');
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-12">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Create your RentEase account</h1>
        <p className="mt-1 text-sm text-ink-500">Tell us what you need next and we will match listings to it.</p>
      </div>
      <SignUp routing="path" path="/register" signInUrl="/login" fallbackRedirectUrl="/onboarding" />
    </div>
  );
}
