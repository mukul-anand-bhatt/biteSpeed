import joi from "joi";

export const createContactSchema = joi.object({
    email: joi.string().email().allow(null, '').optional(),
    phoneNumber: joi.string().allow(null, '').optional(),
}).or('email', 'phoneNumber').messages({
    'object.missing': 'Either email or phoneNumber must be provided'
});