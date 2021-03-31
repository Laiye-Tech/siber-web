import React from 'react';
import { RouteProps } from 'react-router-dom';
import styles from './index.less';

export const SimpleLayout = ({ children }: RouteProps) => {
  return <div className={styles.container}>{children}</div>;
};
