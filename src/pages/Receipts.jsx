import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import html2pdf from 'html2pdf.js'
import Card from '../components/Card'
import Table from '../components/Table'
import Button from '../components/Button'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'
import { getMyDonations, getAllDonationsAdmin } from '../api/donationApi'

const Receipts = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin())
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'

  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReceipts()
  }, [isAdmin])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      let data;
      if (isAdmin) {
        // Admin sees all receipts (verified donations)
        data = await getAllDonationsAdmin({ status: 'Verified' })
      } else {
        // User sees their verified donations
        data = await getMyDonations()
      }

      const rawList = Array.isArray(data) ? data : (data.donations || [])

      // Strictly filter for Verified only (double check for users)
      const verifiedList = rawList.filter(d => d.status === 'Verified')

      setReceipts(verifiedList)
    } catch (err) {
      console.error("Failed to fetch receipts", err)
      toast.error("Failed to load receipts")
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const generateReceiptHTML = (donation) => {
    const date = new Date(donation.createdAt || donation.date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const amount = formatAmount(donation.amount);
    const donor = donation.user?.name || donation.donorName || 'Anonymous';
    const campaign = donation.campaignId?.title || donation.campaign || 'General Donation';
    const id = donation._id || donation.id;

    return `
        <html>
        <head>
          <title>Donation Receipt</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background: #f9f9f9; }
            .receipt-container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4CAF50; margin-bottom: 10px; }
            .title { font-size: 18px; color: #333; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .details { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .details td { padding: 12px 0; border-bottom: 1px solid #eee; color: #555; }
            .details td:last-child { text-align: right; font-weight: 600; color: #333; }
            .amount-row td { font-size: 18px; color: #4CAF50; border-top: 2px solid #eee; border-bottom: 2px solid #eee; padding: 20px 0; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 40px; line-height: 1.5; }
            .verified-badge { display: inline-block; background: #E8F5E9; color: #2E7D32; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="logo">DonationHub</div>
              <div class="title">Official Donation Receipt</div>
              <div class="verified-badge">✓ VERIFIED DONATION</div>
            </div>
            <table class="details">
              <tr><td>Receipt ID</td><td>#${id.slice(-8).toUpperCase()}</td></tr>
              <tr><td>Date & Time</td><td>${date}</td></tr>
              <tr><td>Donor Name</td><td>${donor}</td></tr>
              <tr><td>Campaign</td><td>${campaign}</td></tr>
              <tr><td>Payment Method</td><td>${donation.paymentMethod || donation.payment || 'N/A'}</td></tr>
              <tr class="amount-row"><td>Total Amount</td><td>${amount}</td></tr>
            </table>
            <div class="footer">
              <p>Thank you for your generous support!</p>
              <p>This is a computer-generated receipt and requires no signature.</p>
              <p>${new Date().getFullYear()} © DonationHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }

  const handlePrint = (donation) => {
    const content = generateReceiptHTML(donation);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      toast.error("Please allow popups to print receipt");
    }
  }

  const handleDownloadPDF = (donation) => {
    const id = donation._id || donation.id;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generateReceiptHTML(donation);
    const container = tempDiv.querySelector('.receipt-container');

    const opt = {
      margin: 10,
      filename: `receipt-${id.slice(-6)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    toast.info("Generating PDF...")
    html2pdf().from(container).set(opt).save().catch(err => {
      console.error("PDF Generation Error", err);
      toast.error("Failed to generate PDF");
    });
  }

  const tableHeaders = isAdmin
    ? ['Date', 'Donor', 'Campaign', 'Amount', 'Payment', 'Status', 'Action']
    : ['Date', 'Campaign', 'Amount', 'Payment', 'Status', 'Action']

  const renderReceiptRow = (donation, index) => {
    // Safe formatting
    const dateObj = new Date(donation.createdAt || donation.date)
    const date = isNaN(dateObj.getTime())
      ? 'Invalid Date'
      : dateObj.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

    const donorName = donation.user?.name || donation.donorName || 'Anonymous'
    const campaignTitle = donation.campaignId?.title || donation.campaign || 'General'
    const id = donation._id || donation.id

    return (
      <tr key={id || index} className={`transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{date}</td>
        {isAdmin && (
          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{donorName}</td>
        )}
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{campaignTitle}</td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{formatAmount(donation.amount)}</td>
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{donation.paymentMethod || donation.payment}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            {donation.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handlePrint(donation)}
            >
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadPDF(donation)}
            >
              PDF
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  if (loading) return <div className={`p-6 text-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Loading receipts...</div>

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Receipts
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              View and download receipts for your verified donations.
            </p>
          </div>
        </div>

        <Table
          headers={tableHeaders}
          data={receipts}
          renderRow={renderReceiptRow}
          emptyMessage="No verified receipts available"
        />
      </Card>
    </div>
  )
}

export default Receipts
