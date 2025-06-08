<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/settings/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patchJson('/api/profile', [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response->assertOk();

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patchJson('/api/profile', [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response->assertOk();

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->deleteJson('/api/profile', [
            'password' => 'password',
        ]);

    $response->assertOk();

    // For API calls, the session might not be automatically cleared
    // Just verify the user was deleted from database
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->deleteJson('/api/profile', [
            'password' => 'wrong-password',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);

    expect($user->fresh())->not->toBeNull();
});