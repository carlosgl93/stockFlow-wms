import { ErrorPageStrategy } from "shared/Result";

const DispatchesPage = () => {
  return (
    <div>
      <h1>Dispatches Page</h1>
      {/* Add your page content here */}
    </div>
  );
};

export const Component = DispatchesPage;

export const ErrorBoundary = ErrorPageStrategy;
