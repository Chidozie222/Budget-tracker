import { createBudget } from "../services/budget.service.js";
import { GetUserById } from "../services/user.service.js";

export const create_Budget = async (req, res) => {
  const { name, income, end_date } = req.body;

  let checkIfUserExists = await GetUserById(req.user.userId);

  if (!checkIfUserExists) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  let result = await createBudget(req.user.userId, name, income, end_date);

  res.status(result.statusCode).json(result.data);
};
