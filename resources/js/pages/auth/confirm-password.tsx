// Components
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState({ password: '' });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch('/api/confirm-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({ password: data.password }),
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
                        password: responseData.message || 'Password confirmation failed',
                    });
                }
                return;
            }

            // Success - redirect to intended destination or dashboard
            const redirectTo = new URLSearchParams(location.search).get('redirect') || '/dashboard';
            navigate(redirectTo);
        } catch {
            setErrors({ password: 'Network error occurred' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData({ password: e.target.value })}
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Confirm password
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
