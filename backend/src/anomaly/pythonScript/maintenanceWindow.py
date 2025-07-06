import pandas as pd
import sys
import json
import argparse
from datetime import datetime
import numpy as np

def analyze_excel(file_path, sheet_name=None):
    try:
        # Read Excel file
        if sheet_name:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
        else:
            df = pd.read_excel(file_path)
        
        # Convert every row to JSON format
        rows_as_json = []
        
        for index, row in df.iterrows():
            # Create a clean dictionary for each row
            row_dict = {}
            
            for column in df.columns:
                value = row[column]
                
                # Handle different data types and clean the data
                if pd.isna(value):
                    row_dict[column] = None
                elif isinstance(value, pd.Timestamp):
                    # Convert dates to string format
                    row_dict[column] = value.strftime('%m/%d/%Y') if not pd.isna(value) else None
                elif isinstance(value, (int, float)):
                    # Handle numeric values
                    if pd.isna(value):
                        row_dict[column] = None
                    else:
                        # Keep as number if it's a valid number
                        row_dict[column] = int(value) if float(value).is_integer() else float(value)
                else:
                    # Handle string values
                    str_value = str(value).strip()
                    row_dict[column] = str_value if str_value != 'nan' else None
            
            # Add row metadata
            row_dict['row_index'] = index + 1
            
            rows_as_json.append(row_dict)
        
        # Basic file info
        file_info = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'columns': df.columns.tolist(),
            'processed_rows': len(rows_as_json)
        }
        
        result = {
            'success': True,
            'file_info': file_info,
            'data': rows_as_json  # Every row as individual JSON objects
        }
        
        print(json.dumps(result, default=str, ensure_ascii=False))
        
    except Exception as e:
        error_result = {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--file_path', required=True, help='Path to Excel file')
    parser.add_argument('--sheet_name', help='Sheet name (optional)')
    
    args = parser.parse_args()
    analyze_excel(args.file_path, args.sheet_name)