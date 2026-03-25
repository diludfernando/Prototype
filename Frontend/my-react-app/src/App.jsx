import { Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Homepage Components
import Hero from './components/Homepage/Hero';
import Features from './components/Homepage/Features';

// Skill Assessment Components
import LevelSelection from './components/Skill Assessment/LevelSelection';
import BeginnerQuiz from './components/Skill Assessment/BeginnerQuiz';
import IntermediateQuiz from './components/Skill Assessment/IntermediateQuiz';
import AdvancedQuiz from './components/Skill Assessment/AdvancedQuiz';
import SkillGapAnalysis from './components/Skill Assessment/SkillGapAnalysis';

// User Management Components
import Login from './components/User_Management/Login';
import Register from './components/User_Management/Register';
import CompleteProfile from './components/User_Management/CompleteProfile';
import CounselorCompleteProfile from './components/User_Management/CounselorCompleteProfile';
import ViewProfile from './components/User_Management/ViewProfile';
import EditProfile from './components/User_Management/EditProfile';

// Admin Components
import Dashboard from './components/Admin/Dashboard';
import UserManagement from './components/Admin/UserManagement';

// Counselor Components
import CounselorDashboard from './components/Counselor/CounselorDashboard';
import CounselorEditProfile from './components/Counselor/CounselorEditProfile';

// User Components
import UserServices from './components/User/UserServices';

// Counselling Components
import BookingPage from './components/Counselling/BookingPage';
import NewBooking from './components/Counselling/NewBooking';
import Payment from './components/Counselling/Payment';

// IT Learning Resources Components
import ITLearningResources from './components/IT Learning Resources/ITLearningResources';
import ResourceDetails from './components/IT Learning Resources/ResourceDetails';


import ProgressDashboard from './components/ProgressTracking/ProgressDashboard';
import JobsPortal from './components/ProgressTracking/JobsPortal';
import JobApply from './components/ProgressTracking/JobApply';
import MyApplications from './components/ProgressTracking/MyApplications';
import AddJob from './components/ProgressTracking/AddJob';

function App() {

  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          {/* Homepage */}
          <Route path="/" element={
            <>
              <Hero />
              <Features />
            </>
          } />

          {/* Skill Assessment */}
          <Route path="/assessment" element={<LevelSelection />} />
          <Route path="/assessment/beginner" element={<BeginnerQuiz />} />
          <Route path='/assessment/intermediate' element={<IntermediateQuiz />} />
          <Route path="/assessment/advanced" element={<AdvancedQuiz />} />
          <Route path="/skill-gap-analysis" element={<SkillGapAnalysis />} />

          {/* User Management */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/view-profile" element={<ViewProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* Counselor */}
          <Route path="/counselor/complete-profile" element={<CounselorCompleteProfile />} />
          <Route path="/counselor/dashboard" element={<CounselorDashboard />} />
           <Route path="/counselor/profile" element={<CounselorDashboard />} />
          <Route path="/counselor/edit-profile" element={<CounselorEditProfile />} />

          {/* Admin */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />

          {/* User Services */}
          <Route path="/services" element={<UserServices />} />

          {/* Counselling */}
          <Route path="/counselling" element={<BookingPage />} />
          <Route path="/counselling/newbooking" element={<NewBooking />} />
          <Route path="/counselling/payment" element={<Payment />} />

          {/* IT Learning Resources */}
          <Route path="/learning-resources" element={<ITLearningResources />} />
          <Route path="/learning-resources/:id" element={<ResourceDetails />} />



             <Route path="/progress-dashboard" element={<ProgressDashboard />} />
            <Route path="/jobs" element={<JobsPortal />} />
            <Route path="/jobs/apply/:id" element={<JobApply />} />
            <Route path="/applications" element={<MyApplications />} />

            <Route path="/admin/add-job" element={<AddJob />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
