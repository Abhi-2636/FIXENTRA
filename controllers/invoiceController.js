const PDFDocument = require('pdfkit');
const { supabaseAdmin } = require('../config/supabase');

exports.generateInvoice = async (req, res) => {
    try {
        const { data: booking, error } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                user:users!bookings_user_id_fkey(id, name, email, address),
                service:services(id, name, price)
            `)
            .eq('id', req.params.bookingId)
            .single();

        if (error || !booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'completed') return res.status(400).json({ message: 'Invoice only available for completed bookings' });

        const doc = new PDFDocument({ margin: 50 });

        // Serve as PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${booking.id}.pdf`);
        doc.pipe(res);

        // Add company info
        doc.fontSize(25).font('Helvetica-Bold').text('Fixentra.', 50, 50);
        doc.fontSize(10).font('Helvetica').text('Boring Road', 50, 80);
        doc.text('Patna, Bihar', 50, 95);

        // Add invoice details
        doc.fontSize(20).text('INVOICE', 450, 50, { align: 'right' });
        doc.fontSize(10).text(`Invoice #: INV-${booking.id.substring(0, 6).toUpperCase()}`, 450, 80, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 450, 95, { align: 'right' });

        doc.moveDown(3);

        // Bill to
        doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
        doc.font('Helvetica').fontSize(10);
        doc.text(booking.user.name);
        doc.text(booking.user.email);
        doc.text(booking.address);

        doc.moveDown(2);

        // Table Header
        const tableTop = 250;
        doc.font('Helvetica-Bold');
        doc.text('Service Description', 50, tableTop);
        doc.text('Amount', 450, tableTop, { align: 'right' });

        // Divider
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Rows
        doc.font('Helvetica');
        let rowTop = tableTop + 30;
        doc.text(booking.service.name, 50, rowTop);
        doc.text(`Rs. ${Number(booking.service.price).toLocaleString()}`, 450, rowTop, { align: 'right' });

        // Calculations
        const subtotal = Number(booking.service.price);
        const tax = subtotal * 0.18; // 18% GST mock
        const total = subtotal + tax;

        // Divider
        doc.moveTo(350, rowTop + 30).lineTo(550, rowTop + 30).stroke();

        // Totals
        rowTop += 50;
        doc.text('Subtotal:', 350, rowTop);
        doc.text(`Rs. ${subtotal.toLocaleString()}`, 450, rowTop, { align: 'right' });

        rowTop += 20;
        doc.text('Taxes (18% GST):', 350, rowTop);
        doc.text(`Rs. ${tax.toLocaleString()}`, 450, rowTop, { align: 'right' });

        rowTop += 25;
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('Total:', 350, rowTop);
        doc.text(`Rs. ${total.toLocaleString()}`, 450, rowTop, { align: 'right' });

        // Footer Statement
        doc.moveDown(5);
        doc.font('Helvetica-Oblique').fontSize(10).text(
            'Thank you for trusting Fixentra! We offer a 30-day rework guarantee on this service.',
            50, 600, { align: 'center' }
        );

        doc.end();
    } catch (err) {
        if (!res.headersSent) res.status(500).json({ status: 'error', message: err.message });
    }
};
