import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import numpy as np
import json
import os

def preprocess_data(filepath):
    # Check if the file exists
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"File not found: {filepath}")

    # Load data
    df = pd.read_csv(filepath)

    # Convert createdAt to datetime (MM-DD-YYYY format)
    df["createdAt"] = pd.to_datetime(df["createdAt"], format="%m-%d-%Y")

    # Extract time-based features
    df["month"] = df["createdAt"].dt.month
    df["day_of_week"] = df["createdAt"].dt.dayofweek

    # Aggregate data by month
    monthly_spending = df.groupby(["month"]).agg({"amount": "sum"}).reset_index()

    # Normalize the amount
    scaler = MinMaxScaler(feature_range=(0, 1))
    monthly_spending["amount_normalized"] = scaler.fit_transform(monthly_spending[["amount"]])

    return monthly_spending, scaler

if __name__ == "__main__":
    filepath = os.path.join(os.getcwd(), 'ml/data/expenses.csv')
    try:
        monthly_spending, scaler = preprocess_data(filepath)

        # Dummy predictions for testing
        predictions = monthly_spending["amount_normalized"].tolist()
        print(json.dumps(predictions))  # Only print the JSON data
    except Exception as e:
        print(json.dumps({"error": str(e)}))  # Print error as JSON