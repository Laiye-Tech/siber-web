/*
 * @Author: xulijing
 * @Date: 2021-03-17 20:25:46
 * @LastEditTime: 2021-03-22 12:11:34
 * @FilePath: /siber-web/src/components/Navbar/index.tsx
 */
import React from 'react';
import { Menu } from 'antd';
import {
  ApartmentOutlined,
  DashboardOutlined,
  SettingOutlined,
  FormOutlined,
  CodeOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import Link from 'umi/link';
import styles from './index.less';
import { MenuItem, NavbarProps } from './interface';
import logo from '../../asset/wulai.png';

const { SubMenu } = Menu;
const menus: MenuItem[] = [
  { icon: <DashboardOutlined />, title: '运行概览', path: '/dashboard' },
  { icon: <SettingOutlined />, title: '环境管理', path: '/environment' },
  { icon: <FormOutlined />, title: '接口管理', path: '/methods' },
  { icon: <CodeOutlined />, title: '测试用例管理', path: '/case' },
  { icon: <UnorderedListOutlined />, title: '测试场景管理', path: '/flow' },
  { icon: <ClockCircleOutlined />, title: '测试计划管理', path: '/plan' },
  { icon: <ClockCircleOutlined />, title: '强制执行', path: '/enforce' },
];

const buildMenu = ({ icon, title, subMenus, path }: MenuItem) => {
  if (subMenus) {
    const SubMenuTitle = (
      <span>
        {icon}
        <span>{title}</span>
      </span>
    );
    const buildSubMenu = (menus: MenuItem[]) => {
      return menus.map(({ title, path }: MenuItem) => (
        <Menu.Item key={path}>
          <Link to={path!}>{title}</Link>
        </Menu.Item>
      ));
    };

    return (
      <SubMenu key={path} title={SubMenuTitle}>
        {buildSubMenu(subMenus)}
      </SubMenu>
    );
  }

  return (
    <Menu.Item key={path!}>
      <Link to={path!}>
        {icon}
        <span>{title}</span>
      </Link>
    </Menu.Item>
  );
};

export const NavBar = ({ collapsed }: NavbarProps) => {
  return (
    <div className={`${styles.nav} ${collapsed ? 't-collapsed' : ''}`}>
      <div className={styles.navLogo}>
        <img src={logo} />
        <h1>集成测试平台</h1>
      </div>
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['1']}
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
      >
        {menus.map(menu => buildMenu(menu))}
      </Menu>
    </div>
  );
};
