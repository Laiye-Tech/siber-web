import React, { useState, useEffect } from 'react';
import withRouter from 'umi/withRouter';
import router from 'umi/router';
import { connect } from 'dva';
import {
  Button,
  Transfer,
  Select,
  Input,
  Row,
  Col,
  Card,
  message,
  Divider,
  Tag,
  Radio,
  Cascader,
  Tooltip
} from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { dispatchBreadCrumbs } from '@/utils/utils';
import { randomRange } from '@/utils/constans';
import { listFlow } from '@/pages/flow/services';
import { caseEnvList } from '../../case/services';
import { managePlan, getPlanVersionList } from '../services';
import { ManageMode } from '@/services/interface';
import { FlowInfo } from '../../flow/interface';
import { EINTERFACE_TYPE, PlanInfo, ENVIRONMENT_TYPE, INTERFACE_TYPE } from '../interface';

import RunSettingModal from '../components/RunSettingModal';

import styles from './index.less';

const { Option } = Select;

type Props = {
  location: any;
};

type TransferItem = {
  key: string;
  title: string;
};

const trigger_condition_item = {
  environment_name: '',
  trigger_cron: '',
  trigger_service_list: [],
};

const initParams = {
  interface_type: INTERFACE_TYPE.HTTP,
  environment_id: '',
  env_name: '',
  trigger_condition: [],
  threads: 0,
};

const PlanDetail: any = (props: Props) => {
  const planId = props.location.query.planId ? props.location.query.planId : '';

  /** 保存时的参数 */
  const [params, setParams] = useState<PlanInfo>(initParams);
  /** 编辑/创建 */
  const [type, setType] = useState<string>('');
  /** plan初始名称 */
  const [initName, setInitName] = useState<string>('');
  /** 全部flowList */
  const [flowList, setFlowList] = useState<TransferItem[]>([]);
  /** 选中的flow列表 */
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  /** plan版本列表 */
  const [planVersionList, setPlanVersionList] = useState<string[]>([]);
  /** pla版本 */
  const [planVersion, setPlanVersion] = useState<string>('');
  /** 协议名称列表 */
  const [envNameList, setEnvNameList] = useState<any[]>([]);
  /** 打开环境配置modal */
  const [runSetting, setRunSetting] = useState<boolean>(false);
  /** 哪一个运行配置 \-1代表创建*/
  const [planTriggerIndex, setPlanTriggerIndex] = useState<number>(-1);
  /** 服务列表*/
  const [planService, setPlanService] = useState<string[]>([]);

  useEffect(() => {
    getpPlanDetail(planId);
  }, []);
  useEffect(() => {
    handleCaseEnv();
  }, []);
  useEffect(() => {
    toGetPlanVersionList();
  }, []);
  useEffect(() => {
    getFlowList();
  }, []);

  /**
   * 获取初始数据
   */
  const getpPlanDetail = async (planId: string) => {
    if (planId) {
      const params = {
        plan_id: planId,
      };

      const { data, success, errmsg }: any = await managePlan(ManageMode.QUERY, params);
      if (!success) {
        message.error(errmsg);
        return false;
      }

      data && inintDate(data, 'origin');
    }
  };

  /**
   * 初始化数据
   * @params tag 表示初始化or保存
   */
  const inintDate = (data: any, tag: string) => {
    const { location, dispatch } = props;

    const planName =
      data.plan_name && location.query.type === 'copy' && tag === 'origin'
        ? `${data.plan_name}_${randomRange(6)}`
        : data.plan_name;

    const initParams: PlanInfo = {
      plan_name: planName,
      trigger_condition: data.trigger_condition || [],
      interface_type: data.interface_type || INTERFACE_TYPE.HTTP,
      environment_name: data.environment_name || ENVIRONMENT_TYPE.TEST,
      environment_id: data.env_info?.env_id || '',
      insert_time: data.insert_time || 0,
      // 如果此env被删除、默认展示envId、根据invalid_date是否为0判断
      // invalid_date不存在或者为0则为未删除
      env_name: data.env_info?.invalid_date
        ? `（已删除）${data.env_info?.env_id}`
        : data.env_info?.env_name || '',
      threads: data?.threads || 0,
    };

    dispatchBreadCrumbs(dispatch, [planName]);

    setInitName(data.plan_name);
    setTargetKeys(data.flow_list || []);
    setParams(initParams);
    setPlanVersion(data.version_control || '');
    setPlanService(data.services || []);

    setType(location.query?.type ? location.query.type : '');
  };

  /**
   * 获取env列表
   */
  const handleCaseEnv = async () => {
    const params = {
      content: '',
      page: '1',
      page_size: '20',
      method: 'interface',
    };
    const { data, success, errmsg }: any = await caseEnvList(params);
    if (!success) {
      message.error(errmsg);
      return;
    }

    setEnvNameList(data?.env_list || []);
  };

  /**
   * 获取plan版本
   */
  const toGetPlanVersionList = async () => {
    const { location } = props;
    const { success, data, errmsg }: any = await getPlanVersionList();
    if (!success) {
      message.error(errmsg);
      return false;
    }

    const cascaderList = data?.iteration_list
      ? data?.iteration_list.map(iterationItem => {
          return {
            value: iterationItem.project_name,
            label: iterationItem.project_name,
            children: iterationItem.history_iterations.map(item => {
              return {
                value: item,
                label: item,
              };
            }),
          };
        })
      : [];

    setPlanVersionList(cascaderList);
  };

  /**
   * 获取flow列表
   */
  const getFlowList = async () => {
    const { success, data, errmsg }: any = await listFlow({
      filter_content: { page_size: '1000' },
    });

    if (!success) {
      message.error(errmsg);
      return false;
    }

    const tempFlowList = data?.flow_info_list || [];

    const flowList: TransferItem[] = tempFlowList.map((item: FlowInfo) => {
      return {
        title: item.flow_name,
        key: item.flow_id,
      }
    });

    setFlowList(flowList);
  };

  /**
   * 保存
   */
  const handleSubmit = async () => {
    const { location } = props;

    if (!params.plan_name || !params.plan_name.trim()) {
      message.error('plan名称必填！');
      return false;
    }

    if (!targetKeys.length) {
      message.error('至少设置一个flow！');
      return false;
    }

    if (!params.environment_id) {
      message.error('必须选择一个环境配置！');
      return false;
    }

    params.flow_list = targetKeys;
    if (type === 'edit') {
      params.plan_id = location.query.planId;
    }

    params.version_control = planVersion;
    params.services = planService;

    delete params.env_name;
    // 对空数据进行处理
    for (var key in params) {
      if (
        (typeof params[key] != 'number' && !params[key]) ||
        (typeof params[key] === 'object' && !Object.keys(params[key]).length)
      ) {
        delete params[key];
      }
    }

    if (type === 'copy') {
      params.insert_time ? delete params.insert_time : null;
    }

    const { errmsg, success, data }: any = await managePlan(
      type === 'edit' ? ManageMode.UPDATE : ManageMode.CREATE,
      params,
    );

    if (!success) {
      message.error(errmsg);
      return false;
    }
    message.success(type ? '保存成功' : '创建成功');

    if (type !== 'edit') {
      router.push({
        pathname: '/plan',
      });
    }

    inintDate(data, 'save');
  };

  const handleRunSetting = (visible: boolean) => () => {
    setRunSetting(visible);
  };

  const handleEditSetting = (index: number) => () => {
    setPlanTriggerIndex(index);
    setRunSetting(true);
  };

  const handleDeleteSetting = (index: number) => () => {
    params.trigger_condition.splice(index, 1);
    setParams(JSON.parse(JSON.stringify(params)));
  };

  /**
   * 运行配置参数设置
   */
  const setModalParams = (modalParams: any) => {
    if (planTriggerIndex >= 0) {
      params.trigger_condition[planTriggerIndex] = JSON.parse(JSON.stringify(modalParams));
    } else {
      params.trigger_condition.push(modalParams);
    }

    setParams(JSON.parse(JSON.stringify(params)));
    setRunSetting(false);
  };

  const onThreadsChange = e => {
    params.threads = e.target.value;
    setParams(JSON.parse(JSON.stringify(params)));
  };

  const filterOption = (inputValue, option) => option.title.indexOf(inputValue) > -1;

  const handlePlanVersionChange = (value: string[]) => {
    setPlanVersion(value[1]);
  };

  const displayRender = label => label.join('');

  return (
    <div className={styles.container}>
      <Button type="primary" className={styles.btn} onClick={handleSubmit}>
        {type ? `保存` : `创建`}
      </Button>
      <div className={styles.row}>
        <Row type="flex" justify="space-around" align="middle">
          <Col span={20}>
            <Card title="基础设置" bordered={false}>
              <dl>
                <dt>Plan名称：</dt>
                <dd>
                  <Input
                    placeholder="plan名称"
                    value={params.plan_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setParams({ ...params, plan_name: e.target.value })
                    }
                    style={{ width: '100%' }}
                  />
                </dd>
              </dl>

              <dl>
              <dt>Plan版本：
                <Tooltip title="运行不高于此版本的最高版本">
                 <QuestionCircleOutlined />
                </Tooltip>
                </dt>
                <dd>
                  <Cascader
                    value={[planVersion, '']}
                    options={planVersionList}
                    onChange={handlePlanVersionChange}
                    placeholder="选择plan版本"
                    displayRender={displayRender}
                  />
                </dd>
              </dl>

              <dl>
                <dt>接口类型：</dt>
                <dd>
                  <Select
                    value={params.interface_type}
                    onChange={(value: string) => setParams({ ...params, interface_type: value })}
                  >
                    <Option value={EINTERFACE_TYPE.HTTP}>{INTERFACE_TYPE.HTTP}</Option>
                    <Option value={EINTERFACE_TYPE.GRPC}>{INTERFACE_TYPE.GRPC}</Option>
                  </Select>
                </dd>
              </dl>

              <dl>
                <dt>环境配置：</dt>
                <dd>
                  <Select
                    style={{ width: '100%' }}
                    value={params.env_name}
                    onChange={(value: string, key: any) =>
                      setParams({ ...params, environment_id: key.key, env_name: value })
                    }
                  >
                    {envNameList.map(value => (
                      <Option key={value.env_id} value={value.env_name}>
                        {value.env_name}
                      </Option>
                    ))}
                  </Select>
                </dd>
              </dl>

              <dl>
                <dt>执行顺序：</dt>
                <dd>
                  <Radio.Group onChange={onThreadsChange} value={params.threads}>
                    <Radio value={0}>并发执行</Radio>
                    <Radio value={1}>顺序执行</Radio>
                  </Radio.Group>
                </dd>
              </dl>

              {planId && planService.length ? (
                <dl>
                  <dt>服务名称：</dt>
                  <dd>
                    {planService.map(item => (
                      <Tag color="default">{item}</Tag>
                    ))}
                  </dd>
                </dl>
              ) : null}

              <Divider />

              <div>
                <Button type="primary" onClick={handleEditSetting(-1)}>
                  <PlusOutlined />
                  运行配置
                </Button>

                {params.trigger_condition && params.trigger_condition.length
                  ? params.trigger_condition.map((item: any, index: number) => (
                      <div className="run-setting">
                        <dt className="run-env">
                          运行环境：<span>{ENVIRONMENT_TYPE[item.environment_name]}</span>
                        </dt>
                        <dt className="run-time">
                          定时触发：<span>{item.trigger_cron}</span>
                        </dt>
                        <dt className="run-service">
                          服务发布触发：
                          {item.trigger_service_list &&
                            item.trigger_service_list.map((item: string) => (
                              <Tag className="run-service-span" color="#2db7f5">
                                {item}
                              </Tag>
                            ))}
                        </dt>
                        <a className="run-setting-edit" onClick={handleEditSetting(index)}>
                          编辑
                        </a>
                        <a onClick={handleDeleteSetting(index)}>删除</a>
                      </div>
                    ))
                  : null}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <div className={styles.row}>
        <Row type="flex" justify="space-around" align="middle">
          <Col span={20}>
            <Card title="Flow列表" bordered={false}>
              <Transfer
                dataSource={flowList}
                showSearch={true}
                targetKeys={targetKeys}
                onChange={(targetKeys: string[]) => setTargetKeys(targetKeys)}
                render={item => <span>{item.title}</span>}
                className={styles.transfer}
                filterOption={filterOption}
                locale={{
                  itemUnit: '项flow',
                  itemsUnit: '项flow',
                  searchPlaceholder: '搜索flow',
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {runSetting && (
        <RunSettingModal
          handleRunSetting={handleRunSetting}
          planService={planService}
          triggerConditionItem={
            planTriggerIndex < 0
              ? trigger_condition_item
              : params.trigger_condition[planTriggerIndex]
          }
          setModalParams={setModalParams}
          trigger_condition={params.trigger_condition}
        />
      )}
    </div>
  );
};

export default withRouter(connect()(PlanDetail));
