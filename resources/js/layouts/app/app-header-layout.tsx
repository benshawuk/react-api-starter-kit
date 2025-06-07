import { AppHeader } from '@/components/app-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

interface AppHeaderLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppHeaderLayout({ children, breadcrumbs }: PropsWithChildren<AppHeaderLayoutProps>) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <AppHeader breadcrumbs={breadcrumbs} />
            <main className="flex-1">{children}</main>
        </div>
    );
}
