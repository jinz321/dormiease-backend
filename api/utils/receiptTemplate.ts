/**
 * Generate HTML receipt template for payment
 */
export function generateReceiptHTML(data: {
    receiptNumber: string;
    paymentId: string;
    transactionId: string;
    studentName: string;
    studentId: string;
    email?: string;
    feeType: string;
    amount: number;
    paymentMethod: string;
    paidDate: string;
    dueDate: string;
    hostelName?: string;
    roomName?: string;
}): string {
    const currentDate = new Date().toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${data.receiptNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .university-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 1px;
        }
        
        .campus-name {
            font-size: 18px;
            opacity: 0.95;
            margin-bottom: 20px;
        }
        
        .receipt-title {
            font-size: 24px;
            font-weight: 600;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid rgba(255,255,255,0.3);
        }
        
        .receipt-body {
            padding: 40px 30px;
        }
        
        .receipt-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 30px;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .info-group {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
        }
        
        .info-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .info-value {
            font-size: 16px;
            color: #333;
            font-weight: 500;
        }
        
        .payment-details {
            margin: 30px 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .details-table tr {
            border-bottom: 1px solid #e0e0e0;
        }
        
        .details-table tr:last-child {
            border-bottom: none;
        }
        
        .details-table td {
            padding: 15px 10px;
        }
        
        .details-table td:first-child {
            color: #666;
            font-weight: 500;
            width: 40%;
        }
        
        .details-table td:last-child {
            color: #333;
            font-weight: 600;
            text-align: right;
        }
        
        .amount-row {
            background: #f8f9fa;
            font-size: 18px;
        }
        
        .amount-row td {
            padding: 20px 10px;
            color: #667eea;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            background: #10b981;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
        }
        
        .footer-note {
            font-size: 13px;
            color: #666;
            margin-bottom: 10px;
            line-height: 1.8;
        }
        
        .contact-info {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .contact-info p {
            font-size: 13px;
            color: #666;
            margin: 5px 0;
        }
        
        .watermark {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 14px;
            font-weight: 600;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .receipt-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            @page {
                margin: 1cm;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="university-name">UNIVERSITI KUALA LUMPUR</div>
            <div class="campus-name">Malaysian Institute of Information Technology (MIIT)</div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>
        
        <div class="receipt-body">
            <div class="receipt-info">
                <div class="info-group">
                    <div class="info-label">Receipt Number</div>
                    <div class="info-value">${data.receiptNumber}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Receipt Date</div>
                    <div class="info-value">${currentDate}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Transaction ID</div>
                    <div class="info-value">${data.transactionId}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Payment Status</div>
                    <div class="info-value"><span class="status-badge">PAID</span></div>
                </div>
            </div>
            
            <div class="payment-details">
                <h2 class="section-title">Student Information</h2>
                <table class="details-table">
                    <tr>
                        <td>Student Name</td>
                        <td>${data.studentName}</td>
                    </tr>
                    <tr>
                        <td>Student ID</td>
                        <td>${data.studentId}</td>
                    </tr>
                    ${data.email ? `
                    <tr>
                        <td>Email</td>
                        <td>${data.email}</td>
                    </tr>
                    ` : ''}
                    ${data.hostelName ? `
                    <tr>
                        <td>Hostel</td>
                        <td>${data.hostelName}</td>
                    </tr>
                    ` : ''}
                    ${data.roomName ? `
                    <tr>
                        <td>Room</td>
                        <td>${data.roomName}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>
            
            <div class="payment-details">
                <h2 class="section-title">Payment Details</h2>
                <table class="details-table">
                    <tr>
                        <td>Fee Type</td>
                        <td>${data.feeType.replace(/_/g, ' ').toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td>Payment Method</td>
                        <td>${data.paymentMethod.replace(/_/g, ' ').toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td>Due Date</td>
                        <td>${new Date(data.dueDate).toLocaleDateString('en-MY')}</td>
                    </tr>
                    <tr>
                        <td>Payment Date</td>
                        <td>${new Date(data.paidDate).toLocaleDateString('en-MY')}</td>
                    </tr>
                    <tr class="amount-row">
                        <td><strong>TOTAL AMOUNT PAID</strong></td>
                        <td><strong>RM ${data.amount.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
            
            <div class="footer">
                <p class="footer-note">
                    This is an official receipt generated by the DormiEase Hostel Management System.<br>
                    This receipt is valid without signature as it is computer-generated.
                </p>
                
                <div class="contact-info">
                    <p><strong>Hostel Office Contact</strong></p>
                    <p>📞 +603-2175 4000 | ✉️ hostel@unikl.edu.my</p>
                    <p>Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
                </div>
            </div>
        </div>
        
        <div class="watermark">
            DormiEase - Hostel Management System
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Generate receipt number in format: RCP-YYYYMMDD-XXXXX
 */
export function generateReceiptNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();

    return `RCP-${year}${month}${day}-${random}`;
}
