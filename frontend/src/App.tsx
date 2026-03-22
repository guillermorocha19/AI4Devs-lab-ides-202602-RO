import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import RecruiterDashboard from './components/RecruiterDashboard';
import AddCandidateForm from './components/AddCandidateForm';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecruiterDashboard />} />
        <Route path="/candidates/add" element={<AddCandidateForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
