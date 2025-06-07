<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard data for the authenticated user.
     */
    public function __invoke(Request $request)
    {
        $user = $request->user();

        // Example dashboard data - customize based on your app's needs
        $dashboardData = [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'joined' => $user->created_at->format('F j, Y'),
            ],
            'stats' => [
                'total_users' => \App\Models\User::count(),
                'user_joined_days_ago' => now()->diffInDays($user->created_at),
            ],
            'recent_activity' => [
                'last_login' => now()->subHours(2)->format('g:i A'),
                'total_sessions' => 47, // Example data
            ]
        ];

        return response()->json([
            'message' => 'Dashboard data retrieved successfully',
            'data' => $dashboardData
        ]);
    }
}
