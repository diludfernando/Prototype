import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Clock, Check, ChevronLeft } from 'lucide-react';
import './NewBooking.css';

const NewBooking = () => {
    const navigate = useNavigate();
    const [eligibility, setEligibility] = useState({
        firstTime: true,
        fiveCourses: false,
        passedHardTest: false
    });

    const isEligible = eligibility.firstTime || eligibility.fiveCourses || eligibility.passedHardTest;

    const handleCheckboxChange = (key) => {
        setEligibility(prev => {
            const isCurrentlyChecked = prev[key];
            return {
                firstTime: key === 'firstTime' ? !isCurrentlyChecked : false,
                fiveCourses: key === 'fiveCourses' ? !isCurrentlyChecked : false,
                passedHardTest: key === 'passedHardTest' ? !isCurrentlyChecked : false
            };
        });
    };

    const [formData, setFormData] = useState({
        counsellorId: 1,
        sessionDate: '',
        timeSlot: '09:00 AM'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            studentId: 1, // Simulated current user ID
            isFree: isEligible,
            status: 'BOOKED'
        };

        try {
            const response = await fetch('http://localhost:8083/api/counselling/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const session = await response.json();
                if (isEligible) {
                    navigate('/counselling');
                } else {
                    navigate('/counselling/payment', { state: { sessionId: session.id } });
                }
            } else {
                alert("Failed to book session. Please try again.");
            }
        } catch (error) {
            console.error("Booking error:", error);
        }
    };

    return (
        <div className="new-booking-container">
            <div className="container">
                <button className="back-btn" onClick={() => navigate('/counselling')}>
                    <ChevronLeft size={20} />
                    <span>Back</span>
                </button>

                <header className="new-booking-header">
                    <h1>Book a Session</h1>
                    <p>Schedule your 1-on-1 IT career counselling</p>
                </header>

                <div className="booking-form-card">
                    <section className="eligibility-section">
                        <h3>Free Session Eligibility Status (Simulation)</h3>
                        <div className="eligibility-grid">
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={eligibility.firstTime}
                                    onChange={() => handleCheckboxChange('firstTime')}
                                />
                                <span className="checkbox-custom">
                                    {eligibility.firstTime && <Check size={14} />}
                                </span>
                                <span>1st Time User</span>
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={eligibility.fiveCourses}
                                    onChange={() => handleCheckboxChange('fiveCourses')}
                                />
                                <span className="checkbox-custom">
                                    {eligibility.fiveCourses && <Check size={14} />}
                                </span>
                                <span>5+ Courses</span>
                            </label>
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={eligibility.passedHardTest}
                                    onChange={() => handleCheckboxChange('passedHardTest')}
                                />
                                <span className="checkbox-custom">
                                    {eligibility.passedHardTest && <Check size={14} />}
                                </span>
                                <span>Passed Hard Test</span>
                            </label>
                        </div>
                        <div className="status-display">
                            <span>Current Status:</span>
                            <span className={`status-badge ${isEligible ? 'eligible' : 'not-eligible'}`}>
                                {isEligible ? 'ELIGIBLE FOR FREE SESSION' : 'Have to Pay for SESSION'}
                            </span>
                        </div>
                    </section>

                    <form className="booking-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Select Counsellor</label>
                            <div className="select-wrapper">
                                <select name="counsellorId" value={formData.counsellorId} onChange={handleChange}>
                                    <option value="1">Dr. Alan Turing - AI Specialist</option>
                                    <option value="2">Ada Lovelace - Logic Specialist</option>
                                    <option value="3">Grace Hopper - Systems Specialist</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select Date</label>
                            <div className="input-wrapper">
                                <input type="date" name="sessionDate" value={formData.sessionDate} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select Time Slot</label>
                            <div className="select-wrapper">
                                <select name="timeSlot" value={formData.timeSlot} onChange={handleChange}>
                                    <option>09:00 AM</option>
                                    <option>10:00 AM</option>
                                    <option>11:00 AM</option>
                                    <option>02:00 PM</option>
                                    <option>03:00 PM</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="confirm-btn">
                            {isEligible ? 'Confirm Free Booking' : 'Confirm & Proceed to Payment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewBooking;
