/*
 * @Author: xulijing
 * @Date: 2021-03-29 13:27:50
 * @LastEditTime: 2021-03-30 17:19:53
 * @FilePath: /siber-web/src/components/Breadcrumb/index.tsx
 */
import React from 'react';
import { RouteProps, Link } from 'react-router-dom';
import { connect } from 'dva'
import { Breadcrumb } from 'antd';

import { ConnectState } from '@/model/connect'

const buildPathMap = (routes: RouteItem[], routeMap: Map<string, any>) => {
  for (const { path, title, routes: subRoutes } of routes) {
    routeMap.set(path, {
      title: title,
    });
    if (subRoutes) {
      buildPathMap(subRoutes, routeMap);
    }
  }

  return routeMap;
};

const returnSearch = (index: number, _searchList: any) => {
  let str = ''
  for (let i = 0; i <= index; i++) {
    if (!i) {
      str = _searchList[_searchList.length - i - 1]
    } else {
      str = _searchList[_searchList.length - i - 1] + '#' + str
    }
  }

  return str
}

const buildSearchList = (location: any) => {
  const searchList = decodeURIComponent(location.search).replace(/\?/, '')
  const _searchList = searchList.split('#')

  const searchListMap = _searchList.map((item, index) => {
    const searchItem = returnSearch(index, _searchList)
    return searchItem
  })

  return searchListMap
}

const rootCrumbItem = (
  <Breadcrumb.Item key="dashboard">
    <Link to="/dashboard">首页</Link>
  </Breadcrumb.Item>
);

const Crumb = (props : any) => {
  const { currentPageBreadNameList, location } = props

  const routes = window.g_routes;

  // queryList存储每个路由的query参数
  const pathMap = buildPathMap(routes, new Map());

  // 去除空的首页
  const pathSnippets = location!.pathname!.split('/').filter(i => i);

  const searchList = buildSearchList(location)

  const crumbItems = [rootCrumbItem];

  if (location!.pathname !== '/dashboard') {
    const extraCrumbItems = pathSnippets.map((_: any, index: number) => {
      const path = `/${pathSnippets.slice(0, index + 1).join('/')}`;

      // 每个路由的面包屑名称
      const BreadCrumbItemTitle = currentPageBreadNameList.length && currentPageBreadNameList[index - 1] ? currentPageBreadNameList[index - 1] : pathMap.get(path).title

      //  每个路由的search
      const search = searchList.length && searchList[index - 1] ? searchList[index - 1] : ''

      return (
        <Breadcrumb.Item key={path}>
          {index === pathSnippets.length - 1 ? (
            <span>{BreadCrumbItemTitle}</span>
          ) : (
            <Link to={{ pathname: path, search: search}}>{BreadCrumbItemTitle}</Link>
          )}
        </Breadcrumb.Item>
      );
    });
    crumbItems.push(...extraCrumbItems);
  }

  return <Breadcrumb>{crumbItems}</Breadcrumb>;
};

const mapStateToProps = ({ global }: ConnectState) => {
  return {
    currentPageBreadNameList: global.currentPageBreadNameList
  }
}

export default connect(mapStateToProps)(Crumb)
