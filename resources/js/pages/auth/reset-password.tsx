import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [data, setData] = useState<ResetPasswordForm>({
        token: searchParams.get('token') || '',
        email: searchParams.get('email') || '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // If no token or email in URL, redirect to forgot password
        if (!data.token || !data.email) {
            navigate('/forgot-password');
        }
    }, [data.token, data.email, navigate]);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(data),
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
                        email: responseData.message || 'Password reset failed',
                    });
                }
                return;
            }

            // Success - redirect to login
            navigate('/login', {
                state: { message: 'Password reset successfully. Please log in with your new password.' },
            });
        } catch {
            setErrors({ email: 'Network error occurred' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            readOnly
                            onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoFocus
                            onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => setData((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button type="submit" className="mt-4 w-full" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
