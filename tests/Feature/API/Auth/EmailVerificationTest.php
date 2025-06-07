<?php

namespace Tests\Feature\API\Auth;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_request_verification_email()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => null,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/email/verification-notification');

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'status'
            ])
            ->assertJson([
                'message' => 'Verification link sent successfully',
                'status' => 'verification-link-sent'
            ]);

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_already_verified_user_gets_appropriate_response()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/email/verification-notification');

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'status'
            ])
            ->assertJson([
                'message' => 'Email already verified',
                'status' => 'already-verified'
            ]);
    }

    public function test_unauthenticated_user_cannot_request_verification_email()
    {
        $response = $this->postJson('/api/email/verification-notification');

        $response->assertStatus(401);
    }

    public function test_verification_email_is_sent_to_correct_user()
    {
        Notification::fake();

        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'email_verified_at' => null,
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/email/verification-notification');

        Notification::assertSentTo($user, VerifyEmailNotification::class);
        Notification::assertNotSentTo(
            User::factory()->create(['email' => 'other@example.com']),
            VerifyEmailNotification::class
        );
    }

    public function test_multiple_verification_requests_dont_cause_errors()
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
            'email_verified_at' => null,
        ]);

        Sanctum::actingAs($user);

        // Send multiple verification requests
        $response1 = $this->postJson('/api/email/verification-notification');
        $response2 = $this->postJson('/api/email/verification-notification');
        $response3 = $this->postJson('/api/email/verification-notification');

        $response1->assertOk();
        $response2->assertOk();
        $response3->assertOk();

        // Should have sent multiple notifications
        Notification::assertSentToTimes($user, VerifyEmailNotification::class, 3);
    }

    public function test_verification_request_works_for_different_users()
    {
        Notification::fake();

        $user1 = User::factory()->create([
            'email' => 'user1@example.com',
            'email_verified_at' => null,
        ]);

        $user2 = User::factory()->create([
            'email' => 'user2@example.com',
            'email_verified_at' => null,
        ]);

        // Test first user
        Sanctum::actingAs($user1);
        $response1 = $this->postJson('/api/email/verification-notification');
        $response1->assertOk();

        // Test second user
        Sanctum::actingAs($user2);
        $response2 = $this->postJson('/api/email/verification-notification');
        $response2->assertOk();

        Notification::assertSentTo($user1, VerifyEmailNotification::class);
        Notification::assertSentTo($user2, VerifyEmailNotification::class);
    }
}