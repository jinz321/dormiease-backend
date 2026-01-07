import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ReceiptPage() {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (paymentId) {
            loadReceipt();
        }
    }, [paymentId]);

    const loadReceipt = async () => {
        try {
            setLoading(true);
            // Verify payment exists and is paid
            const response = await axios.get(`${API_BASE}/receipts/${paymentId}`);

            if (response.data) {
                // Receipt data is valid, load the HTML version in iframe
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Failed to load receipt:', err);
            setError(err.response?.data?.message || 'Failed to load receipt');
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const iframe = document.getElementById('receipt-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.print();
        }
    };

    const handleDownload = () => {
        window.open(`${API_BASE}/receipts/${paymentId}/download`, '_blank');
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading receipt...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.error}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} style={styles.button}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Back
                </button>
                <div style={styles.actions}>
                    <button onClick={handlePrint} style={styles.actionButton}>
                        🖨️ Print
                    </button>
                    <button onClick={handleDownload} style={styles.actionButton}>
                        ⬇️ Download
                    </button>
                </div>
            </div>

            <div style={styles.receiptContainer}>
                <iframe
                    id="receipt-iframe"
                    src={`${API_BASE}/receipts/${paymentId}/html`}
                    style={styles.iframe}
                    title="Payment Receipt"
                />
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '18px',
        color: '#666',
    },
    error: {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        maxWidth: '1200px',
        margin: '0 auto 20px auto',
    },
    backButton: {
        padding: '10px 20px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    actions: {
        display: 'flex',
        gap: '10px',
    },
    actionButton: {
        padding: '10px 20px',
        backgroundColor: 'white',
        color: '#333',
        border: '1px solid #ddd',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    button: {
        marginTop: '20px',
        padding: '10px 30px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
    },
    receiptContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    iframe: {
        width: '100%',
        minHeight: '800px',
        border: 'none',
    },
};
