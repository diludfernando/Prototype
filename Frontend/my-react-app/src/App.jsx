import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Homepage/Hero';
import Features from './components/Homepage/Features';
import Footer from './components/Footer';
import LevelSelection from './components/Skill Assessment/LevelSelection';
import BeginnerQuiz from './components/Skill Assessment/BeginnerQuiz';
import IntermediateQuiz from './components/Skill Assessment/IntermediateQuiz';
import AdvancedQuiz from './components/Skill Assessment/AdvancedQuiz';
import Login from './components/User_Management/Login';
import Register from './components/User_Management/Register';
import CompleteProfile from './components/User_Management/CompleteProfile';
import ViewProfile from './components/User_Management/ViewProfile';
import EditProfile from './components/User_Management/EditProfile';
import Dashboard from './components/Admin/Dashboard';
import UserManagement from './components/Admin/UserManagement';
import UserServices from './components/User/UserServices';
import BookingPage from './components/Counselling/BookingPage';
import NewBooking from './components/Counselling/NewBooking';
import Payment from './components/Counselling/Payment';
import ITLearningResources from './components/IT Learning Resources/ITLearningResources';
import ResourceDetails from './components/IT Learning Resources/ResourceDetails';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
            </>
          } />
          <Route path="/assessment" element={<LevelSelection />} />
          <Route path="/assessment/beginner" element={<BeginnerQuiz />} />
          <Route path='/assessment/intermediate' element={<IntermediateQuiz />} />
          <Route path="/assessment/advanced" element={<AdvancedQuiz />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/view-profile" element={<ViewProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/services" element={<UserServices />} />
          <Route path="/counselling" element={<BookingPage />} />
          <Route path="/counselling/newbooking" element={<NewBooking />} />
          <Route path="/counselling/payment" element={<Payment />} />
          <Route path="/learning-resources" element={<ITLearningResources />} />
          <Route path="/learning-resources/:id" element={<ResourceDetails />} />

        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
