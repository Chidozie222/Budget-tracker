import { useState } from "react";

const [userData, setUserData] = useState(null);
const [refreshToken, setRefreshToken] = useState("");
const [accessToken, setAccessToken] = useState("");

export {
  setUserData,
  refreshToken,
  setRefreshToken,
  accessToken,
  setAccessToken,
  userData,
};
