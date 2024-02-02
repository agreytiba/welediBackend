const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    pdfPath: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PdfModel = mongoose.model('Pdf', pdfSchema);

module.exports = PdfModel;
