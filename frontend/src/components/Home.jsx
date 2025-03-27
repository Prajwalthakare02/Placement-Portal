import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import ChatBot from './ChatBot'
import PlacementPrediction from './PlacementPrediction'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, []);
  
  return (
    <div>
      <Navbar />
      <HeroSection />
      
      {/* Add Placement Prediction section for students only */}
      {user && user.userType === 'student' && (
        <div id="placement-prediction" className="max-w-7xl mx-auto px-4 py-10 bg-gray-50">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Placement Potential</h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Our AI-powered prediction model analyzes your profile and provides personalized insights 
            to maximize your placement chances.
          </p>
          <div className="max-w-4xl mx-auto">
            <PlacementPrediction />
          </div>
        </div>
      )}
      
      <CategoryCarousel />
      <LatestJobs />
      <Footer />
      <ChatBot />
    </div>
  )
}

export default Home