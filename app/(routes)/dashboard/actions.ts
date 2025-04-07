'use server';
import { spawn } from 'child_process';
import { fetchExpenses } from '@/lib/fetchExpenses';

export async function predictSpending(email: string): Promise<string | null> {
    try {
        console.log('Fetching expenses...');
        await fetchExpenses(email);

        return new Promise((resolve, reject) => {
            console.log('Running Python script...');
            const pythonProcess = spawn('python', ['ml/predict.py']);

            let data = '';
            pythonProcess.stdout.on('data', (chunk) => {
                data += chunk.toString();
            });

            pythonProcess.stderr.on('data', (chunk) => {
                console.error('Python stderr:', chunk.toString());
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python script exited with code ${code}`);
                if (code === 0) {
                    try {
                        const parsedData = JSON.parse(data);
                        if (parsedData.error) {
                            reject(new Error(parsedData.error));
                        } else {
                            resolve(parsedData);
                        }
                    } catch (error) {
                        console.error('Invalid JSON:', data);
                        reject(new Error('Failed to generate predictions.'));
                    }
                } else {
                    reject(new Error('Python script execution failed.'));
                }
            });
        });
    } catch (error) {
        console.error('Error in predictSpending:', error);
        throw new Error('Failed to fetch expenses or generate predictions.');
    }
}