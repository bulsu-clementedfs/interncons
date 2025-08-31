import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
    const { post, processing, recentlySuccessful } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('email.resend'));
    };

    return (
        <>
            <Head title="Email Verification" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                                <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">
                                Verify Your Email
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            {recentlySuccessful && (
                                <Alert>
                                    <AlertDescription>
                                        A new verification link has been sent to your email address.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="w-full"
                                >
                                    {processing ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Resend Verification Email
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Didn't receive the email? Check your spam folder or{' '}
                                    <button
                                        onClick={submit}
                                        disabled={processing}
                                        className="text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        click here to resend
                                    </button>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}