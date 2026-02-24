"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading, isEmailVerified } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    if (!isEmailVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-yellow-200">
                    <div className="text-6xl mb-4">📧</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Verify Your Email</h2>
                    <p className="text-gray-600 mb-6">
                        We've sent a verification link to <strong>{user.email}</strong>.
                        Please check your inbox and click the link to verify your email address.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-yellow-800">
                            💡 <strong>Tip:</strong> Check your spam folder if you don't see the email.
                        </p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                    >
                        I've Verified My Email
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
