const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Temporary storage for uploaded files
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Database to store file metadata and analysis results
const fileMetadataDb = [];
const analysisResultsDb = [];

// File upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const fileId = `${Date.now()}_${req.file.originalname}`;
  const fileName = req.file.originalname;

  const filePath = path.join(uploadsDir, fileId);
  fs.writeFileSync(filePath, req.file.buffer);

  const uploadDate = new Date();
  const fileMetadata = { fileId, fileName, uploadDate };
  fileMetadataDb.push(fileMetadata);

  res.json({ success: true, fileId, message: "File uploaded successfully" });
});

// Text analysis endpoint
app.post("/analyze/:fileId", (req, res) => {
  // console.log(req.body, "req.body");
  const { fileId } = req.params;
  const { operation, k } = req.body;

  const fileMetadata = fileMetadataDb.find(
    (metadata) => metadata.fileId === fileId
  );

  if (!fileMetadata) {
    return res.status(404).json({ error: "File not found" });
  }

  const filePath = path.join(uploadsDir, fileId);
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const words = fileContent.split(/\s+/).filter((word) => word !== "");

  let result;

  switch (operation) {
    case "countWords":
      result = { count: words.length };
      break;
    case "countUniqueWords":
      const uniqueWords = new Set(words);
      result = { count: uniqueWords.size };
      break;
    case "findTopKWords":
      if (!k || isNaN(k) || parseInt(k, 10) <= 0) {
        return res.status(400).json({ error: "Invalid 'k' parameter" });
      }

      const wordFrequencyMap = new Map();
      words.forEach((word) => {
        wordFrequencyMap.set(word, (wordFrequencyMap.get(word) || 0) + 1);
      });

      const sortedWords = [...wordFrequencyMap.entries()].sort(
        (a, b) => b[1] - a[1]
      );
      result = { topWords: sortedWords.slice(0, parseInt(k, 10)) };
      break;
    default:
      return res.status(400).json({ error: "Invalid operation" });
  }

  const taskId = uuidv4();
  analysisResultsDb.push({ taskId, fileId, result });
  res.json({ success: true, taskId });
});

// Retrieve analysis results endpoint
app.get("/results/:taskId", (req, res) => {
  const { taskId } = req.params;

  const analysisResult = analysisResultsDb.find(
    (result) => result.taskId === taskId
  );

  if (!analysisResult) {
    return res.status(404).json({ error: "Analysis result not found" });
  }

  res.json({ success: true, result: analysisResult.result });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
