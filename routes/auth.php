<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

// All authentication is now handled by API routes in routes/api.php
// These are legacy routes kept for backward compatibility if needed

Route::middleware('auth')->group(function () {
    // Settings API routes
    Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('/settings/password', [PasswordController::class, 'update'])->name('password.update');
});
