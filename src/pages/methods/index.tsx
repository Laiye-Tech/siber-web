import React, { useState, useEffect } from 'react'
import router from 'umi/router';
import { connect } from 'dva'

import { Button, Table, Card, message, Input, Menu, Dropdown, Spin } from 'antd';
import moment from 'moment';

import { listMethod } from '../case/services';
import { ConnectState } from '@/model/connect'

import styles from './index.less';

const { Search } = Input;
const { Item } = Menu

type Props = {
  location: any;
};

const pageSize = 20;

const setDefaultvalue = (props: any) => {
  const { roterHistoryList }: any = props
  if (roterHistoryList) {
    const length = roterHistoryList.length
    const history = roterHistoryList[length - 2]
    // 如果前一步是编辑
    if ( history && history.pathname === '/methods/detail' && history.query.methodName) {
      return true
    }

    return false
  }
}

const Methods: React.FC = (props: Props) => {
  const isSetDefaultvalue = setDefaultvalue(props)
  // 搜索的默认值
  let defaultvalue = isSetDefaultvalue ? window.sessionStorage.getItem('methodSerchValue') : ''

  const [current, setCurrent] = useState<number>(1)
  const [methodList, setMethodList] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [totalPage, setTotalPage] = useState<number>(1)
  const [searchValue, setSearchValue] = useState<string>(defaultvalue)

  useEffect (() => {
    !isSetDefaultvalue && window.sessionStorage.removeItem('methodSerchValue')
  },[]);

  useEffect(() => {
    getMethodList()
  },[current, searchValue])

  /**
  * 获取method列表
  */
  const getMethodList = async () => {
    setLoading(true)
    const params = {content: searchValue, page: `${current}`, page_size: `${pageSize}`}
    const { success, data, errmsg }: any = await listMethod({'filter_content': params});

    if (!success) {
      message.error(errmsg);
      setLoading(false)
      return false
    }

    let _data = JSON.parse(JSON.stringify(data))
    const method_list = _data && _data.method_list ? [..._data.method_list] : []

    setLoading(false)
    setTotalPage(data ? data.total_num : null)
    setMethodList(method_list)
  }

  /**
  * 搜索method
  */
  const handleSearchClick = (value: string) => {
    window.sessionStorage.setItem('methodSerchValue', value)
    setCurrent(1)
    setSearchValue(value)
  }

  const handlePageChange = (page: number) => {
    setCurrent(page)
  }

  /**
  * 跳转详情页
  */
  const jumpPage = (type: string, data?: any) => () => {
    router.push({
      pathname: `/methods/detail`,
      query: data ? { methodName: data.method_name, method_type: data.method_type} : { method_type: type },
      state: {
        BreadCrumbs: data ? [data.method_name] : []
      },
    });
  }

  const renderOperation= (data: any) => (
    <div className={styles.operation}>
      <span onClick={jumpPage('editor', data)}>编辑</span>
    </div>
  );

  const menu = (
    <Menu>
      <Item key="grpc" onClick={jumpPage('grpc')}>grpc</Item>
      <Item key="http" onClick={jumpPage('http')}>http</Item>
      <Item key="graphQL" onClick={jumpPage('graphQL')}>graphQL</Item>
    </Menu>
  );

  /**
  * method列表模块
  */
  const MethodTable: React.FC = () => {
    const columns = [
      {
        title: 'method名称',
        dataIndex: 'method_name',
        key: 'method_name',
        width: '25%',
      },
      {
        title: 'method类型',
        dataIndex: 'method_type',
        key: 'method_type',
        width: '25%'
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
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '25%',
        render: (_: string, data: any) => renderOperation(data),
      },
    ];

    return (
      <Spin spinning={loading}>
        <Table
          dataSource={methodList}
          columns={columns}
          rowKey={(record: any, index: number) => `complete${record.method_name}${index}`}
          pagination={{
            current: current,
            pageSize: pageSize,
            onChange: handlePageChange,
            total: totalPage,
            hideOnSinglePage: true,
          }}
        />
      </Spin>
    )
  }

    return (
      <div className={styles.container}>
        <Card>
        <header>
          <Search
            placeholder="搜索method"
            defaultValue={defaultvalue}
            onSearch={handleSearchClick}
            style={{ width: 300, marginRight: '20px'}}
          />

          <Dropdown overlay={menu}>
            <Button type="primary">
            创建Method
            </Button>
          </Dropdown>

          </header>
          <section>
            <MethodTable />
          </section>
        </Card>
      </div>
   )
}

const mapStateToProps = ({global}: ConnectState) => {
  return {
    roterHistoryList: global.roterHistoryList
  };
}

export default connect(mapStateToProps)(Methods)
