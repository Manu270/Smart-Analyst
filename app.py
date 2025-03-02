import os
import pdfplumber
import pandas as pd
import re
import matplotlib
matplotlib.use('Agg')  # Fix: Prevents GUI errors

import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key="AIzaSyCWJ-hXKmlCaUIFFuEYK8EfljjpyeDAclc")
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
GRAPH_FOLDER = "graphs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(GRAPH_FOLDER, exist_ok=True)

latest_excel_file = None  #  Stores the latest processed Excel file

# Convert PDF to Categorized Excel
def pdf_to_excel(pdf_path, output_folder):
    global latest_excel_file
    try:
        output_filename = f"{os.path.splitext(os.path.basename(pdf_path))[0]}.xlsx"
        excel_path = os.path.join(output_folder, output_filename)

        print(f" Processing PDF: {pdf_path}")
        
        with pdfplumber.open(pdf_path) as pdf:
            tables = {}
            current_statement = None
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue

                # Identify Financial Statements
                if "Consolidated Balance Sheets" in text:
                    current_statement = "Balance Sheet"
                elif "Consolidated Statements of Operations" in text:
                    current_statement = "Income Statement"
                elif "Consolidated Statements of Cash Flows" in text:
                    current_statement = "Cash Flow"
                elif "Consolidated Statements of Comprehensive Income" in text:
                    current_statement = "Comprehensive Income"
                elif "Consolidated Statements of Equity" in text:
                    current_statement = ""

                if current_statement:
                    extracted_tables = page.extract_tables()
                    if extracted_tables:
                        for table in extracted_tables:
                            if not table or len(table) < 2:
                                continue

                            df = pd.DataFrame(table[1:], columns=table[0])

                            # Ensure Unique Column Names
                            df.columns = [f"{col}_{i}" if df.columns.tolist().count(col) > 1 else col for i, col in enumerate(df.columns)]

                            # Remove Dollar Symbols & Handle Missing Values
                            df = df.map(lambda x: re.sub(r'\$', '', str(x)) if isinstance(x, str) else x)
                            df.fillna("", inplace=True)

                            if current_statement not in tables:
                                tables[current_statement] = []
                            tables[current_statement].append(df)

        #  Save Extracted Data to Excel
        if not tables:
            print("No financial data found in PDF!")
            return None

        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            for statement, dfs in tables.items():
                combined_df = pd.concat(dfs, ignore_index=True)
                combined_df.to_excel(writer, sheet_name=statement, index=False)

        latest_excel_file = excel_path  # Store latest Excel file
        print(f"Excel file saved at: {excel_path}")
        return excel_path
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return None

# Upload File API
@app.route("/upload", methods=["POST"])
def upload_file():
    global latest_excel_file
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    filename = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filename)

    #  Convert PDF to Excel
    excel_file = pdf_to_excel(filename, OUTPUT_FOLDER)
    if excel_file:
        return jsonify({
            "message": "File processed successfully",
            "download_url": f"/download/{os.path.basename(excel_file)}"
        })
    else:
        return jsonify({"error": "Failed to extract data from PDF"}), 500

# Download Processed Excel API
@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)

# Generate Financial Graphs API (Fixed)
@app.route("/generate_graphs", methods=["GET"])
def generate_graphs():
    global latest_excel_file
    if not latest_excel_file:
        return jsonify({"error": "No processed file available. Upload a PDF first."}), 400

    try:
        excel_data = pd.read_excel(latest_excel_file, sheet_name=None)
        graph_urls = []

        for sheet_name, df in excel_data.items():
            #  Ensure data is present
            if df.empty:
                continue

            # Convert possible text-based numbers to numeric values
            df_numeric = df.apply(pd.to_numeric, errors='coerce')

            # Drop columns that are still non-numeric
            df_numeric = df_numeric.dropna(axis=1, how='all')

            # Ensure there are numeric columns to plot
            if df_numeric.empty:
                print(f"⚠️ No numeric data found in {sheet_name}, skipping graph generation.")
                continue

            # Generate and save the graph
            plt.figure(figsize=(10, 5))
            df_numeric.plot(kind="bar", title=f"{sheet_name} Analysis")
            plt.xlabel("Metrics")
            plt.ylabel("Values")
            plt.xticks(rotation=45)

            graph_path = os.path.join(GRAPH_FOLDER, f"{sheet_name}.png")
            plt.savefig(graph_path)  # Save the graph instead of displaying
            plt.close()

            graph_urls.append(f"/graph/{sheet_name}.png")

        if not graph_urls:
            return jsonify({"error": "No valid data available for graph generation."}), 400

        return jsonify({"message": "Graphs generated successfully", "graph_urls": graph_urls})

    except Exception as e:
        print(f"Error generating graphs: {e}")
        return jsonify({"error": "Failed to generate graphs"}), 500

# Serve Graph Files
@app.route("/graph/<filename>", methods=["GET"])
def get_graph(filename):
    return send_from_directory(GRAPH_FOLDER, filename)

# AI-Powered Financial Analysis API
@app.route("/ask", methods=["POST"])
def ai_question():
    global latest_excel_file
    data = request.json
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "No question provided"}), 400
    if not latest_excel_file:
        return jsonify({"error": "No processed file available. Upload a PDF first."}), 400

    try:
        excel_data = pd.read_excel(latest_excel_file, sheet_name=None)
        financial_data = ""

        for sheet_name, df in excel_data.items():
            financial_data += f"\n### {sheet_name} ###\n"
            financial_data += df.to_string(index=False) + "\n"

        ai_prompt = f"""
        You are a financial analyst. Below is a company's financial data extracted from a 10-K report. Use this data to answer the user's question.

        {financial_data}

        User's Question: {question}

        Provide a detailed, accurate response with insights.
        """

        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(ai_prompt)
        ai_answer = response.text

        return jsonify({"answer": ai_answer})

    except Exception as e:
        print(f" Gemini API Error: {e}")
        return jsonify({"error": "AI service is unavailable."}), 500

# Run Flask App
if __name__ == "__main__":
    app.run(debug=True)
