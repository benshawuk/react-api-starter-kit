<?php

use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('dashboard serves SPA for guests', function () {
    // In SPA architecture, server always serves the app
    // Client-side routing handles authentication redirects
    $this->get('/dashboard')->assertOk();
});

test('dashboard serves SPA for authenticated users', function () {
    $this->actingAs($user = User::factory()->create());

    // SPA is served for authenticated users too
    $this->get('/dashboard')->assertOk();
});