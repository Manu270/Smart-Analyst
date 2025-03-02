# Smart Analyst

## Overview
Smart Analyst is a web-based AI-powered financial data analysis tool. Users can upload **10-K reports (PDFs)**, which are converted into structured **Excel files** with additional insights such as **row-wise and column-wise totals, total revenue, and key financial summaries**. The application also generates **interactive graphs** for better visualization.

Additionally, an **AI chatbot (powered by Gemini API)** is integrated into the platform to provide insights based on the financial data.

## Features
- **File Upload:** Users can upload 10-K reports in PDF format.
- **PDF to Excel Conversion:** Extracts financial data, computes additional metrics, and structures it in Excel format.
- **Excel File Download:** Processed files can be downloaded.
- **Graphical Representation:** Automatically generates balance sheets, revenue charts, and financial summaries.
- **AI Chatbot:** An interactive assistant that answers queries based on the financial data using **Google Gemini API**.
- **Modern UI:** Built using **React** for frontend and **Flask** for backend processing.

## Tech Stack
- **Frontend:** React.js
- **Backend:** Flask (Python)
- **AI Integration:** Google Gemini API
- **File Handling:** pandas, pdfplumber (for PDF extraction), openpyxl (for Excel processing)
- **Visualization:** Matplotlib, Plotly
- **Database (if applicable):** PostgreSQL / SQLite

## Installation
### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/Manu270/Smart-Analyst.git
   cd Smart-Analyst/backend
   ```
2. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Set up **Google Gemini API Key**:
   ```sh
   export GEMINI_API_KEY='your-api-key-here'
   ```
5. Run the Flask server:
   ```sh
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd ../frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the React application:
   ```sh
   npm start
   ```

   <img width="1470" alt="Screenshot 2025-03-02 at 11 30 15 AM" src="https://github.com/user-attachments/assets/5a4a8230-17ea-4620-b181-1f6f42303437" />
<img width="1470" alt="Screenshot 2025-03-02 at 11 31 03 AM" src="https://github.com/user-attachments/assets/f2d86c81-0fcb-4997-8307-c34f5da5aef5" />



## Usage
1. Upload a **10-K financial report (PDF)**.
2. The backend processes the file and converts it to an **Excel format** with additional insights.
3. Users can **download the processed Excel file**.
4. The application generates **graphs** based on the extracted data.
5. Users can interact with the **AI chatbot** to analyze key financial insights.

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/upload` | Upload a 10-K report (PDF) |
| `GET` | `/download/<filename>` | Download the converted Excel file |
| `GET` | `/graphs` | Fetch financial data visualizations |
| `POST` | `/chatbot` | Query the AI chatbot |

## Future Enhancements
- Support for **multiple file formats** beyond PDFs.
- Advanced financial **trend prediction** using AI models.
- Enhanced **dashboard UI** with better financial data representation.

## Contributing
Feel free to fork the repository and submit pull requests. Any contributions are welcome!

## License
This project is licensed under the MIT License. See `LICENSE` for details.


