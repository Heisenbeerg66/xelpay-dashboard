import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

export const downloadInvoice = (order: any, merchant: any) => {
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text("XelPay Invoice", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Automated Billing System", 14, 26);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Invoice No: ${order.order_no}`, 140, 20);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 26);
    doc.text(`Status: ${order.status.toUpperCase()}`, 140, 32);

    doc.setFontSize(12);
    doc.text("Billed To:", 14, 45);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(`Merchant ID: ${order.merchant_id}`, 14, 52);
    if (merchant?.business_name) doc.text(`Business: ${merchant.business_name}`, 14, 58);
    if (merchant?.email) doc.text(`Email: ${merchant.email}`, 14, 64);

    const tableData = [
      [
        "Subscription Plan", 
        order.billing_cycle === 'yearly' ? 'Annual' : 'Monthly',
        order.payment_method?.toUpperCase(),
        order.payment_reference,
        `${order.amount} BDT`
      ]
    ];

    (doc as any).autoTable({
      startY: 75,
      head: [['Description', 'Cycle', 'Method', 'TrxID', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10, cellPadding: 5 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for using XelPay services.", 14, finalY + 20);

    doc.save(`Invoice_${order.order_no}.pdf`);
    toast.success("Invoice downloaded successfully!");
  } catch (err) {
    toast.error("Failed to generate PDF. Make sure jspdf is installed.");
  }
};