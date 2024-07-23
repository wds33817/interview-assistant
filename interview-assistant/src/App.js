import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState([]);
  const conversationEndRef = useRef(null);

  useEffect(() => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript;
          setTranscript(finalTranscript);
          setConversation((prev) => [
            ...prev,
            { sender: 'user', message: finalTranscript },
          ]);
        }
      }
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (transcript) {
      handleAskQuestion(transcript);
    }
  }, [transcript]);

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
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  return (
    <div className='app'>
      <h1>面试助手</h1>
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
