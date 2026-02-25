import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import './Payment.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const sessionId = location.state?.sessionId;

    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiry: '',
        cvv: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sessionId) {
            alert("No session identified for payment.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8083/api/counselling/pay/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Payment Successful!");
                navigate('/counselling');
            } else {
                const errors = await response.json();
                alert("Payment failed: " + Object.values(errors).join(", "));
            }
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    return (
        <div className="checkout-container">
            <header className="checkout-header">
                <h1>Secure Checkout</h1>
                <p className="sub-header">Academic Simulation Gateway</p>
            </header>

            <section className="session-info">
                <p>Session ID#{sessionId || 'N/A'}</p>
                <p>Service: <strong>Premium IT Career Counselling</strong></p>
                <p>Total Amount: <span className="amount-highlight">LKR 100.00</span></p>
            </section>

            <form className="checkout-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" name="cardHolder" value={formData.cardHolder} onChange={handleChange} placeholder="John Doe" required />
                </div>

                <div className="form-group">
                    <label>Card Number</label>
                    <div className="input-wrapper">
                        <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234567812345678" maxLength="16" required />
                        <CreditCard size={18} className="input-icon" />
                    </div>
                </div>

                <div className="row">
                    <div className="form-group">
                        <label>Expiry Date</label>
                        <input type="text" name="expiry" value={formData.expiry} onChange={handleChange} placeholder="MM/YY" required />
                    </div>
                    <div className="form-group">
                        <label>CVV</label>
                        <div className="input-wrapper">
                            <input type="password" name="cvv" value={formData.cvv} onChange={handleChange} placeholder="123" maxLength="3" required />
                            <Lock size={18} className="input-icon" />
                        </div>
                    </div>
                </div>

                <button type="submit" className="pay-button">
                    Pay LKR 100.00
                </button>
            </form>

            <footer className="footer-note">
                <div className="validation-tag">
                    <ShieldCheck size={14} /> Strict Validation Enabled
                </div>
                <p>CVV is never stored. Only the last 4 digits of your card will be securely saved for reference.</p>
            </footer>
        </div>
    );
};

export default Checkout;