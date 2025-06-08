import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get success message from location state (e.g., from password reset)
    const successMessage = location.state?.message;

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Use the auth context login method which handles session-based auth
            await login(data.email, data.password);

            // Success - navigate to dashboard
            navigate('/dashboard');
        } catch (error: any) {
            if (error.errors) {
                // Handle validation errors from auth context
                setErrors(error.errors);
            } else {
                setErrors({
                    email: error.message || 'Login failed',
                });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            {successMessage && <div className="mb-4 text-center text-sm font-medium text-green-600">{successMessage}</div>}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground ml-auto text-sm" tabIndex={5}>
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData((prev) => ({ ...prev, remember: !!checked }))}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-foreground hover:underline" tabIndex={5}>
                        Sign up
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
