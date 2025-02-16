import { auth } from "./auth";
import { navItems } from "./navItems";
import { home } from "./home";
import { products } from "./products";
import { validation } from "./validation";
import { lots } from "./lots";
import { stock } from "./stock";
import { entries } from "./entries";

export const es = {
  ...auth,
  ...navItems,
  ...home,
  ...lots,
  ...products,
  ...stock,
  ...entries,
  ...validation,
  "Field is required.": "Este campo es requirido.",
  // Add more translations as needed
};
