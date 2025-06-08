import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authenticatedFetch } from '@/lib/auth-utils';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState<string>('');

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setStatus('');

        try {
            const response = await authenticatedFetch('/api/email/verification-notification', {
                method: 'POST',
            });

            const responseData = await response.json();

            if (!response.ok) {
                setStatus('Failed to send verification email');
                return;
            }

            // Success - show status message
            if (responseData.status === 'verification-link-sent') {
                setStatus('A new verification link has been sent to the email address you provided during registration.');
            } else if (responseData.status === 'already-verified') {
                setStatus('Your email is already verified!');
            } else {
                setStatus(responseData.message || 'Verification email sent successfully');
            }
        } catch {
            setStatus('Network error occurred');
        } finally {
            setProcessing(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Resend verification email
                </Button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="text-primary mx-auto block text-sm font-medium underline-offset-4 hover:underline"
                >
                    Log out
                </button>
            </form>
        </AuthLayout>
    );
}
