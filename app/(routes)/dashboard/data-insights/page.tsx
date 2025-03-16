'use client';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Import the useUser hook
import { predictSpending } from '../actions';

export default function AnalysisPage() {
    const [predictions, setPredictions] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser(); // Get the current user

    const handlePredict = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (!user) {
                throw new Error('User not authenticated.');
            }

            const email = user.primaryEmailAddress?.emailAddress; // Get the user's email
            if (!email) {
                throw new Error('User email not found.');
            }

            console.log('Fetching predictions for user:', email);

            const predictionsData = await predictSpending(email); // Pass the email
            console.log('Predictions:', predictionsData); // Log the predictions
            setPredictions(predictionsData);  // Set state with the correct type
        } catch (error) {
            console.error('Error fetching predictions:', error);
            setError('Failed to fetch predictions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Spending Predictions</h1>
            <button
                onClick={handlePredict}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
                {isLoading ? 'Loading...' : 'Predict Spending'}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {predictions && (
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Predictions</h2>
                    <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(predictions, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}