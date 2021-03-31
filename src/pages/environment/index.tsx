import React, { useState, useEffect } from 'react'
import router from 'umi/router';
import moment from 'moment';
import withRouter from 'umi/withRouter';

import { Table, Card, message, Button, Tag, Modal, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';


import { listEnv, manageEnv } from './services'

import { EnvList } from './interface';
import { ManageMode } from '@/services/interface';

import styles from './index.less';

const { confirm } = Modal;
const { Item } = Menu

type Props = {
  location: any;
};
const Setting: any = (props: Props) => {
  const [current, setCurrent] = useState<number>(1)
  const [envList, setEnvList] = useState<EnvList[]>([])
  const [totalPage, setTotalPage] = useState<number>(1)
  const pageSize = 20;
  useEffect(() => { getEnvList()},[current]);

  /**
   * 获取env列表
   */
  const getEnvList = async () => {
    const params = {page: `${current}`, page_size: `${pageSize}`}
    const { success, data, errmsg }: any = await listEnv({'filter_content': params});

      if (!success) {
        message.error(errmsg);
        return false
      }

      setTotalPage(data ? data.total_num : null)
      setEnvList(data && data.env_list ? data.env_list : [])
  }

  const handlePageChange = (page: number) => {
    setCurrent(page)
  }

  /**
   * 跳转到创建页
   */
  const jumpCreatePage = (modeType: string) => {
    const { location } = props;
    modeType === 'interface'
    ?
    router.push({
      pathname: `${location.pathname}/interface`
    })
    :
    router.push({
      pathname: `${location.pathname}/instance`
    })
  };

  /**
   *  删除框
   */
  const showConfirm = (envId: string, name: string) => {
    confirm({
      title: '确认删除',
      content: `确认删除 ${name} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleEnvDelete(envId)
    });
  };

  const menu = (
    <Menu>
      <Item key="Interface" onClick={() => jumpCreatePage('interface')}>Interface</Item>
      <Item key="Instance" onClick={() => jumpCreatePage('instance')}>Instance</Item>
    </Menu>
  );

  /**
   *  删除env
   */
  const handleEnvDelete = async (envId: string) => {
    const params = {
      env_id: envId
    };

    const { success, errmsg }: any = await manageEnv(ManageMode.DELETE, params);

    if (!success) {
      message.error(errmsg);
      return false;
    }
    message.success('删除成功');

    getEnvList();
  };

  /**
   * 页面跳转详情、日志、复制、创建
   * @param path 跳转的路径
   */
  const jumpPage = (path: string, data: any, type: string = '') => {
    const { location } = props;

    router.push({
      pathname: `${location.pathname}/${path}`,
      query: { envId: data.env_id },
      state: {
        type: type,
        insert_time: data.insert_time,
        BreadCrumbs: [data.env_name]
      },
    });
  };

  /**
   * 渲染 -操作- 模块
   */
  const renderOperation = (envId: string, data: any) => {
    const mysql = data.instance && data.instance.instance_type ? data.instance.instance_type : ''


   return (
      <div className={styles.operation}>
        <span onClick={() => jumpPage((mysql ? 'instance' : 'interface'), data, 'edit')}>编辑</span>
        <span onClick={() => showConfirm(envId, data.env_name)}>删除</span>
      </div>
    )
  }


   /**
   * env列表模块
   */
  const EnvTable: React.FC = () => {
    const columns = [
      {
        title: '配置名称',
        dataIndex: 'env_name',
        key: 'env_name',
        width: '25%',
      },
      {
        title: '接口类型',
        dataIndex: 'env_mode',
        key: 'env_mode',
        width: '25%',
        render: (env_mode: string, a: any) => (
          <span>{env_mode ? env_mode :  a.instance && a.instance.instance_type ? a.instance.instance_type : '-'}</span>
        )
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        key: 'update_time',
        width: '25%',
        sorter: (a: any, b: any) => a.update_time - b.update_time,
        defaultSortOrder: 'descend',
        render: (update_time: number) => (
          <span>{update_time ? moment.unix(update_time).format('YYYY-MM-DD HH:mm') : '-'}</span>
        )
      },
      {
        title: '支持协议',
        dataIndex: 'environment',
        key: 'environment',
        width: '25%',
        render: (_: any, envList: any) => {
          const list: any = []
          let envMode = '-'
          if (envList.env_mode === 'interface') {
            if (envList && envList.grpc && Object.values(envList.grpc).length) {
              list.push('gRPC')
            }
            if (envList && envList.http && Object.values(envList.http).length) {
              list.push('HTTP')
            }
            envMode = 'interface'
          } else if (envList.instance && envList.instance.instance_type) {
            envMode = envList.instance.instance_type
          }

          return (
            envMode === 'interface' && list ? list.map((tag: any, index: number) => (
              <Tag key={index} color='geekblue'>{tag}</Tag>
            )) : <Tag color='geekblue'>{envMode}</Tag>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'env_id',
        key: 'env_id',
        width: '25%',
        render: (env_id: string, data: any) => renderOperation(env_id, data),
      }
    ];

    return (
      <Table
        dataSource={envList}
        columns={columns}
        rowKey="env_id"
        pagination={{
          current: current,
          pageSize: pageSize,
          onChange: handlePageChange,
          total: totalPage,
          hideOnSinglePage: true
        }}
      />
    )
  }

	return (
    <div className={styles.container}>
      <Card>
        <header>
          <Dropdown overlay={menu}>
            <Button type='primary'>
              创建配置 <DownOutlined />
            </Button>
          </Dropdown>
        </header>
        <section>
          <EnvTable />
        </section>
      </Card>
    </div>
	)
}

export default withRouter(Setting)
