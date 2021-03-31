import React, { useState, useEffect } from 'react';

import { Table } from 'antd';
import withRouter from 'umi/withRouter';
import { LOGSTATUS_TYPE } from '@/pages/plan/interface';

import { listProcessPlanLog } from '../services';
import router from 'umi/router';

const PlanLogTable = (props: any) => {
  const { location } = props;

  const [currentLogList, setCurrentLogList] = useState([]);

  useEffect(() => {
    getLogList();
  }, []);

  const getLogList = async () => {
    const { tag, process_name } = location.query;
    const { data } = await listProcessPlanLog(process_name, tag);
    setCurrentLogList(data?.log_info[0] ? [...data.log_info[0].plan_log] : []);
  };

  /**
   * 查看flow日志
   */
  const handleLog = logId => () => {
    // 跳转到flow日志页面
    router.push({
      pathname: '/enforce/log/logFlow',
      query: {
        planLogId: `${logId}#${decodeURIComponent(location.search)}`,
      },
    });
  };

  const columns = [
    {
      title: 'plan名称',
      dataIndex: 'plan_name',
      key: 'plan_log_id',
    },
    {
      title: 'plan状态',
      dataIndex: 'plan_status',
      key: 'plan_status',
      width: '25%',
      render: (status: number) => <span>{LOGSTATUS_TYPE[status]}</span>,
    },
    {
      title: '操作',
      dataIndex: 'plan_log_id',
      key: 'plan_log_id',
      width: '25%',
      render: (id: string) => <a onClick={handleLog(id)}>查看日志</a>,
    },
  ];

  return (
    <Table dataSource={currentLogList} columns={columns} rowKey="plan_log_id" pagination={false} />
  );
};

export default withRouter(PlanLogTable);
