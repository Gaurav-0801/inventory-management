"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProductController_1 = require("../controllers/ProductController");
const router = (0, express_1.Router)();
router.get("/", ProductController_1.getProducts);
router.post("/", ProductController_1.createProduct);
exports.default = router;
