import { home } from "./home";
import { auth } from "./auth";
import { lots } from "./lots";
import { stock } from "./stock";
import { places } from "./places";
import { entries } from "./entries";
import { navItems } from "./navItems";
import { products } from "./products";
import { dispatches } from "./dispatches";
import { validation } from "./validation";
import { transporters } from "./transporters";
import { historicMovements } from "./historicMovements";

export const es = {
  ...home,
  ...auth,
  ...lots,
  ...stock,
  ...places,
  ...entries,
  ...navItems,
  ...products,
  ...dispatches,
  ...validation,
  ...transporters,
  ...historicMovements,
  "Field is required.": "Este campo es requirido.",
};
