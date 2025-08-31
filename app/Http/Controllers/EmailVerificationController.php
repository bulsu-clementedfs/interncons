<?php

namespace App\Http\Controllers;

use App\Services\EmailVerificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    protected EmailVerificationService $emailVerificationService;

    public function __construct(EmailVerificationService $emailVerificationService)
    {
        $this->emailVerificationService = $emailVerificationService;
    }

    /**
     * Show email verification notice (only for students)
     */
    public function notice(): Response|RedirectResponse
    {
        $user = Auth::user();
        
        // Only show verification notice for students
        if (!$user || !$user->isStudent()) {
            return redirect()->route('login')->with('error', 'Email verification is only available for student accounts.');
        }
        
        return Inertia::render('auth/verify-email');
    }

    /**
     * Verify email with token
     */
    public function verify(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email'
        ]);

        $verified = $this->emailVerificationService->verifyEmail(
            $request->token,
            $request->email
        );

        if ($verified) {
            return redirect()->route('login')->with('status', 'Email verified successfully! You can now log in. Your account is pending adviser approval.');
        }

        return redirect()->route('login')->with('error', 'Invalid or expired verification link.');
    }

    /**
     * Resend verification email (only for students)
     */
    public function resend(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return back()->with('error', 'You must be logged in to resend verification email.');
        }

        // Only allow resending for students
        if (!$user->isStudent()) {
            return back()->with('error', 'Email verification is only available for student accounts.');
        }

        try {
            $this->emailVerificationService->resendVerificationEmail($user);
            return back()->with('status', 'Verification email sent successfully!');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
