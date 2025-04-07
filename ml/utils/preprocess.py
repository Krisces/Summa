import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def preprocess_data(filepath):
    # Load data
    df = pd.read_csv(filepath)

    # Convert createdAt to datetime
    df["createdAt"] = pd.to_datetime(df["createdAt"])

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
    filepath = "ml/data/expenses.csv"
    monthly_spending, scaler = preprocess_data(filepath)
    monthly_spending.to_csv("ml/data/monthly_spending.csv", index=False)