import { Page } from "shared/Layout";
import { InternalErrorResult } from "shared/Result";
import { useRouteError } from "shared/Router";

import {
  HeroSection,
  FeatureSection,
  PricingSection,
} from "modules/marketing/presentation";

interface IProps {}

const HomePage = ({}: IProps) => {
  return (
    <Page maxW="container.xl" spacing={{ base: 8, lg: 20 }}>
      <HeroSection
        title="Welcome to StockFlow"
        subtitle="The ultimate Warehouse Management System for your business"
        description="Manage your inventory, track shipments, and optimize your warehouse operations with StockFlow SaaS multi-tenant app."
      />
      <FeatureSection
        features={[
          {
            title: "Inventory Management",
            description: "Keep track of your stock levels in real-time.",
          },
          {
            title: "Order Fulfillment",
            description: "Streamline your order processing and shipping.",
          },
          {
            title: "Analytics & Reporting",
            description: "Gain insights into your warehouse operations.",
          },
        ]}
      />
      <PricingSection
        plans={[
          {
            name: "Basic",
            price: "$29/month",
            features: ["Feature 1", "Feature 2"],
          },
          {
            name: "Pro",
            price: "$59/month",
            features: ["Feature 1", "Feature 2", "Feature 3"],
          },
          {
            name: "Enterprise",
            price: "Contact us",
            features: ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
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
