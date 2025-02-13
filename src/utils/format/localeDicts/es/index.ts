import { auth } from "./auth";
import { navItems } from "./navItems";
import { home } from "./home";
import { products } from "./products";
import { validation } from "./validation";

export const es = {
  ...auth,
  ...navItems,
  ...home,
  ...products,
  ...validation,
  "Field is required.": "Este campo es requirido.",
  // Add more translations as needed
};
