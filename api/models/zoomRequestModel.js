const mongoose = require("mongoose");
const Joi = require("joi");

const zoomRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  zoomLink: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Validation schema using Joi
const validateZoomRequest = (request) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    zoomLink: Joi.string().required()
  });
  return schema.validate(request);
};

const ZoomRequestModel = mongoose.model("requestPool", zoomRequestSchema);

module.exports = {
  ZoomRequestModel,
  validateZoomRequest
};
