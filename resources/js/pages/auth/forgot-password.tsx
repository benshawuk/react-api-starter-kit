import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Link } from 'react-router-dom';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { getCsrfToken, getCsrfTokenFromCookie } from '@/lib/auth-utils';

export default function ForgotPassword() {
    const [data, setData] = useState({ email: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<string>('');

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus('');

        try {
            // Get CSRF token first
            await getCsrfToken();

            // Use FormData for Laravel Breeze compatibility
            const formData = new FormData();
            formData.append('email', data.email);

            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCsrfTokenFromCookie() || '',
                },
                credentials: 'include',
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 422 && responseData.errors) {
                    // Handle Laravel validation errors
                    const formattedErrors: Record<string, string> = {};
                    Object.keys(responseData.errors).forEach((key) => {
                        const errorArray = responseData.errors[key];
                        formattedErrors[key] = Array.isArray(errorArray) ? errorArray[0] : errorArray;
                    });
                    setErrors(formattedErrors);
                } else {
                    setErrors({
                        email: responseData.message || 'Failed to send reset link',
                    });
                }
                return;
            }

            // Success - show status message
            setStatus(responseData.status || 'Password reset link sent to your email');
        } catch {
            setErrors({ email: 'Network error occurred' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData({ email: e.target.value })}
                            placeholder="email@example.com"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Email password reset link
                        </Button>
                    </div>
                </form>

                <div className="text-muted-foreground space-x-1 text-center text-sm">
                    <span>Or, return to</span>
                    <Link to="/login" className="text-primary font-medium underline-offset-4 hover:underline">
                        log in
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
