# Resend Email Configuration Setup

## Environment Variables

Add the following variables to your `.env` file:

```env
# Mail Configuration
MAIL_MAILER=resend
MAIL_FROM_ADDRESS="onboarding@resend.dev"
MAIL_FROM_NAME="Internship Management System"

# Resend API Key
RESEND_KEY=re_Pp2NiMb2_9778svgpT67w84mNsytg7ZYC
```

## Important Notes

1. **Replace the API Key**: The provided API key is for demonstration. Replace it with your actual Resend API key from [https://resend.com/api-keys](https://resend.com/api-keys)

2. **Domain Setup**: For production, you should:
   - Add your own domain to Resend
   - Update `MAIL_FROM_ADDRESS` to use your domain (e.g., `noreply@yourdomain.com`)

3. **Security**: Never commit your actual API keys to version control. Use environment variables.

## How It Works

1. **Registration**: When a user registers, they receive an email verification link
2. **Email Verification**: Users must click the verification link to verify their email
3. **Adviser Approval**: Only email-verified accounts appear in the adviser's approval list
4. **Account Activation**: After email verification, accounts are submitted for adviser approval

## Testing

To test the email functionality:

1. Set up the environment variables
2. Register a new account
3. Check the email inbox (and spam folder)
4. Click the verification link
5. Verify the account appears in adviser approval list

## Troubleshooting

- **Emails not sending**: Check your Resend API key and domain configuration
- **Emails going to spam**: Set up proper SPF/DKIM records for your domain
- **Verification not working**: Check that the verification token is being generated and stored correctly
