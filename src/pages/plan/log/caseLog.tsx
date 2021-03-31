import React from 'react';
import router from 'umi/router';
import moment from 'moment';
import { Table, Card, message } from 'antd';
import { connect } from 'dva'

import { dispatchBreadCrumbs } from '@/utils/utils'
import { LOGSTATUS_TYPE, STATUSCOLOR } from '../interface';
import { CaseLogInfoList } from '../interface/caseLog';

import { caseLog } from '../services/caseLog';

const pageSize = 20;

type Props = {
  location: any;
};

type State = {
  /** planList列表 */
  caseLogList: CaseLogInfoList[];
  /** 当前页码 */
  current: number;
};

class PlanCaseLog extends React.PureComponent<Props, State> {
  state = {
    caseLogList: [],
    current: 1,
  };

  componentDidMount() {
    this.getFlowList();
  }

  /**
   * 获取case列表
   */
  getFlowList = async () => {
    const { location, dispatch } = this.props;
    const flowLogId = decodeURIComponent(location.query.flowLogId).split('#')[0]

    const { data, success, errmsg }: any = await caseLog(flowLogId);
    if (!success) {
      message.error(errmsg);
      return false;
    }

    if ( data) {
      if (data.case_log_list) {
        const item = data.case_log_list[0]

        const time = item.db_insert_time.length > 10 ? moment.unix(item.db_insert_time/1000).format('YYYY-MM-DD HH:mm:ss') : moment.unix(item.db_insert_time).format('YYYY-MM-DD HH:mm')

        dispatchBreadCrumbs(dispatch, [item.plan_name, `开始时间-${time}`, item.flow_name])
      }

      this.setState({ caseLogList: data.case_log_list ? data.case_log_list : []});
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
        caseLogId: `${data.case_log_id}#${decodeURIComponent(location.search)}`,
        origin: 'plan'
      }
    });
  };

  /**
   * 渲染 -操作- 模块
   */
  renderOperation = (data: any) => (
    <a onClick={() => this.jumpPage('caseDetail', data)}>详情</a>
  );

  onPageChange = (page: number) => {
    this.setState({ current: page });
  };

  /**
   * plan列表模块
   */
  renderTable = () => {
    const { current, caseLogList } = this.state;

    const columns = [
      {
        title: 'case名称',
        dataIndex: 'case_name',
        key: 'case_name',
        width: '15%',
        fixed: 'left',
        render: (_, task: any) => <span>{task.case_name ? task.case_name : task.case_id}</span>,
      },
      {
        title: '开始时间',
        dataIndex: 'db_insert_time',
        key: 'db_insert_time',
        width: '15%',
        render: (db_insert_time: any) => (
          <span>
            {db_insert_time ? db_insert_time.length > 10 ? moment.unix(db_insert_time/1000).format('YYYY-MM-DD HH:mm:ss') : moment.unix(db_insert_time).format('YYYY-MM-DD HH:mm') : '-'}
          </span>
        ),
      },
      {
        title: '结束时间',
        dataIndex: 'db_update_time',
        key: 'db_update_time',
        width: '15%',
        sorter: (a: any, b: any) => a.db_update_time - b.db_update_time,
        defaultSortOrder: 'descend',
        render: (db_update_time: any) => (
          <span>
            {db_update_time ? db_update_time.length > 10 ? moment.unix(db_update_time/1000).format('YYYY-MM-DD HH:mm:ss'): moment.unix(db_update_time).format('YYYY-MM-DD HH:mm') : '-'}
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
        dataIndex: 'case_status',
        key: 'case_status',
        width: '8%',
        render: (case_status: number) => (
          <span style={{ color: STATUSCOLOR[case_status] }}>
            {' '}
            {case_status ? `•  ${LOGSTATUS_TYPE[case_status]}` : ''}
          </span>
        ),
      },
      {
        title: 'method_name',
        dataIndex: 'method_name',
        key: 'method_name',
        width: '22%',
      },
      {
        title: '运行时间',
        dataIndex: 'operation_time',
        key: 'operation_time',
        width: '10%',
        render: (_: any, task: any) => {
          const val = task.db_update_time - task.db_insert_time;
          return <span> {val} ms</span>;
        },
      },
      {
        title: '操作',
        dataIndex: 'case_log_id',
        key: 'case_log_id',
        width: '15%',
        fixed: 'right',
        render: (_: string, data: any) => this.renderOperation(data),
      },
    ];

    return (
      <Table
        dataSource={caseLogList}
        columns={columns}
        rowKey="case_log_id"
        expandedRowRender={
          record => <p style={{ margin: 0 , color: STATUSCOLOR[record.case_status] }}>
            {record.case_status === 3 ? `错误详情：${record.err_content}` : LOGSTATUS_TYPE[record.case_status]}
          </p>}
        pagination={{
          current: current,
          pageSize: pageSize,
          onChange: this.onPageChange,
          total: caseLogList ? caseLogList.length : 0,
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

export default connect()(PlanCaseLog);
