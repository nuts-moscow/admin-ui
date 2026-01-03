import { ReactNode } from 'react';

export interface WithChildren {
  readonly children?: ReactNode | ReactNode[] | string;
}
