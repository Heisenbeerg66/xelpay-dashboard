import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ মডার্ন এবং ফিক্সড ইমপোর্ট স্টাইল
import { toast } from 'sonner';

export const downloadInvoice = (order: any, merchant: any) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue 600
    doc.text("XelPay Invoice", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Automated Billing System", 14, 26);
    
    // Invoice Details
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Invoice No: ${order.order_no || 'N/A'}`, 140, 20);
    doc.text(`Date: ${order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB') : 'N/A'}`, 140, 26);
    doc.text(`Status: ${order.status ? order.status.toUpperCase() : 'N/A'}`, 140, 32);

    // Billed To
    doc.setFontSize(12);
    doc.text("Billed To:", 14, 45);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Merchant ID: ${order.merchant_id || 'N/A'}`, 14, 52);
    
    if (merchant?.business_name) {
      doc.text(`Business: ${merchant.business_name}`, 14, 58);
    }
    if (merchant?.email) {
      doc.text(`Email: ${merchant.email}`, 14, 64);
    }

    // Table Data
    const tableData = [
      [
        "Subscription Plan", 
        order.billing_cycle === 'yearly' ? 'Annual' : 'Monthly',
        order.payment_method ? order.payment_method.toUpperCase() : 'N/A',
        order.payment_reference || 'N/A',
        `${order.amount || 0} BDT`
      ]
    ];

    // ✅ সঠিকভাবে autoTable কল করা
    autoTable(doc, {
      startY: 75,
      head: [['Description', 'Cycle', 'Method', 'TrxID', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || 100;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for using XelPay services.", 14, finalY + 20);

    // Download PDF
    doc.save(`Invoice_${order.order_no || 'Document'}.pdf`);
    toast.success("Invoice downloaded successfully!");
    
  } catch (err) {
    console.error("PDF Generation Error: ", err); // কন্সোলে আসল এরর দেখাবে
    toast.error("Failed to generate PDF. Something went wrong.");
  }
};