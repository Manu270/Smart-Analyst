import React, { useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Card,
} from "@mui/material";
import { styled } from "@mui/system";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BarChartIcon from "@mui/icons-material/BarChart";
import ChatIcon from "@mui/icons-material/Chat";

const FullPageContainer = styled("div")({
  backgroundImage: `url('/images/background.png')`, // Reference the image stored in the "public/images" folder
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0",
  overflow: "auto",
});

const Navbar = styled(AppBar)({
  background: "#6a4c93",
  padding: "10px 20px",
  display: "flex",
  justifyContent: "space-between",
  flexDirection: "row",
  alignItems: "center",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
});

const NavLinks = styled(Box)({
  display: "flex",
  gap: "20px",
  alignItems: "center",
});

const ContentContainer = styled(Box)({
  display: "flex",
  justifyContent: "space-evenly",
  alignItems: "flex-start",
  width: "90%",
  marginTop: "40px",
});

const CardContainer = styled(Card)({
  background: "#ffffff",
  borderRadius: "15px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  width: "45%",
  padding: "20px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
});

const CornerImage = styled("img")({
  width: "50px",
  height: "50px",
  position: "absolute",
  top: "10px",
  right: "10px",
});

const StyledButton = styled(Button)({
  margin: "10px 0",
  textTransform: "none",
  padding: "10px 15px",
  borderRadius: "15px",
  backgroundColor: "#6a4c93",
  color: "white",
  "&:hover": {
    backgroundColor: "#563772",
  },
});

function App() {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [graphUrls, setGraphUrls] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData);
      setUploadMessage(response.data.message);
      setDownloadLink(response.data.download_url);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("File upload failed.");
    }
  };

  const handleGenerateGraphs = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/generate_graphs");

      if (response.data.graph_urls) {
        setGraphUrls(response.data.graph_urls);
      } else {
        alert("No graphs were generated.");
      }
    } catch (error) {
      console.error("Error generating graphs:", error);
      alert("Failed to generate graphs.");
    }
  };

  const handleAsk = async () => {
    if (!question) {
      alert("Please enter a question first.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/ask", { question });

      if (response.data && response.data.answer) {
        const newMessage = { question, answer: response.data.answer };
        setChatHistory([...chatHistory, newMessage]);
      } else {
        setChatHistory([
          ...chatHistory,
          { question, answer: "AI did not return a response." },
        ]);
      }

      setQuestion(""); // Clear input after asking
    } catch (error) {
      console.error("Error getting AI response:", error);
      setChatHistory([
        ...chatHistory,
        { question, answer: "Error: AI service is unavailable." },
      ]);
    }
  };

  return (
    <FullPageContainer>
      {/* Navbar */}
      <Navbar position="static">
        <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
          <AnalyticsIcon sx={{ marginRight: "10px" }} />
          Smart Analyst
        </Typography>
        <NavLinks>
          <Button sx={{ color: "white" }}>Home</Button>
          <Button sx={{ color: "white" }}>About</Button>
          <Button sx={{ color: "white" }}>Contact</Button>
        </NavLinks>
      </Navbar>

      {/* Main Content */}
      <ContentContainer>
        {/* Left Container */}
        <CardContainer>
          <CornerImage
            src="https://cdn-icons-png.flaticon.com/512/1297/1297773.png"
            alt="Upload Illustration"
          />
          <Typography variant="h5" gutterBottom>
            <UploadFileIcon sx={{ color: "#6a4c93", marginRight: "10px" }} />
            Upload & Process Data
          </Typography>
          <input type="file" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
          <StyledButton variant="contained" onClick={handleUpload}>
            Upload & Process
          </StyledButton>
          <Typography variant="body1" color="textSecondary" mt={2}>
            {uploadMessage}
          </Typography>
          {downloadLink && (
            <Button
              variant="contained"
              href={`http://127.0.0.1:5000${downloadLink}`}
              download
              sx={{ marginTop: 2 }}
            >
              Download Processed Excel File
            </Button>
          )}

          <Typography variant="h6" sx={{ marginTop: 3 }}>
            <BarChartIcon sx={{ color: "#6a4c93", marginRight: "10px" }} />
            Data Visualization
          </Typography>
          <StyledButton variant="contained" onClick={handleGenerateGraphs}>
            Generate Graphs
          </StyledButton>
          {graphUrls.length > 0 && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="body1" color="textSecondary">
                Generated Graphs:
              </Typography>
              {graphUrls.map((url, index) => (
                <Box key={index} sx={{ marginTop: 2, textAlign: "center" }}>
                  <img
                    src={`http://127.0.0.1:5000${url}`}
                    alt={`Graph ${index + 1}`}
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContainer>

        {/* Right Container */}
        <CardContainer>
          <CornerImage
            src="https://cdn-icons-png.flaticon.com/512/5542/5542756.png"
            alt="Chatbot Illustration"
          />
          <Typography variant="h6" gutterBottom>
            <ChatIcon sx={{ color: "#6a4c93", marginRight: "10px" }} />
            Smart Analyst Chatbot
          </Typography>
          <Paper
            elevation={0}
            sx={{
              maxHeight: "250px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
              padding: "10px",
            }}
          >
            {chatHistory.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No conversation yet. Start by asking a question!
              </Typography>
            ) : (
              chatHistory.map((msg, index) => (
                <Box key={index} sx={{ marginBottom: "10px" }}>
                  <Box
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#6a4c93" : "#e8e8f3",
                      color: index % 2 === 0 ? "#fff" : "#000",
                      padding: "10px",
                      borderRadius: "10px",
                      textAlign: "left",
                      width: "fit-content",
                      maxWidth: "80%",
                    }}
                  >
                    <Typography variant="body2">{msg.question}</Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: index % 2 === 1 ? "#6a4c93" : "#e8e8f3",
                      color: index % 2 === 1 ? "#fff" : "#000",
                      padding: "10px",
                      borderRadius: "10px",
                      textAlign: "left",
                      width: "fit-content",
                      maxWidth: "80%",
                      marginTop: "5px",
                    }}
                  >
                    <Typography variant="body2">{msg.answer}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
          <TextField
            fullWidth
            placeholder="Type your question here..."
            variant="outlined"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            sx={{ marginTop: 2, backgroundColor: "white" }}
          />
          <StyledButton variant="contained" onClick={handleAsk}>
            Send
          </StyledButton>
        </CardContainer>
      </ContentContainer>
    </FullPageContainer>
  );
}

export default App;
