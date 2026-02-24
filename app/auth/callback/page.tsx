"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error during auth callback:', error);
                router.push('/auth?error=callback_failed');
            } else {
                router.push('/');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Completing authentication...</p>
            </div>
        </div>
    );
}
