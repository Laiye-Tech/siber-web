import React, { Fragment } from 'react';
import router from 'umi/router';
import moment from 'moment';
import { Table, Card, message, Checkbox } from 'antd';
import { connect } from 'dva'

import { dispatchBreadCrumbs } from '@/utils/utils'
import { ENVIRONMENT_TYPE, LOGSTATUS_TYPE, STATUSCOLOR } from '../interface';

import { PlanLogInfoList } from '../interface/planLog';

import { planLog } from '../services/planLog';
import styles from '../index.less';

const CheckboxGroup = Checkbox.Group;
const pageSize = 20;
const statusOptions = ['0', '1', '2', '3', '9']
const environmentOptions = ['dev', 'test', 'stage', 'prod']
const interfaceOptions = ['http', 'grpc']
const triggerOptions = ['手动触发', 'ci触发', '定时任务触发']

type Props = {
  location: any;
};

type State = {
  /** planListLog列表 */
  planLogList: PlanLogInfoList[];
  /** 当前页码 */
  current: number;
  totalNumber: number
  filterParams: any;
  checkedList: any[];
};

class PlanLog extends React.Component<Props, State> {
  state = {
    planLogList: [],
    totalNumber: 0,
    filterParams: {},
    current: 1,
    checkedList: []
  };

  componentDidMount() {
    this.getPlanLogList(1);
  }

  /**
   * 获取planlog列表
   */
  getPlanLogList = async (page: number, params?: any) => {
    const { location, dispatch } = this.props;

    const { data, success, errmsg }: any = await planLog(location.query.planId, params, page , pageSize);
    if (!success) {
      message.error(errmsg);
      return false;
    }

    if ( data) {
      dispatchBreadCrumbs(dispatch, [data.plan_log_list ? data.plan_log_list[0].plan_name : '查看 Plan 日志'])
      this.setState({ planLogList: data.plan_log_list ? data.plan_log_list : [] , totalNumber: data.total_num ? data.total_num : 0});
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
        planLogId: `${data.plan_log_id}#${decodeURIComponent(location.search)}`
      },
    });
  };

  /**
   * 渲染 -操作- 模块
   */
  renderOperation = (data: any) => (
    <a onClick={() => this.jumpPage('logFlow', data)}>详情</a>
  );

  onPageChange = async (page: number) => {
    await this.setState({ current: page });
    this.getPlanLogList(page, this.state.filterParams)
  };

  onCheckChange = (type: string) => (checkedList: any) => {
    this.setState({ checkedList }, () => { this.checkboxList(type) })
  }

  /**
   *  多选筛选
   */

  checkboxList = (type: string) => {
    const { filterParams, checkedList } = this.state
    filterParams[type] = checkedList
    this.setState({ filterParams }, () => { this.onPageChange(1) })
  }

  statusSelect = () => (
    <CheckboxGroup
      onChange={this.onCheckChange('plan_status')}
    >
      {statusOptions && statusOptions.length ? statusOptions.map((item, idx) => (
          <Checkbox value={parseInt(item, 10)} key={idx}>
            {LOGSTATUS_TYPE[parseInt(item, 10)]}
          </Checkbox>
        )) : null}
    </CheckboxGroup>
  )

  environmentSelect = () => (
    <CheckboxGroup
      onChange={this.onCheckChange('environment_name')}
    >
      {environmentOptions && environmentOptions.length ? environmentOptions.map((item, idx) => (
          <Checkbox value={item} key={idx}>
            {ENVIRONMENT_TYPE[item]}
          </Checkbox>
        )) : null}
    </CheckboxGroup>
  )

  interfaceSelect = () => (
    <CheckboxGroup
      onChange={this.onCheckChange('interface_type')}
    >
      {interfaceOptions && interfaceOptions.length ? interfaceOptions.map((item, idx) => (
          <Checkbox value={item} key={idx}>
            {item}
          </Checkbox>
      )) : null}
    </CheckboxGroup>
  )

  triggerSelect = () => (
    <CheckboxGroup
      onChange={this.onCheckChange('trigger')}
    >
      {triggerOptions && triggerOptions.length ? triggerOptions.map((item, idx) => (
          <Checkbox value={item} key={idx}>
            {item}
          </Checkbox>
        )) : null}
    </CheckboxGroup>
  )


  /**
   * plan列表模块
   */
  renderTable = () => {
    const { current, planLogList, totalNumber } = this.state

    const columns = [
      {
        title: '开始时间',
        dataIndex: 'db_insert_time',
        key: 'db_insert_time',
        width: '20%',
        render: (db_insert_time: number) => (
          <span>{db_insert_time ? moment.unix(db_insert_time).format('YYYY-MM-DD HH:mm') : '-'}</span>
        )
      },
      {
        title: '结束时间',
        dataIndex: 'db_update_time',
        key: 'db_update_time',
        width: '20%',
        defaultSortOrder: 'descend',
        sorter: (a: any, b: any) => a.db_update_time - b.db_update_time,
        render: (update_time: number) => (
          <span>{update_time ? moment.unix(update_time).format('YYYY-MM-DD HH:mm') : '-'}</span>
        ),
      },
      {
        title: 'plan状态',
        dataIndex: 'plan_status',
        key: 'plan_status',
        width: '16%',
        render: (plan_status: number) => (
          <span style={{ color: STATUSCOLOR[plan_status] }}>• {LOGSTATUS_TYPE[plan_status]}</span>
        ),
      },
      {
        title: '环境',
        dataIndex: 'environment_name',
        key: 'environment_name',
        width: '16%',
        render: (environment_name: string) => (
          <span>{ENVIRONMENT_TYPE[environment_name]}</span>
        )
      },
      {
        title: '接口类型',
        dataIndex: 'interface_type',
        key: 'interface_type',
        width: '16%'
      },
      {
        title: '触发方式',
        dataIndex: 'trigger',
        key: 'trigger',
        width: '16%',
        render: (trigger: any) => (
          <span>{trigger || '手动触发'}</span>
        )
      },
      {
        dataIndex: 'err_content',
        key: 'err_content',
        render: (err_content: string) => (
          <span style={{display: 'none'}}>{err_content}</span>
        )
      },
      {
        title: '操作',
        dataIndex: 'plan_log_id',
        key: 'plan_log_id',
        width: '20%',
        render: (_: string, data: any) =>  this.renderOperation(data)
      },
    ];

    return (
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: record => <p style={{ margin: 0 , color: STATUSCOLOR[record.plan_status] }}>
            {record.plan_status === 3 ? `错误详情：${record.err_content}` : LOGSTATUS_TYPE[record.plan_status]}
            </p>,
          rowExpandable: record => record.plan_status === 3,
        }}
        rowKey="plan_log_id"
        dataSource={planLogList}
        pagination={{
          current: current,
          pageSize: pageSize,
          onChange: this.onPageChange,
          total: totalNumber ? totalNumber : 0,
          hideOnSinglePage: true
        }}
      />
    );
  };

  render() {
    return (
      <div className={styles.container}>
        <Card>
          <p>plan状态：</p> {this.statusSelect()}
          <br />
          <p>环境: </p>{this.environmentSelect()}
          <br />
          <p>接口类型:</p> {this.interfaceSelect()}
          <br />
          <p>触发方式:</p> {this.triggerSelect()}
        </Card>
        <Card>
          <section>{this.renderTable()}</section>
        </Card>
      </div>
    );
  }
}

export default connect()(PlanLog);
