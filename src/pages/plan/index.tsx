import React, { useState, useEffect } from 'react';
import router from 'umi/router';
import withRouter from 'umi/withRouter';
import { connect } from 'dva';

import { Button, Table, Card, message, Modal, Input, Spin, Select } from 'antd';
import moment from 'moment';
import { ConnectState } from '@/model/connect';

import { listPlan, managePlan, runPlan } from './services';
import { PlanInfo } from './interface';
import { ManageMode } from '@/services/interface';
import { EENVIRONMENT_TYPE, ENVIRONMENT_TYPE } from './interface';

import styles from './index.less';

const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

type Props = {
  location: any;
};

const pageSize = 20;

const setDefaultvalue = (props: any) => {
  const { roterHistoryList }: any = props;
  if (roterHistoryList) {
    const length = roterHistoryList.length;
    const history = roterHistoryList[length - 2];
    // 如果前一步是编辑
    if (
      history &&
      (history.pathname === '/plan/detail' || history.pathname === '/plan/log') &&
      history.query.planId
    ) {
      return true;
    }
    return false;
  }
};

const Plan: any = (props: Props) => {
  const isSetDefaultvalue = setDefaultvalue(props);
  // 搜索的默认值
  let defaultvalue = isSetDefaultvalue ? window.sessionStorage.getItem('planSerchValue') : '';

  const [current, setCurrent] = useState<number>(1);
  const [action, setAction] = useState<string>('all');
  const [planList, setPlanList] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<string>(defaultvalue);
  const [runModal, setRunModal] = useState<boolean>(false);
  // 运行时存储当前运行plan的详情
  const [planDetail, setPlanDetail] = useState<any>(null);
  const [planRunEnv, setPlanRunEnv] = useState<string>(EENVIRONMENT_TYPE.PROD);

  useEffect(() => {
    !isSetDefaultvalue && window.sessionStorage.removeItem('planSerchValue');
  }, []);

  useEffect(() => {
    getPlanList();
  }, [current, searchValue, action]);

  /**
   * 获取plan列表
   */
  const getPlanList = async () => {
    setLoading(true);
    const params = { content: searchValue, page: `${current}`, page_size: `${pageSize}` };

    if (action === 'cron') {
      params.action = action;
    }

    const { success, data, errmsg }: any = await listPlan({ filter_content: params });

    if (!success) {
      message.error(errmsg);
      setLoading(false);
      return false;
    }

    let _data = JSON.parse(JSON.stringify(data));
    const plan_info_list = _data && _data.plan_info_list ? [..._data.plan_info_list] : [];

    setLoading(false);
    setTotalPage(data ? data.total_num : null);
    setPlanList(plan_info_list);
  };

  /**
   * 搜索plan
   */
  const handleSearchClick = (value: string) => {
    window.sessionStorage.setItem('planSerchValue', value);
    setCurrent(1);
    setSearchValue(value);
  };

  const handlePageChange = (page: number) => {
    setCurrent(page);
  };

  /**
   * 页面跳转详情、日志、复制、创建
   * @param path 跳转的路径
   * @param data data
   */
  const jumpPage = (path: string, data: any, type: string = '') => () => {
    const { location } = props;

    router.push({
      pathname: `${location.pathname}/${path}`,
      query: {
        planId: `${data.plan_id}`,
        type: type,
      },
    });
  };

  /**
   * 跳转到创建页
   */
  const jumpCreatePage = () => {
    const { location } = props;

    router.push({
      pathname: `${location.pathname}/detail`,
    });
  };

  /**
   * 删除plan
   */
  const handlePlanDelete = async (planId: string) => {
    const params = {
      plan_id: planId,
    };

    const { success, errmsg }: any = await managePlan(ManageMode.DELETE, params);

    if (!success) {
      message.error(errmsg);
      return false;
    }
    message.success('删除成功');

    getPlanList();
  };

  /**
   * 运行单个plan
   */
  const toRunPlan = (planInfo: PlanInfo) => async () => {
    setPlanDetail(planInfo);
    setRunModal(true);
  };

  const handleRunPlan = async () => {
    setRunModal(false);

    const { plan_id } = planDetail;
    await runPlan(plan_id, planRunEnv);
  };

  const handleChangeAction = (value: string) => {
    setCurrent(1);
    setAction(value);
  };

  /**
   * 删除框
   */
  const showConfirm = (planId: string, name: string) => {
    confirm({
      title: '确认删除',
      content: `确认删除 ${name} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => handlePlanDelete(planId),
    });
  };

  /**
   * 渲染 -操作- 模块
   */
  const renderOperation = (planId: string, data: PlanInfo) => (
    <div className={styles.operation}>
      <span onClick={toRunPlan(data)}>运行</span>
      <span onClick={jumpPage('detail', data, 'edit')}>编辑</span>
      <span onClick={jumpPage('detail', data, 'copy')}>复制</span>
      <span onClick={() => showConfirm(planId, data.plan_name)}>删除</span>
      <span onClick={jumpPage('log', data, 'log')}>日志</span>
    </div>
  );

  /**
   * plan列表模块
   */
  const PlanTable: React.FC = () => {
    const columns = [
      {
        title: 'plan名称',
        dataIndex: 'plan_name',
        key: 'plan_name',
        width: '25%',
      },
      {
        title: '创建时间',
        dataIndex: 'insert_time',
        key: 'insert_time',
        width: '25%',
        render: (insert_time: number) => (
          <span>{insert_time ? moment.unix(insert_time).format('YYYY-MM-DD HH:mm') : '-'}</span>
        ),
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
        dataIndex: 'plan_id',
        key: 'plan_id',
        width: '25%',
        render: (plan_id: string, data: PlanInfo) => renderOperation(plan_id, data),
      },
    ];

    return (
      <Spin spinning={loading}>
        <Table
          dataSource={planList}
          columns={columns}
          rowKey="plan_id"
          pagination={{
            current: current,
            pageSize: pageSize,
            onChange: handlePageChange,
            total: totalPage,
            hideOnSinglePage: true,
          }}
        />
      </Spin>
    );
  };

  return (
    <div className={styles.container}>
      <Card>
        <header>
          <Select
            value={action}
            style={{ width: '150px' }}
            onChange={handleChangeAction}
            placeholder="请选择运行环境"
          >
            <Option value="all" key="all">
              全部
            </Option>
            <Option value="cron" key="cron">
              定时任务
            </Option>
          </Select>

          <Search
            placeholder="搜索plan"
            defaultValue={defaultvalue}
            onSearch={handleSearchClick}
            style={{ width: 300, marginRight: '20px' }}
          />
          <Button type="primary" onClick={() => jumpCreatePage()}>
            创建Plan
          </Button>
        </header>
        <section>
          <PlanTable />
        </section>
      </Card>

      {
        <Modal
          title="运行设置"
          visible={runModal}
          maskClosable={false}
          onOk={handleRunPlan}
          onCancel={() => setRunModal(false)}
        >
          <div className={styles.runModal}>
            <h4>运行环境：</h4>
            <Select
              style={{ width: '100%' }}
              value={planRunEnv}
              onChange={(value: string) => setPlanRunEnv(value)}
              placeholder="请选择运行环境"
            >
              {Object.keys(EENVIRONMENT_TYPE).map(item => (
                <Option value={EENVIRONMENT_TYPE[item]} key={item}>
                  {ENVIRONMENT_TYPE[item]}
                </Option>
              ))}
            </Select>
          </div>
        </Modal>
      }
    </div>
  );
};

const mapStateToProps = ({ global }: ConnectState) => {
  return {
    roterHistoryList: global.roterHistoryList,
  };
};

export default withRouter(connect(mapStateToProps)(Plan));
