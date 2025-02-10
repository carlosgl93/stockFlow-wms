import { ErrorPageStrategy } from "shared/Result";

const LabelingPage = () => {
  return (
    <div>
      <h1>Labeling Page</h1>
      {/* Add your page content here */}
    </div>
  );
};

export const Component = LabelingPage;

export const ErrorBoundary = ErrorPageStrategy;
