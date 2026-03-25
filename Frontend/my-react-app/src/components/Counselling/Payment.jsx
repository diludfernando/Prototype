import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock } from 'lucide-react';
import './Payment.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const sessionId = location.state?.sessionId;

    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'cardNumber') {
            const cleaned = value.replace(/\D/g, '').slice(0, 16);
            setFormData((prev) => ({ ...prev, [name]: cleaned }));
            return;
        }

        if (name === 'cvv') {
            const cleaned = value.replace(/\D/g, '').slice(0, 3);
            setFormData((prev) => ({ ...prev, [name]: cleaned }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateClient = () => {
        const errors = {};

        const cardDigits = formData.cardNumber.replace(/\s+/g, '');
        if (!/^\d{16}$/.test(cardDigits)) {
            errors.cardNumber = 'Card number must be exactly 16 digits.';
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
            errors.expiry = 'Expiry must be in MM/YY format.';
        }

        if (!/^\d{3}$/.test(formData.cvv)) {
            errors.cvv = 'CVV must be exactly 3 digits.';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (!sessionId) {
            setError('No session identified for payment. Please go back and book a session.');
            return;
        }

        const clientErrors = validateClient();
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            return;
        }

        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`http://localhost:8083/api/counselling/pay/${sessionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate('/counselling');
                return;
            }

            const data = await response.json().catch(() => null);
            if (data && typeof data === 'object') {
                if ('message' in data && Object.keys(data).length === 1) {
                    setError(String(data.message));
                    return;
                }
                setFieldErrors(data);
                return;
            }

            setError('Payment failed. Please try again.');
        } catch (error) {
            setError('Payment failed due to a network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-container">
            <div className="container">
                <header className="checkout-header">
                    <h1>Secure Checkout</h1>
                    <p className="sub-header">Academic Simulation Gateway</p>
                </header>

                <div className="payment-card">
                    <section className="session-info">
                        <p>Session ID#{sessionId || 'N/A'}</p>
                        <p>Service: <strong>Premium IT Career Counselling</strong></p>
                        <p>Total Amount: <span className="amount-highlight">LKR 100.00</span></p>
                    </section>

                    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label>Card Number</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleChange}
                                    placeholder="1234567812345678"
                                    maxLength="16"
                                    inputMode="numeric"
                                    autoComplete="cc-number"
                                    required
                                />
                                <CreditCard size={18} className="input-icon" />
                            </div>
                            {fieldErrors.cardNumber && <p className="field-error">{fieldErrors.cardNumber}</p>}
                        </div>

                        <div className="row">
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input
                                    type="text"
                                    name="expiry"
                                    value={formData.expiry}
                                    onChange={handleChange}
                                    placeholder="MM/YY"
                                    autoComplete="cc-exp"
                                    required
                                />
                                {fieldErrors.expiry && <p className="field-error">{fieldErrors.expiry}</p>}
                            </div>

                            <div className="form-group">
                                <label>CVV</label>
                                <div className="input-wrapper">
                                    <input
                                        type="password"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleChange}
                                        placeholder="123"
                                        maxLength="3"
                                        inputMode="numeric"
                                        autoComplete="cc-csc"
                                        required
                                    />
                                    <Lock size={18} className="input-icon" />
                                </div>
                                {fieldErrors.cvv && <p className="field-error">{fieldErrors.cvv}</p>}
                            </div>
                        </div>

                        {error && <p className="form-error">{error}</p>}

                        <button type="submit" className="pay-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : 'Pay LKR 100.00'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;