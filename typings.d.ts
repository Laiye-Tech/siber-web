declare module '*.css';
declare module '*.less';
declare module '*.png';

type Config = {
  env: {
    port: string;
    apiHost: {
      http: string;
      grpc: string;
    };
    mode: string;
  };
};

type RouteItem = {
  path: string;
  component: string;
  title: string;
  icon?: string;
  routes?: RouteItem[];
};

interface Window {
  config: Config;
  g_routes: RouteItem[];
}
