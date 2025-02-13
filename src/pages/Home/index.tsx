import { Page } from "shared/Layout";
import { InternalErrorResult } from "shared/Result";
import { useRouteError } from "shared/Router";
import {
  HeroSection,
  FeatureSection,
  PricingSection,
} from "modules/marketing/presentation";
import { t } from "utils";

interface IProps {}

const HomePage = ({}: IProps) => {
  return (
    <Page maxW="container.xl" spacing={{ base: 8, lg: 20 }}>
      <HeroSection
        title={t("Welcome to StockFlow")}
        subtitle={t(
          "The ultimate Warehouse Management System for your business"
        )}
        description={t(
          "Manage your inventory, track shipments, and optimize your warehouse operations with StockFlow SaaS multi-tenant app."
        )}
      />
      <FeatureSection
        features={[
          {
            title: t("Inventory Management"),
            description: t("Keep track of your stock levels in real-time."),
          },
          {
            title: t("Order Fulfillment"),
            description: t("Streamline your order processing and shipping."),
          },
          {
            title: t("Analytics & Reporting"),
            description: t("Gain insights into your warehouse operations."),
          },
        ]}
      />
      <PricingSection
        plans={[
          {
            name: t("Basic"),
            price: t("$29/month"),
            features: [t("Feature 1"), t("Feature 2")],
          },
          {
            name: t("Pro"),
            price: t("$59/month"),
            features: [t("Feature 1"), t("Feature 2"), t("Feature 3")],
          },
          {
            name: t("Enterprise"),
            price: t("Contact us"),
            features: [
              t("Feature 1"),
              t("Feature 2"),
              t("Feature 3"),
              t("Feature 4"),
            ],
          },
        ]}
      />
    </Page>
  );
};

export const Component = HomePage;

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (error.status === 404) {
    return <HomePage />;
  }

  return <InternalErrorResult />;
};
