import dailySummaryService from "../services/dailySummary.service.js";

const dailySummaryController = async (req, res) => {
  const currentDate = req.query.date || new Date().toISOString().slice(0, 10);
  const result = await dailySummaryService(req.params.budgetId, currentDate);

  res.status(result.statusCode).json(result.data);
};

export default dailySummaryController;
