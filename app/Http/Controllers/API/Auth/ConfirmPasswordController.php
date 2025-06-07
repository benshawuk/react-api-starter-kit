<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ConfirmPasswordController extends Controller
{
    /**
     * Confirm the user's password.
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            throw ValidationException::withMessages([
                'password' => [__('auth.password')],
            ]);
        }

        // For API, we'll return a success response instead of using sessions
        return response()->json([
            'message' => 'Password confirmed successfully'
        ]);
    }
}