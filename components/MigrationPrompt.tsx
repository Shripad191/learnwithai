"use client";

import { useState } from 'react';
import {
    migrateLocalStorageToSupabase,
    clearLocalStorageData,
    type MigrationResult,
} from '@/lib/migrate-to-supabase';

interface MigrationPromptProps {
    itemCount: number;
    onComplete: () => void;
    onSkip: () => void;
}

export default function MigrationPrompt({ itemCount, onComplete, onSkip }: MigrationPromptProps) {
    const [isMigrating, setIsMigrating] = useState(false);
    const [result, setResult] = useState<MigrationResult | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const handleMigrate = async () => {
        setIsMigrating(true);

        try {
            const migrationResult = await migrateLocalStorageToSupabase();
            setResult(migrationResult);

            if (migrationResult.success) {
                // Clear localStorage after successful migration
                clearLocalStorageData();

                // Wait a bit to show success message
                setTimeout(() => {
                    onComplete();
                }, 2000);
            }
        } catch (error) {
            setResult({
                success: false,
                totalItems: itemCount,
                migratedItems: 0,
                failedItems: itemCount,
                errors: [error instanceof Error ? error.message : 'Migration failed'],
            });
        } finally {
            setIsMigrating(false);
        }
    };

    const handleSkip = () => {
        // Set migration flag to prevent showing prompt again
        if (typeof window !== 'undefined') {
            localStorage.setItem('migrated_to_supabase', 'skipped');
        }
        onSkip();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                {!result ? (
                    <>
                        {/* Migration Prompt */}
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">📦</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Data Migration Available
                            </h2>
                            <p className="text-gray-600">
                                We found <strong>{itemCount}</strong> saved item{itemCount !== 1 ? 's' : ''} in your local storage.
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                <strong>What's changing?</strong>
                            </p>
                            <p className="text-sm text-blue-700 mt-2">
                                We're upgrading to cloud storage for better reliability and access across devices.
                                Your data will be securely migrated to Supabase.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleMigrate}
                                disabled={isMigrating}
                                className="w-full py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isMigrating ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Migrating...
                                    </span>
                                ) : (
                                    'Migrate My Data'
                                )}
                            </button>

                            <button
                                onClick={handleSkip}
                                disabled={isMigrating}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Skip for Now
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 text-center mt-4">
                            Your local data will remain accessible if you skip
                        </p>
                    </>
                ) : (
                    <>
                        {/* Migration Result */}
                        {result.success ? (
                            <div className="text-center">
                                <div className="text-6xl mb-4">✅</div>
                                <h2 className="text-2xl font-bold text-green-600 mb-2">
                                    Migration Successful!
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Successfully migrated <strong>{result.migratedItems}</strong> of{' '}
                                    <strong>{result.totalItems}</strong> items.
                                </p>
                                {result.failedItems > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-yellow-800">
                                            {result.failedItems} item{result.failedItems !== 1 ? 's' : ''} could not be migrated.
                                        </p>
                                    </div>
                                )}
                                <p className="text-sm text-gray-500">
                                    Redirecting to your dashboard...
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h2 className="text-2xl font-bold text-red-600 mb-2">
                                    Migration Failed
                                </h2>
                                <p className="text-gray-600 mb-4">
                                    Could not migrate your data. Please try again or contact support.
                                </p>

                                {result.errors.length > 0 && (
                                    <div className="mb-4">
                                        <button
                                            onClick={() => setShowDetails(!showDetails)}
                                            className="text-sm text-blue-600 hover:text-blue-700 underline"
                                        >
                                            {showDetails ? 'Hide' : 'Show'} Error Details
                                        </button>

                                        {showDetails && (
                                            <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto text-left">
                                                {result.errors.map((error, index) => (
                                                    <p key={index} className="text-xs text-red-700 mb-1">
                                                        • {error}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <button
                                        onClick={handleMigrate}
                                        className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={handleSkip}
                                        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                                    >
                                        Skip for Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
