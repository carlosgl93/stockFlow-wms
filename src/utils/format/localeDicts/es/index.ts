import { auth } from "./auth";
import { navItems } from "./navItems";
import { home } from "./home";
import { products } from "./products";
import { validation } from "./validation";
import { lots } from "./lots";

export const es = {
  ...auth,
  ...navItems,
  ...home,
  ...lots,
  ...products,
  ...validation,
  "Field is required.": "Este campo es requirido.",
  // Add more translations as needed
};
