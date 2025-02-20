import { withRequireAuth } from "modules/auth/application";
import { ErrorPageStrategy } from "shared/Result";

const LotPage = () => {
  return (
    <div>
      <h1>Lot Page</h1>
      {/* Add your page content here */}
    </div>
  );
};

export const Component = withRequireAuth(LotPage, { to: "/sign-in" });

export const ErrorBoundary = ErrorPageStrategy;
