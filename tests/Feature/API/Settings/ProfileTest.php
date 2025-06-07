<?php

namespace Tests\Feature\API\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_get_profile_information()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/profile');

        $response->assertOk()
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                ],
                'mustVerifyEmail' => false,
            ]);
    }

    public function test_user_can_update_profile()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/profile', [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Profile updated successfully',
                'user' => [
                    'name' => 'Jane Smith',
                    'email' => 'jane@example.com',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);
    }

    public function test_profile_update_requires_authentication()
    {
        $response = $this->patchJson('/api/profile', [
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
        ]);

        $response->assertStatus(401);
    }

    public function test_profile_update_validates_required_fields()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/profile', [
            'name' => '',
            'email' => 'invalid-email',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email']);
    }

    public function test_user_can_delete_account()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/profile', [
            'password' => 'password123',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Account deleted successfully'
            ]);

        $this->assertDatabaseMissing('users', [
            'id' => $user->id,
        ]);
    }

    public function test_account_deletion_requires_correct_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson('/api/profile', [
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }
}
