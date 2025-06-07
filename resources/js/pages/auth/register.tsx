import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { setAuthData } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    password_confirmation: data.password_confirmation,
                }),
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
                        email: responseData.message || 'Registration failed',
                    });
                }
                return;
            }

            // Registration successful - update auth state and redirect
            const { token, user } = responseData;
            setAuthData(token, user);
            navigate('/dashboard');
        } catch {
            setErrors({
                email: 'Network error occurred',
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 w-full" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Create account
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-foreground hover:underline" tabIndex={6}>
                        Log in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
