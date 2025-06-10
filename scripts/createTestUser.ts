const url =
  "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key";
export const email = "admin@gmail.com";
export const password = "123456";

fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, returnSecureToken: true }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.error) {
      console.error("Error creating user:", data.error);
    } else {
      console.log("Test user created:", data.email);
    }
  })
  .catch(console.error);
