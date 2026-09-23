const BASE_URL = "http://192.168.206.44:4000/api/v1";

const signup = (name, email, password) => {
  console.log("HELLO");
  fetch(`${BASE_URL}/auth/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  })
    .then((res) => res.json())
    .then((data) => alert(data.message))
    .catch((error) => console.error("Error:", error));
};

export { signup };
