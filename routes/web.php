<?php

use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Http\Controllers\CsrfCookieController;

require __DIR__.'/auth.php';

// CSRF cookie route for Sanctum SPA authentication
Route::get('/sanctum/csrf-cookie', [CsrfCookieController::class, 'show']);

// CLEAN SPA APPROACH: One route serves everything
// React Router handles all client-side routing: resources/js/router/app-router.tsx

// Laravel middleware/auth happens at API level, not route level
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*')->name('spa');
