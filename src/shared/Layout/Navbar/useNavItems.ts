import { useAuthStore } from "modules/auth/application";

import { INavItem } from "./INavItem";

export const useNavItems = () => {
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);

  return isAuthenticated ? NAV_ITEMS : NAV_ITEMS.slice(0, NAV_ITEMS.length - 1);
};

export const NAV_ITEMS: Array<INavItem> = [
  {
    label: "Products",
    children: [
      {
        label: "Manage your products",
        subLabel: "Create, edit, delete your products",
        href: "/products",
      },
      {
        label: "Entries",
        subLabel: "Add product entries",
        href: "/entries",
      },
      {
        label: "Dispatches",
        subLabel: "Add product dispatches",
        href: "/dispatches",
      },
    ],
  },
  {
    label: "Stock",
    children: [
      {
        label: "Products inventory",
        subLabel: "Check products stock / inventory",
        href: "/stock",
      },
      {
        label: "Products per lot",
        subLabel: "Check products location per lot",
        href: "/lot",
      },
      {
        label: "Move products",
        subLabel: "Rearrange products location",
        href: "/stock/move",
      },
    ],
  },
  {
    label: "Labeling",
    href: "/labeling",
  },
];
