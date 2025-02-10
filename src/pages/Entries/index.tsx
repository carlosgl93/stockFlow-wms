import { ErrorPageStrategy } from "shared/Result";

const EntriesPage = () => {
  return (
    <div>
      <h1>Entries Page</h1>
      {/* Add your page content here */}
    </div>
  );
};

export const Component = EntriesPage;

export const ErrorBoundary = ErrorPageStrategy;
