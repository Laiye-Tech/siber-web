import React, { useState, useEffect } from 'react';
import router from 'umi/router';
import { connect } from 'dva';

import { Button, Table, Card, message, Modal, Input, Spin, Tag, Tooltip, Select } from 'antd';

import { ManageMode } from '@/services/interface';
import { ConnectState } from '@/model/connect';

import { listProcess, listProcessNameList, manageProcess, listProcessPlanLog } from './services';
import { listPlan } from '../../pages/plan/services/index';

import DrawerForm from './components/ProcessDetail';

import styles from './index.less';

const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

const pageSize = 20;

const setDefaultvalue = (props: any) => {
  const { roterHistoryList }: any = props;
  if (roterHistoryList) {
    const length = roterHistoryList.length;
    const history = roterHistoryList[length - 2];
    // 如果前一步是编辑
    if (history && history.pathname === '/enforce/log') {
      return true;
    }

    return false;
  }
};

const Enforce: React.FC = props => {
  const isSetDefaultvalue = setDefaultvalue(props);
  // 搜索的默认值
  let defaultvalue = isSetDefaultvalue ? window.sessionStorage.getItem('processSerchValue') : '';

  const [processList, setProcessList] = useState([]);
  const [planLogList, setPlanLogList] = useState([]);
  const [tag, setTag] = useState('');
  const [searchValue, setSearchValue] = useState<string>(defaultvalue);
  const [processName, setProcessName] = useState('');
  const [planList, setPlanList] = useState([]);
  const [drawVisible, setDrawVisible] = useState(false);

  const [logVisible, setLogVisible] = useState(false);
  const [current, setCurrent] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [processDetail, setProcessDetail] = useState<any>(null);
  const [processNameList, setProcessNameList] = useState<any>(null);

  useEffect(() => {
    getProcessList();
  }, [current, searchValue]);

  useEffect(() => {
    getProcessNameList();
    getPlanList();
  }, []);

  const getPlanList = async () => {
    const params = { content: '', page: `1`, page_size: `1500` };

    const { success, data, errmsg }: any = await listPlan({ filter_content: params });

    if (!success) {
      message.error(errmsg);
      return false;
    }

    setPlanList(data?.plan_info_list ? [...data.plan_info_list] : []);
  };

  const getProcessNameList = async () => {
    const { success, data, errmsg }: any = await listProcessNameList();
    if (!success) {
      message.error(errmsg);
      setLoading(false);
      return false;
    }

    setProcessNameList(data.process_name ? [...data.process_name] : []);
  };

  /**
   * 获取 process 列表
   */
  const getProcessList = async () => {
    setLoading(true);
    const params = { content: searchValue, page: `${current}`, page_size: `${pageSize}` };
    const { success, data, errmsg }: any = await listProcess({ filter_content: params });

    if (!success) {
      message.error(errmsg);
      setLoading(false);
      return false;
    }

    setLoading(false);

    setProcessList(data && data.process_plan_info ? [...data.process_plan_info] : []);
    setTotalPage(data ? data.total_num : null);
  };

  /**
   * 搜索process
   */
  const handleSearchClick = (value: string) => {
    window.sessionStorage.setItem('processSerchValue', value);
    setCurrent(1);
    setSearchValue(value);
  };

  /**
   * 删除 process
   */
  const handleProcessDelete = async (process_plan_id: string) => {
    const params = {
      process_plan_id,
    };

    const { success, errmsg }: any = await manageProcess(ManageMode.DELETE, params);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    message.success('删除成功');

    getProcessList();
  };

  const openDrawerForm = (processDetail: any) => () => {
    setProcessDetail({ ...processDetail });
    setDrawVisible(true);
  };

  const addProcess = () => {
    setProcessDetail(null);
    setDrawVisible(true);
  };

  const showConfirm = (id: string, name: string) => () => {
    confirm({
      title: '确认删除',
      content: `确认删除 ${name} 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleProcessDelete(id),
    });
  };

  const handlePlanLogVisible = (processDetail: any) => async () => {
    const { data } = await listProcessPlanLog(processDetail.process_name);
    setProcessName(processDetail.process_name);
    setPlanLogList(data?.log_info ? [...data.log_info] : []);
    setTag(data?.log_info?.length ? data.log_info[0].tag : '');

    if (!data?.log_info) {
      message.error('暂无数据，无法查看');
      return false;
    }

    setLogVisible(true);
  };

  const handleLookLog = () => {
    if (!tag) {
      message.error('tag必选');
      return false;
    }

    router.push({
      pathname: '/enforce/log',
      query: {
        tag,
        process_name: processName,
      },
    });
  };

  const renderOperation = (data: any) => (
    <div className={styles.operation}>
      <span onClick={openDrawerForm(data)}>编辑</span>
      <span onClick={handlePlanLogVisible(data)}>日志</span>
      <span onClick={showConfirm(data.process_plan_id, data.process_name)}>删除</span>
    </div>
  );

  /**
   * flow列表模块
   */
  const EnforceTable = () => {
    const columns = [
      {
        title: 'process名称',
        dataIndex: 'process_name',
        key: 'process_name',
        width: '25%',
        fixed: 'left',
      },
      {
        title: 'plan列表',
        dataIndex: 'process_plan_id',
        key: 'process_plan_id',
        render: (_, data) => (
          <div className={styles.planListBox}>
            {data.plan_info && data.plan_info.length
              ? data.plan_info.map(item => (
                  <Tooltip
                    title={item.plan_name.length > 15 ? item.plan_name : null}
                    key={item.plan_id}
                  >
                    <Tag>
                      {item.plan_name.length > 15
                        ? `${item.plan_name.slice(0, 15)}...`
                        : item.plan_name}
                    </Tag>
                  </Tooltip>
                ))
              : null}
          </div>
        ),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '25%',
        fixed: 'right',
        render: (_: string, data: any) => renderOperation(data),
      },
    ];

    return (
      <Spin spinning={loading}>
        <Table
          dataSource={processList}
          columns={columns}
          rowKey="process_plan_id"
          pagination={{
            current: current,
            pageSize: pageSize,
            onChange: page => setCurrent(page),
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
          <Button type="primary" onClick={addProcess}>
            添加 process
          </Button>
          <Search
            placeholder="搜索服务名"
            defaultValue={defaultvalue}
            onSearch={handleSearchClick}
            style={{ width: 200, marginRight: '20px' }}
          />
        </header>
        <section>{EnforceTable()}</section>
      </Card>

      <DrawerForm
        visible={drawVisible}
        processDetail={processDetail}
        processNameList={processNameList}
        getProcessList={getProcessList}
        planList={planList}
        setDrawVisible={() => setDrawVisible(false)}
      />

      <Modal
        title="查看plan日志"
        visible={logVisible}
        onOk={handleLookLog}
        onCancel={() => setLogVisible(false)}
      >
        <h4>选择tag：</h4>
        <Select
          placeholder="选择tag"
          value={tag}
          onChange={tag => setTag(tag)}
          style={{ width: '100%' }}
        >
          {planLogList.length
            ? planLogList.map(item => (
                <Option key={item.tag} value={item.tag}>
                  {item.tag}
                </Option>
              ))
            : null}
        </Select>
      </Modal>
    </div>
  );
};

const mapStateToProps = ({ global }: ConnectState) => {
  return {
    roterHistoryList: global.roterHistoryList,
  };
};

export default connect(mapStateToProps)(Enforce);
