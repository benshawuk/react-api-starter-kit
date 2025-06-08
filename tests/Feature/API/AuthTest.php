<?php

namespace Tests\Feature\API;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        // Get CSRF token first
        $this->get('/sanctum/csrf-cookie');

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

                $response->assertNoContent(); // Laravel Breeze returns 204 for successful registration

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com'
        ]);

        $this->assertAuthenticated();
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Get CSRF token first
        $this->get('/sanctum/csrf-cookie');

        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertNoContent(); // Laravel Breeze returns 204 for successful login
        $this->assertAuthenticated();
        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        // Get CSRF token first
        $this->get('/sanctum/csrf-cookie');

        $response = $this->post('/login', [
            'email' => 'wrong@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_authenticated_user_can_access_protected_route()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user');

        $response->assertOk()
            ->assertJson([
                'id' => $user->id,
                'email' => $user->email,
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_route()
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_user_can_logout()
    {
        $user = User::factory()->create();
        $this->actingAs($user); // Use session-based auth for test

        // Get CSRF token first
        $this->get('/sanctum/csrf-cookie');

        $response = $this->post('/logout');

        $response->assertNoContent(); // Laravel Breeze returns 204 for successful logout
        $this->assertGuest();
    }
}
