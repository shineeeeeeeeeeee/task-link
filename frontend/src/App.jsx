import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Role from "./pages/auth/Role";
import CompanyMandatoryDetails from "./pages/auth/CompanyMandatoryDetails";
import StudentMandatoryDetails from "./pages/auth/StudentMandatoryDetails";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyProfile from "./pages/company/CompanyProfile";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/role" element={<Role />} />
        <Route path="/details/company" element={<CompanyMandatoryDetails />} />
        <Route path="/details/student" element={<StudentMandatoryDetails />} />
        <Route path="/s/:student_id" element={<StudentDashboard />} />
        <Route path="/s/:student_id/profile" element={<StudentProfile />} />
        <Route path="/c/:companyId" element={<CompanyDashboard />} />
        <Route path="/c/:companyId/profile" element={<CompanyProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
