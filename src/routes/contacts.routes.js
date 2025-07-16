import { Router } from "express";
import { createContactSchema } from "../validators/contacts.validator.js";
import { identifyContact } from "../controllers/contacts.controller.js";
import { validate } from "../middleware/contacts.middleware.js";

const router = Router();

router.post("/", validate(createContactSchema), identifyContact);

export default router;