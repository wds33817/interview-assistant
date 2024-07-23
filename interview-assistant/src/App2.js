import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const conversationEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = handleStop;
        mediaRecorder.start();
      })
      .catch((error) => console.error('Error accessing microphone:', error));
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');

    try {
      const response = await axios.post(
        'http://localhost:3001/transcribe',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const transcript = response.data.transcript;
      setTranscript(transcript);
      setConversation((prev) => [
        ...prev,
        { sender: 'user', message: transcript },
      ]);
      handleAskQuestion(transcript);
    } catch (error) {
      console.error('Error transcribing audio:', error);
    }
  };

  const handleAskQuestion = async (question) => {
    try {
      const response = await axios.post('http://localhost:3001/api/ask', {
        question,
      });
      const aiResponse = response.data.answer;
      setConversation((prev) => [
        ...prev,
        { sender: 'ai', message: aiResponse },
      ]);
      scrollToBottom();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='app'>
      <h1>面试助手</h1>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      <div className='conversation-container'>
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.message}</p>
          </div>
        ))}
        <div ref={conversationEndRef} />
      </div>
    </div>
  );
}

export default App;
