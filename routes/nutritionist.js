const express = require("express");
const router = express.Router();
const nutritionistController = require("../controllers/nutritionistController");

router.post("/", nutritionistController.createNutritionist);
router.get("/", nutritionistController.getNutritionists);
router.get("/:id", nutritionistController.getNutritionistById);
router.put("/:id", nutritionistController.updateNutritionist);
router.delete("/:id", nutritionistController.deleteNutritionist);

module.exports = router;
