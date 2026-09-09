import bcrypt from "bcryptjs";
import { post_user } from "../repositories/user.repository.js";

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  if (name.trim() === "" && name === null) {
    res.status(400).json({ message: "Please provide a name" });
  }

  if (email.trim() === "" && email === null) {
    res.status(400).json({ message: "Please provide a email" });
  }

  if (password.trim() === "" && password === null) {
    res.status(400).json({ message: "Please provide a password" });
  }

  let hashedPassword = await bcrypt.hashSync(password, 10);
  let user = await post_user(name, email, hashedPassword);

  res.status(201).json({ message: "user created successfully", data: user });
};
