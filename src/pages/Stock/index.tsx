import { ErrorPageStrategy } from "shared/Result";

const StockPage = () => {
  return (
    <div>
      <h1>Stock Page</h1>
      {/* Add your page content here */}
    </div>
  );
};

export const Component = StockPage;

export const ErrorBoundary = ErrorPageStrategy;
