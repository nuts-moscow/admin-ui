import { FC } from "react";
import { WithChildren } from "@/core/utils/style/WithChildren";
import { Environment } from "@/core/states/environment/Environment";
import { EnvironmentProvider } from "@/core/states/environment/useEnvironment";
import { AuthProvider } from "@/core/states/auth/useAuth";
import { AuthGuard } from "@/app/AuthGuard/AuthGuard";

export interface BodyLayoutProps extends WithChildren {
  readonly environment: Environment;
}

export const BodyLayout: FC<BodyLayoutProps> = ({ children, environment }) => {
  return (
    <EnvironmentProvider environment={environment}>
      <AuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AuthProvider>
    </EnvironmentProvider>
  );
};
