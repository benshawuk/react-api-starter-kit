<?php

use Illuminate\Support\Facades\Route;

require __DIR__.'/auth.php';

// CLEAN SPA APPROACH: One route serves everything
// React Router handles all client-side routing: resources/js/router/app-router.tsx

// Laravel middleware/auth happens at API level, not route level
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*')->name('spa');
