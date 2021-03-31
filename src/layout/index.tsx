import React, { useState, useEffect } from 'react';
import { RouteProps } from 'react-router-dom';
import { connect } from 'dva'
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
// antd设置成中文
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';

import { SimpleLayout } from './Simple';
import { NavBar } from '@/components/Navbar';
import Crumb from '@/components/Breadcrumb';
import styles from './index.less';

const simplePath = /^\/(404)/;

const BasicLayout = (props: RouteProps) => {
const { location, children, dispatch } = props;
if (simplePath.test(location!.pathname)) {
return <SimpleLayout>{children}</SimpleLayout>;
}
const [collapsed, setCollapsed] = useState(false);

useEffect(() => {
  dispatch({
    type:'global/setRoterHistoryList',
    payload: location
  });
}, [location.pathname])

return (
    <div className={styles.container}>
      <ConfigProvider locale={zhCN}>
        <NavBar collapsed={collapsed}/>
          <div className={`${styles.wrapper} ${collapsed ? 't-collapsed' : ''}`}>
            <div className={styles.header}>
              {collapsed ? <MenuUnfoldOutlined className={styles.headerIcon} onClick={() => setCollapsed(!collapsed)} /> : <MenuFoldOutlined className={styles.headerIcon} onClick={() => setCollapsed(!collapsed)} />}
            </div>
            <div className={styles.body}>
              <Crumb location={location}/>
              <div className={styles.main}>{children}</div>
            </div>
          </div>
      </ConfigProvider>
    </div>
  );
};

export default connect()(BasicLayout)
