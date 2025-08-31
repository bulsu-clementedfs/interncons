<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmailVerificationService
{
    /**
     * Generate and send email verification token (only for students)
     */
    public function sendVerificationEmail(User $user): void
    {
        // Only send verification emails to students
        if (!$user->hasRole('student')) {
            throw new \Exception('Email verification is only available for student accounts.');
        }
        
        // Generate a unique verification token
        $token = Str::random(64);
        
        // Store the token in the user record
        $user->update(['email_verification_token' => $token]);
        
        // Generate verification URL
        $verificationUrl = route('email.verify', [
            'token' => $token,
            'email' => $user->email
        ]);
        
        // Send the verification email using Resend
        Mail::to($user->email)->send(new EmailVerificationMail($user, $verificationUrl));
    }
    
    /**
     * Verify email with token (only for students)
     */
    public function verifyEmail(string $token, string $email): bool
    {
        $user = User::where('email', $email)
                   ->where('email_verification_token', $token)
                   ->whereNull('email_verified_at')
                   ->first();
        
        if (!$user) {
            return false;
        }
        
        // Only allow verification for students
        if (!$user->hasRole('student')) {
            return false;
        }
        
        // Mark email as verified and clear the token
        $user->update([
            'email_verified_at' => now(),
            'email_verification_token' => null,
            'status' => 'unverified' // Keep as unverified until adviser approval
        ]);
        
        return true;
    }
    
    /**
     * Check if user's email is verified
     */
    public function isEmailVerified(User $user): bool
    {
        return !is_null($user->email_verified_at);
    }
    
    /**
     * Resend verification email (only for students)
     */
    public function resendVerificationEmail(User $user): void
    {
        // Only allow resending for students
        if (!$user->hasRole('student')) {
            throw new \Exception('Email verification is only available for student accounts.');
        }
        
        if ($this->isEmailVerified($user)) {
            throw new \Exception('Email is already verified.');
        }
        
        $this->sendVerificationEmail($user);
    }
}
