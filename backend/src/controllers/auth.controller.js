import bcrypt from "bcryptjs";
import crypto from "crypto";

import {
  deleteRefreshToken,
  findByEmail,
  findRefreshToken,
  findRefreshTokenByUserId,
  post_user,
  storeHashedRefreshToken,
  updateRefreshToken,
} from "../repositories/user.repository.js";
import { createAccessToken, hashRefreshToken } from "../utils/auth.utilty.js";
import { validEmail, validName, validPassword } from "../utils/vaildation.js";

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;

  if (!validName(name)) {
    res.status(400).json({ message: "Please provide a name" });
    return;
  }

  if (!validEmail(email)) {
    res.status(400).json({ message: "Please provide a email" });
    return;
  }

  if (!validPassword(password)) {
    res.status(400).json({ message: "Please provide a password" });
    return;
  }

  const findUser = await findByEmail(email);

  if (findUser !== undefined) {
    return res.status(409).json({ message: "User already exists" });
  }

  let hashedPassword = bcrypt.hashSync(password, 10);
  let user = await post_user(name, email, hashedPassword);

  res.status(201).json({ message: "user created successfully", data: user });
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  if (email.trim() === "" || email === null) {
    res.status(400).json({ message: "Please provide a email" });
    return;
  }

  if (password.trim() === "" || password === null) {
    res.status(400).json({ message: "Please provide a password" });
    return;
  }

  let getUserData = await findByEmail(email);

  if (getUserData === undefined) {
    res.status(404).json({
      message: "No data found connect to this email. please sign up.",
    });
  } else {
    let verifyPassword = bcrypt.compareSync(password, getUserData.password);

    if (verifyPassword) {
      let accessToken = createAccessToken(getUserData);

      let refreshToken = crypto.randomBytes(45).toString("hex");
      let _hashRefreshToken = hashRefreshToken(refreshToken);

      let data = await findRefreshTokenByUserId(getUserData.id);
      if (data === undefined) {
        await storeHashedRefreshToken(getUserData.id, _hashRefreshToken);
      } else {
        await updateRefreshToken(getUserData.user_id, _hashRefreshToken);
      }

      res.status(200).json({
        message: "sign in successful",
        data: { ...getUserData, accessToken, refreshToken },
      });
    } else {
      res.status(401).json({ message: "Incorrect pasword" });
    }
  }
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "refresh token is required" });
  }

  let result = await findRefreshToken(hashRefreshToken(refreshToken));

  if (result !== undefined) {
    let accessToken = createAccessToken({
      id: result.user_id,
      role: result.role,
    });

    res.status(200).json({ data: accessToken });
  } else {
    res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};

export const logout = async (req, res) => {
  const { refreshToken } = req.params;

  if (refreshToken) {
    await deleteRefreshToken(hashRefreshToken(refreshToken));
  }

  res.status(200).json({ message: "Logged out" });
};
