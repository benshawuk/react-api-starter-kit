<?php

use App\Http\Controllers\API\Auth\ConfirmPasswordController;
use App\Http\Controllers\API\Auth\EmailVerificationController;
use App\Http\Controllers\API\Auth\ForgotPasswordController;
use App\Http\Controllers\API\Auth\LoginController;
use App\Http\Controllers\API\Auth\LogoutController;
use App\Http\Controllers\API\Auth\RegisterController;
use App\Http\Controllers\API\Auth\ResetPasswordController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\Settings\PasswordController;
use App\Http\Controllers\API\Settings\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public authentication routes
Route::post('/register', RegisterController::class);
Route::post('/login', LoginController::class);
Route::post('/forgot-password', ForgotPasswordController::class);
Route::post('/reset-password', ResetPasswordController::class);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Authentication
    Route::post('/logout', LogoutController::class);
    Route::post('/email/verification-notification', EmailVerificationController::class);
    Route::post('/confirm-password', ConfirmPasswordController::class);

    // Dashboard
    Route::get('/dashboard', DashboardController::class);

    // Profile management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);

    // Password management
    Route::put('/password', [PasswordController::class, 'update']);
});
