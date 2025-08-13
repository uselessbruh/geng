import pandas as pd

# Input and output file paths
input_file = "D:\\csfinal\\backend\\eicu-demo\\vitalPeriodic\\vitalPeriodic.csv"
output_file = "D:\\csfinal\\backend\\eicu-demo\\vitalPeriodic\\vitalPeriodic.csv"

# Read CSV
df = pd.read_csv(input_file)

# Find halfway point
half = len(df.columns) // 2

# Keep only first half of columns
df_first_half = df.iloc[:, :half]

# Save to new file
df_first_half.to_csv(output_file, index=False)

print(f"File saved: {output_file} (kept first {half} columns, removed last half)")
