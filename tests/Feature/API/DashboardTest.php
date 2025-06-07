<?php

namespace Tests\Feature\API;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_access_dashboard()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'data' => [
                    'user' => [
                        'name',
                        'email',
                        'joined',
                    ],
                    'stats' => [
                        'total_users',
                        'user_joined_days_ago',
                    ],
                    'recent_activity' => [
                        'last_login',
                        'total_sessions',
                    ],
                ],
            ])
            ->assertJson([
                'message' => 'Dashboard data retrieved successfully',
                'data' => [
                    'user' => [
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                    ],
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertStatus(401);
    }
}
