export type MenuItem = {
  title: string;
  icon?: any;
  path?: string;
  subMenus?: MenuItem[];
};

export type NavbarProps = {
  collapsed: boolean;
};
