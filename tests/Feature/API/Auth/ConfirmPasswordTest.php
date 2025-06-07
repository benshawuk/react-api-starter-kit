<?php

namespace Tests\Feature\API\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConfirmPasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_confirm_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/confirm-password', [
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message'
            ])
            ->assertJson([
                'message' => 'Password confirmed successfully',
            ]);
    }

    public function test_password_confirmation_fails_with_wrong_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/confirm-password', [
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_password_confirmation_requires_password()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/confirm-password', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_unauthenticated_user_cannot_confirm_password()
    {
        $response = $this->postJson('/api/confirm-password', [
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    public function test_password_confirmation_validates_against_current_user()
    {
        $user1 = User::factory()->create([
            'email' => 'user1@example.com',
            'password' => Hash::make('password123'),
        ]);

        $user2 = User::factory()->create([
            'email' => 'user2@example.com',
            'password' => Hash::make('different-password'),
        ]);

        Sanctum::actingAs($user1);

        // Try to confirm with user2's password
        $response = $this->postJson('/api/confirm-password', [
            'password' => 'different-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_password_confirmation_works_with_special_characters()
    {
        $complexPassword = 'P@ssw0rd!@#$%^&*()';

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make($complexPassword),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/confirm-password', [
            'password' => $complexPassword,
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Password confirmed successfully',
            ]);
    }

    public function test_password_confirmation_is_case_sensitive()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('Password123'),
        ]);

        Sanctum::actingAs($user);

        // Try with different case
        $response = $this->postJson('/api/confirm-password', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // Try with correct case
        $response = $this->postJson('/api/confirm-password', [
            'password' => 'Password123',
        ]);

        $response->assertOk();
    }

    public function test_password_confirmation_handles_empty_string()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/confirm-password', [
            'password' => '',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_password_confirmation_handles_null_password()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/confirm-password', [
            'password' => null,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}