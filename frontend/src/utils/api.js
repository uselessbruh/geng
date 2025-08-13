const API_BASE = "http://127.0.0.1:6002";

export const generateSyntheticData = async (tableName, numRows, validationColumn = null) => {
  try {
    const requestBody = {
      table_name: tableName,
      num_rows: numRows
    };

    // Only add validation_column if validation is enabled and a column is selected
    if (validationColumn) {
      requestBody.validation_column = validationColumn;
    }

    const response = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating synthetic data:', error);
    throw error;
  }
};

export const downloadCSV = (base64Data, fileName) => {
  try {
    const csvContent = atob(base64Data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
}; 