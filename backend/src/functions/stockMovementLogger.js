const StockMovement = require("../models/StockMovement");

const logStockMovement = async (productId, productName, movementType, quantity, reason, relatedOrderId, previousStock, currentStock, notes = "") => {
  try {
    const movement = new StockMovement({
      productId,
      productName,
      movementType,
      quantity,
      reason,
      relatedOrderId,
      previousStock,
      currentStock,
      notes,
    });
    await movement.save();
    return movement;
  } catch (error) {
    console.error("Error logging stock movement:", error);
    throw error;
  }
};

module.exports = { logStockMovement };
