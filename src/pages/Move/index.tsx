import { ErrorPageStrategy } from "shared/Result";

const MovePage = () => {
  return (
    <div>
      <h1>Move Page</h1>
      {/* Add your page content here */}
    </div>
  );
};

export const Component = MovePage;

export const ErrorBoundary = ErrorPageStrategy;
