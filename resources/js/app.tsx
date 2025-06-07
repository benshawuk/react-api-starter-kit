import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/auth-context';
import { initializeTheme } from './hooks/use-appearance';
import { AppRouter } from './router/app-router';

// Initialize theme on app start
initializeTheme();

const container = document.getElementById('app');
if (!container) {
    throw new Error('Root container not found');
}

const root = createRoot(container);

root.render(
    <BrowserRouter>
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    </BrowserRouter>,
);
