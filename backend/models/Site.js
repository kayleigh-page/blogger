const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  picture: {
    type: String,
    default: 'default-sitepic.jpg',
  },
}, { timestamps: true });

module.exports = mongoose.model('Site', SiteSchema);