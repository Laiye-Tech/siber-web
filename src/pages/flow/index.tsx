import React, { useState, useEffect } from 'react'
import router from 'umi/router';
import { connect } from 'dva'

import { Button, Table, Card, message, Modal, Input, Spin, Tag } from 'antd';
import moment from 'moment';

import { listFlow, manageFlow } from './services';
import { listPlan } from '../plan/services'
import { ManageMode } from '@/services/interface';
import { ConnectState } from '@/model/connect'
import { FlowInfo } from './interface';

import styles from './index.less';

const { confirm } = Modal;
const { Search } = Input;

const pageSize = 20;

const setDefaultvalue = (props: any) => {
  const { roterHistoryList }: any = props
  if (roterHistoryList) {
  const length = roterHistoryList.length
  const history = roterHistoryList[length - 2]
  // 如果前一步是编辑
  if ( history && history.pathname === '/flow/detail' && history.query.flowId) {
   return true
  }

    return false
  }
}

const Flow: React.FC = (props) => {
  const isSetsetDefaultvalue = setDefaultvalue(props)
  let defaultvalue = isSetsetDefaultvalue ? window.sessionStorage.getItem('flowSerchValue') : ''

  const [current, setCurrent] = useState<number>(1)
  const [flowList, setFlowList] = useState<FlowInfo[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [totalPage, setTotalPage] = useState<number>(1)
  const [searchValue, setSearchValue] = useState<string>(defaultvalue)

  useEffect (() => {
    !isSetsetDefaultvalue && window.sessionStorage.removeItem('flowSerchValue')
  },[]);

  useEffect (() => {
    getFlowList()
  },[current, searchValue]);

/**
* 获取flow列表
*/
  const getFlowList = async () => {
  setLoading(true)
  const params = {content: searchValue, page: `${current}`, page_size: `${pageSize}`}
  const { success, data, errmsg }: any = await listFlow({'filter_content': params});

  if (!success) {
    message.error(errmsg);
    setLoading(false)
    return false
  }

  let _data = JSON.parse(JSON.stringify(data))
  const flow_info_list = _data && _data.flow_info_list ? [..._data.flow_info_list] : []

  setLoading(false)
  setTotalPage(data ? data.total_num : null)
  setFlowList(flow_info_list)
}

/**
* 搜索flow
*/
const handleSearchClick = (value: string) => {
  window.sessionStorage.setItem('flowSerchValue',value)
  setCurrent(1)
  setSearchValue(value)
}

const handlePageChange = (page: number) => {
  setCurrent(page)
}

/**
* 跳转到详情页
*/
const jumpPabge = (type: string = "", data?: any) => () => {
  router.push({
    pathname: '/flow/detail',
    query: data ? { flowId: data.flow_id, type: type } : {},
  });
};

/**
 * @param flowId: string
 */
const searchPlan = async (flowId: string) => {
  const params = {
    flow: flowId,
    page: "1",
    page_size: '1500'
  }

  const { success, errmsg, data } = await listPlan({filter_content: params})

  if (!success) {
    message.error(errmsg)
    return  false
  }

  if (data && data.plan_info_list ) {
    return data.plan_info_list.map(item => item.plan_name)
  }

  return []
}

/**
 * 弹出删除框
 */
const showConfirm = async (flowId: string, name: string) => {
  // 调接口、查此flow都绑定了哪些case
  const planNameList: any = await searchPlan(flowId)

  const content = (
    <div>
      <h4>此flow包含的plan有： {planNameList.map((item: string, index: number) => (<Tag color="#2db7f5" key={`${index}-${item}`} style={{marginTop: '10px'}}>{item}</Tag>))}</h4>
    </div>
  )

  confirm({
    title: `确认删除 ${name} 吗？`,
    content: planNameList.length ? content : null,
    okText: '确认',
    cancelText: '取消',
    onOk: () => handleFlowDelete(flowId),
  });
};

/**
* 删除flow
*/
const handleFlowDelete = async (flowId: string) => {
  const params = {
    flow_id: flowId,
  };

  const { success, errmsg }: any = await manageFlow(ManageMode.DELETE, params);

  if (!success) {
    message.error(errmsg);
    return false;
  }
  message.success('删除成功');

  getFlowList();
};

const renderOperation = (data: any) => (
  <div className={styles.operation}>
    <span onClick={jumpPabge('edit', data)}>编辑</span>
    <span onClick={jumpPabge('copy', data)}>复制</span>
    <span onClick={() => showConfirm(data.flow_id, data.flow_name)}>删除</span>
  </div>
);

/**
* flow列表模块
*/
const FlowTable: React.FC = () => {
  const columns = [
    {
      title: 'flow名称',
      dataIndex: 'flow_name',
      key: 'flow_name',
      width: '25%',
    },{
      title: '创建时间',
      dataIndex: 'insert_time',
      key: 'insert_time',
      width: '25%',
      render: (insert_time: number) => (
      <span>{insert_time ? moment.unix(insert_time).format('YYYY-MM-DD HH:mm') : '-'}</span>
    ),
    },{
      title: '更新时间',
      dataIndex: 'update_time',
      key: 'update_time',
      width: '25%',
      sorter: (a: any, b: any) => a.update_time - b.update_time,
      defaultSortOrder: 'descend',
      render: (update_time: number) => (
      <span>{update_time ? moment.unix(update_time).format('YYYY-MM-DD HH:mm') : '-'}</span>
    ),
    },{
      title: '操作',
      dataIndex: 'flow_id',
      key: 'flow_id',
      width: '25%',
      render: (_: string, data: any) => renderOperation(data),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        dataSource={flowList}
        columns={columns}
        rowKey="flow_id"
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
          placeholder="搜索flow"
          defaultValue={defaultvalue}
          onSearch={handleSearchClick}
          style={{ width: 300, marginRight: '20px'}}
        />
        <Button type="primary" onClick={jumpPabge()}>
        创建Flow
        </Button>
      </header>
      <section>
        <FlowTable />
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

export default connect(mapStateToProps)(Flow)
