const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Nama lengkap wajib diisi",
  }),
  username: Joi.string().required().messages({
    "string.empty": "Username wajib diisi",
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    "string.empty": "Email wajib diisi",
    "string.email": "Format email tidak valid",
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{8,15}$/)
    .required()
    .messages({
      "string.empty": "Nomor telepon wajib diisi",
      "string.pattern.base": "Nomor telepon harus antara 8 hingga 15 digit",
    }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password wajib diisi",
    "string.min": "Password minimal 6 karakter",
  }),
});

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Email atau username wajib diisi",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password wajib diisi",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};