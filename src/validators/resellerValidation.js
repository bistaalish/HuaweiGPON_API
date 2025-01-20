const Joi = require('joi');

// Define the validation schema for resellers
const resellerSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            'string.base': 'Name should be a type of string',
            'string.empty': 'Name cannot be an empty field',
            'string.min': 'Name should have a minimum length of {#limit}',
            'string.max': 'Name should have a maximum length of {#limit}',
            'any.required': 'Name is a required field',
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email should be a type of string',
            'string.empty': 'Email cannot be an empty field',
            'string.email': 'Email must be a valid email',
            'any.required': 'Email is a required field',
        }),
    phone: Joi.string()
        .pattern(/^[0-9]+$/)
        .min(10)
        .max(15)
        .required()
        .messages({
            'string.base': 'Phone should be a type of string',
            'string.empty': 'Phone cannot be an empty field',
            'string.pattern.base': 'Phone must contain only numbers',
            'string.min': 'Phone should have a minimum length of {#limit}',
            'string.max': 'Phone should have a maximum length of {#limit}',
            'any.required': 'Phone is a required field',
        }),
    address: Joi.string()
        .optional()
        .allow('')
        .messages({
            'string.base': 'Address should be a type of string',
        }),
});

module.exports = {
    resellerSchema,
};