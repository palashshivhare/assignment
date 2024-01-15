# Text Analysis assignment

## Setup

1. **Install Dependencies:**

   ```bash
   npm install
   ```

# Run the Server

node index.js

API Endpoints

1. Upload a Text File
   Endpoint: POST /upload

Request:
Form Data: file (text file)

Response:
fileId: Unique identifier for the uploaded file.

2. Initiate Text Analysis
   Endpoint: POST /analyze/:fileId

Request:
operation: Analysis operation (countWords, countUniqueWords, or findTopKWords).
k (optional): Parameter for findTopKWords operation.

Response:
taskId: Unique identifier for the analysis task.

3. Retrieve Analysis Results
   Endpoint: GET /results/:taskId

Request:
taskId: Unique identifier for the analysis task.

Response:
Analysis results based on the specified task.

# Uploaded files are stored in memory for simplicity.Metadata and analysis results are stored in-memory databases. In production, you should use a persistent database.
