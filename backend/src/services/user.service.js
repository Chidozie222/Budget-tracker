import { findById } from "../repositories/user.repository.js";

export const GetUserById = async (userId) => {
  let data = await findById(userId);

  return data === undefined ? false : true;
};
