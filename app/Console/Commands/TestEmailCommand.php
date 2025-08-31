<?php

namespace App\Console\Commands;

use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test email verification to the specified email address';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("Sending test email to: {$email}");
        
        try {
            // Create a temporary user object for testing
            $user = new User();
            $user->username = 'testuser';
            $user->email = $email;
            
            // Create a test verification URL
            $verificationUrl = route('email.verify', [
                'token' => 'test-token-123',
                'email' => $email
            ]);
            
            // Send the email
            Mail::to($email)->send(new EmailVerificationMail($user, $verificationUrl));
            
            $this->info("✅ Test email sent successfully to {$email}!");
            $this->info("Check your inbox (and spam folder) for the verification email.");
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to send email: " . $e->getMessage());
            $this->error("Make sure your Resend configuration is set up correctly in your .env file.");
        }
    }
}
