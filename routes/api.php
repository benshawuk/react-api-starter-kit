<?php

use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\Settings\PasswordController;
use App\Http\Controllers\API\Settings\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Protected routes only - auth routes handled by routes/auth.php
Route::middleware('auth:sanctum')->group(function () {
    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard
    Route::get('/dashboard', DashboardController::class);

    // Profile management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // Password management
    Route::put('/password', [PasswordController::class, 'update']);
});
