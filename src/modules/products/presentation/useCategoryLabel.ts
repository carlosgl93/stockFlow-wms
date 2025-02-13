import { t } from "utils";

import { Category } from "../types";

export const useCategoryLabel = (category: Category) => {
  const message = messages[category];

  return (t(message) as string) ?? category;
};

const messages = {
  [Category.Acaricide]: "Acaricide",
  [Category.SoilConditioner]: "Soil Conditioner",
  [Category.SolarBlockerApple]: "Solar Blocker Apple",
  [Category.AntitranspirantAdjuvant]: "Antitranspirant Adjuvant",
  [Category.Detergent]: "Detergent",
  [Category.Containers]: "Containers",
  [Category.Fertilizer]: "Fertilizer",
  [Category.Filter]: "Filter",
  [Category.Fungicide]: "Fungicide",
  [Category.Herbicide]: "Herbicide",
  [Category.Herbicide2]: "Herbicide2",
  [Category.Inoculant]: "Inoculant",
  [Category.InsecticideAcaricide]: "Insecticide Acaricide",
  [Category.Nematicide]: "Nematicide",
  [Category.PaceInternational]: "Pace International",
  [Category.OrganicCoating]: "Organic Coating",
  [Category.GrowthRegulator]: "Growth Regulator",
};
