import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage.jsx';
import AlgorithmsPage from './components/AlgorithmsPage.jsx';
import BlogPage from './components/BlogPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/algorithms" element={<AlgorithmsPage />} />
        <Route path="/gen-ai-guide" element={<BlogPage />} />
      </Routes>
    </Router>
  );
}

export default App;
