import React from 'react';
import router from 'umi/router';
import moment from 'moment';
import { Table, Card, message } from 'antd';
import { connect } from 'dva'

import { dispatchBreadCrumbs } from '@/utils/utils'
import { LOGSTATUS_TYPE, STATUSCOLOR } from '../interface';
import { FlowLogInfoList } from '../interface/flowLog';

import { flowLog } from '../services/flowLog';

const pageSize = 20;

type Props = {
  location: any;
};

type State = {
  /** planList列表 */
  flowLogList: FlowLogInfoList[];
  /** 当前页码 */
  current: number;
};

class PlanFlowLog extends React.PureComponent<Props, State> {
  state = {
    flowLogList: [],
    current: 1,
  };

  componentDidMount() {
    this.getFlowList();
  }

  /**
   * 获取flow列表
   */
  getFlowList = async () => {
    const { location, dispatch } = this.props;

    const planLogId = decodeURIComponent(location.query.planLogId).split('#')[0]

    const { data, success, errmsg }: any = await flowLog(planLogId);
    if (!success) {
      message.error(errmsg);
      return false;
    }

    if ( data) {
      if (data.flow_log_list) {
        const item = data.flow_log_list[0]
        const time = moment.unix(item.db_insert_time).format('YYYY-MM-DD HH:mm')
        dispatchBreadCrumbs(dispatch, [item.plan_name, `开始时间-${time}`])
      }

      this.setState({ flowLogList: data.flow_log_list ? data.flow_log_list : []});
    }

  };

  /**
   * 跳转到详情页
   */
  jumpPage = (path: string, data: any) => {
    const { location } = this.props;
    router.push({
      pathname: `${location.pathname}/${path}`,
      query: {
        flowLogId: `${data.flow_log_id}#${decodeURIComponent(location.search)}`
      }
    });
  };

  /**
   * 渲染 -操作- 模块
   */
  renderOperation = (data: any) => (
    <a onClick={() => this.jumpPage('logCase', data)}>详情</a>
  );

  onPageChange = (page: number) => {
    this.setState({ current: page });
  };

  /**
   * plan列表模块
   */
  renderTable = () => {
    const { current, flowLogList } = this.state;

    const columns = [
      {
        title: 'flow名称',
        dataIndex: 'flow_name',
        key: 'flow_name',
        width: '20%',
        fixed: 'left',
        render: (_, task: any) => <span>{task.flow_name ? task.flow_name : task.flow_id}</span>,
      },
      {
        title: '开始时间',
        dataIndex: 'db_insert_time',
        key: 'db_insert_time',
        width: '20%',
        render: (db_insert_time: number) => (
          <span>
            {db_insert_time ? moment.unix(db_insert_time).format('YYYY-MM-DD HH:mm') : '-'}
          </span>
        ),
      },
      {
        title: '结束时间',
        dataIndex: 'db_update_time',
        key: 'db_update_time',
        width: '20%',
        sorter: (a: any, b: any) => a.db_update_time - b.db_update_time,
        defaultSortOrder: 'descend',
        render: (db_update_time: number) => (
          <span>
            {db_update_time ? moment.unix(db_update_time).format('YYYY-MM-DD HH:mm') : '-'}
          </span>
        ),
      },
      {
        dataIndex: 'err_content',
        key: 'err_content',
        render: (err_content: string) => (
          <span style={{display: 'none'}}>{err_content}</span>
        )
      },
      {
        title: '状态',
        dataIndex: 'flow_status',
        key: 'flow_status',
        width: '20%',
        render: (flow_status: number) => (
          <span style={{ color: STATUSCOLOR[flow_status] }}>
            {' '}
            {flow_status ? `•  ${LOGSTATUS_TYPE[flow_status]}` : ''}
          </span>
        )
      },
      {
        title: '操作',
        dataIndex: 'flow_log_id',
        key: 'flow_log_id',
        width: '20%',
        fixed: 'right',
        render: (_: string, data: any) => this.renderOperation(data),
      },
    ];

    return (
      <Table
        dataSource={flowLogList}
        columns={columns}
        rowKey="flow_log_id"
        expandedRowRender={
          record => <p style={{ margin: 0 , color: STATUSCOLOR[record.flow_status] }}>
            {record.flow_status === 3 ? `错误详情：${record.err_content}` : LOGSTATUS_TYPE[record.flow_status]}
          </p>}
        pagination={{
          current: current,
          pageSize: pageSize,
          onChange: this.onPageChange,
          total: flowLogList && flowLogList.length ? flowLogList.length : 0,
          hideOnSinglePage: true,
        }}
      />
    );
  };

  render() {
    return (
      <Card>
        <section>{this.renderTable()}</section>
      </Card>
    );
  }
}

export default connect()(PlanFlowLog);
