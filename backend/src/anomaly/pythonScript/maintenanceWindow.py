#!/usr/bin/env python3
import sys
import json
import pandas as pd
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--file_path', required=True)
    parser.add_argument('--sheet_name', required=True)
    args = parser.parse_args()
    
    try:
        # Read Excel file and get available sheets
        excel_file = pd.ExcelFile(args.file_path)
        available_sheets = excel_file.sheet_names
        
        # Debug: Print available sheets to stderr (won't interfere with JSON output)
        # print(f"DEBUG: Available sheets: {available_sheets}", file=sys.stderr)
        # print(f"DEBUG: Looking for sheet: '{args.sheet_name}'", file=sys.stderr)
        
        # Strategy to find the right sheet:
        df = None
        sheet_used = None
        
        # 1. Try exact match
        if args.sheet_name in available_sheets:
            df = pd.read_excel(args.file_path, sheet_name=args.sheet_name)
            sheet_used = args.sheet_name
            # print(f"DEBUG: Found exact match: {args.sheet_name}", file=sys.stderr)
        
        # 2. Try without file extension
        elif len(available_sheets) > 0:
            # Remove common extensions from the sheet name
            clean_sheet_name = args.sheet_name.replace('.xlsx', '').replace('.xls', '').strip()
            print(f"DEBUG: Trying cleaned name: '{clean_sheet_name}'", file=sys.stderr)
            
            if clean_sheet_name in available_sheets:
                df = pd.read_excel(args.file_path, sheet_name=clean_sheet_name)
                sheet_used = clean_sheet_name
                print(f"DEBUG: Found cleaned match: {clean_sheet_name}", file=sys.stderr)
            else:
                # 3. Use the first sheet as fallback
                first_sheet = available_sheets[0]
                df = pd.read_excel(args.file_path, sheet_name=first_sheet)
                sheet_used = first_sheet
                print(f"DEBUG: Using first sheet as fallback: {first_sheet}", file=sys.stderr)
        
        # 4. Last resort: read without specifying sheet
        else:
            df = pd.read_excel(args.file_path)
            sheet_used = "default"
            print("DEBUG: Using default sheet reading", file=sys.stderr)
        
        if df is None or df.empty:
            raise ValueError("No data found in Excel file")
        
        # Print column names for debugging
        # print(f"DEBUG: Columns found: {list(df.columns)}", file=sys.stderr)
        # print(f"DEBUG: Number of rows: {len(df)}", file=sys.stderr)
        
        # Convert to list of dictionaries
        data = df.to_dict('records')
        
        # Ensure we always return an array
        if not isinstance(data, list):
            data = [data] if data else []
        
        # Output JSON to stdout
        result = {
            "success": True,
            "data": data,
            "total_rows": len(data),
            "sheet_used": sheet_used,
            "available_sheets": available_sheets,
            "columns": list(df.columns)
        }
        
        print(json.dumps(result, indent=2, default=str))  # default=str handles datetime objects
        
    except Exception as e:
        # print(f"DEBUG: Error occurred: {str(e)}", file=sys.stderr)
        error_result = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "data": [],
            "available_sheets": available_sheets if 'available_sheets' in locals() else []
        }
        # print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()