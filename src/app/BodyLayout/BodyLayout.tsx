import { FC } from "react";
import { WithChildren } from "@/core/utils/style/WithChildren";
import { Environment } from "@/core/states/environment/Environment";
import { EnvironmentProvider } from "@/core/states/environment/useEnvironment";

export interface BodyLayoutProps extends WithChildren {
  readonly environment: Environment;
}

export const BodyLayout: FC<BodyLayoutProps> = ({ children, environment }) => {
  return (
    <EnvironmentProvider environment={environment}>
      {children}
    </EnvironmentProvider>
  );
};
