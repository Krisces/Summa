import { fetchExpenses } from './lib/fetchExpenses.js'; // Add `.js` extension

async function test() {
    try {
        console.log('Starting test...');
        await fetchExpenses('user_id_here'); // Replace with actual user ID
        console.log('CSV file generated successfully.');
    } catch (error) {
        console.error('Error generating CSV file:', error);
    }
}

test();