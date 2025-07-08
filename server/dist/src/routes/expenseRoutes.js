"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExpenseController_1 = require("../controllers/ExpenseController");
const router = (0, express_1.Router)();
router.get("/", ExpenseController_1.getExpensesByCategory);
exports.default = router;
