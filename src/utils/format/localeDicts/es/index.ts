import { auth } from "./auth";
import { navItems } from "./navItems";
import { home } from "./home";
import { products } from "./products";
import { validation } from "./validation";
import { lots } from "./lots";
import { stock } from "./stock";
import { entries } from "./entries";
import { transporters } from "./transporters";
import { places } from "./places";

export const es = {
  ...auth,
  ...navItems,
  ...home,
  ...lots,
  ...places,
  ...products,
  ...stock,
  ...entries,
  ...transporters,
  ...validation,

  "Field is required.": "Este campo es requirido.",
  // Add more translations as needed
};
