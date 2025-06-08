<?php

use App\Models\User;

test('reset password link can be requested', function () {
    // Create a verified user (email_verified_at is required for password reset)
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    // Get CSRF token first
    $this->get('/sanctum/csrf-cookie');

    $response = $this->post('/forgot-password', ['email' => $user->email]);

    // Laravel Breeze returns 200 for successful password reset request
    $response->assertStatus(200);

    // Check if a password reset token was created in the database
    $this->assertDatabaseHas('password_reset_tokens', [
        'email' => $user->email,
    ]);
});

test('password reset token can be generated', function () {
    // Create a verified user
    $user = User::factory()->create([
        'email_verified_at' => now(),
    ]);

    // Get CSRF token first
    $this->get('/sanctum/csrf-cookie');

    // Request password reset
    $response = $this->post('/forgot-password', ['email' => $user->email]);
    $response->assertStatus(200);

    // Verify that a password reset token was created
    $this->assertDatabaseHas('password_reset_tokens', [
        'email' => $user->email,
    ]);
});
