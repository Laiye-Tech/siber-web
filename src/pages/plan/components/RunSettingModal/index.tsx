/**
 * 渲染 -请求头- 模块
 */
import React, { useState, useEffect } from 'react';
import { Select, Modal, Input, message } from 'antd';

import { listProcessNameList } from '@/pages/enforce/services/index';

import { EENVIRONMENT_TYPE, ENVIRONMENT_TYPE } from '../../interface';
import styles from './index.less';

const { Option } = Select;

type Props = {
  trigger_condition: any;
  planService: string[];
  triggerConditionItem: any;
  handleRunSetting: (visible: boolean) => () => void;
  setModalParams: (params: any) => void;
};

const RunSettingModal = (props: Props) => {
  const {
    handleRunSetting,
    triggerConditionItem,
    setModalParams,
    trigger_condition,
    planService,
  } = props;
  const envNameList = trigger_condition.length
    ? trigger_condition.map(item => item.environment_name)
    : [];

  const [projectList, setProjectList] = useState<string[]>([]);
  const [env, setEnv] = useState<string | undefined>('');
  const [time, setTime] = useState<string>('');
  const [processNameList, setProcessNameList] = useState<any>(null);

  useEffect(() => {
    // 初始化
    setEnv(triggerConditionItem.environment_name);
    setTime(triggerConditionItem.trigger_cron);
    setProjectList(triggerConditionItem.trigger_service_list);
    getProcessNameList();
  }, []);

  const getProcessNameList = async () => {
    const { success, data, errmsg }: any = await listProcessNameList();
    if (!success) {
      message.error(errmsg);
      return false;
    }

    setProcessNameList(data.process_name ? [...data.process_name] : []);
  };

  const handleCancel = () => {
    handleRunSetting(false)();
  };

  const handleOk = () => {
    // 进行数据校验
    if (!env) {
      message.error('运行环境必选！');
      return false;
    }

    if (!time && !projectList.length) {
      message.error('触发方式必选一种！');
      return false;
    }

    setModalParams({
      environment_name: env,
      trigger_cron: time,
      trigger_service_list: projectList,
    });
  };

  const handleEnvSetting = (value: string) => {
    let _projectList = [...projectList];

    // 一个环境只能创建一次
    if (envNameList.includes(value)) {
      message.error('此环境已存在运行配置，不可重复配置');
      return false;
    }

    if (value === EENVIRONMENT_TYPE['TEST']) {
      _projectList = _projectList.concat(planService);
    } else {
      _projectList = triggerConditionItem.trigger_service_list;
    }

    setProjectList(_projectList);
    setEnv(value);
  };

  return (
    <Modal
      title="运行配置"
      visible={true}
      maskClosable={false}
      onOk={handleOk}
      onCancel={handleCancel}
      className={styles.modalContainer}
    >
      <dl>
        <dt>运行环境：</dt>
        <dd>
          <Select value={env} onChange={handleEnvSetting} placeholder="请选择运行环境">
            {Object.keys(EENVIRONMENT_TYPE).map(item => (
              <Option value={EENVIRONMENT_TYPE[item]} key={item}>
                {ENVIRONMENT_TYPE[item]}
              </Option>
            ))}
          </Select>
        </dd>
      </dl>

      <dl>
        <dt>定时触发：</dt>
        <dd>
          <Input
            placeholder="* * * * * ?"
            value={time}
            onChange={(e: any) => setTime(e.target.value)}
          />
        </dd>
      </dl>

      <dl>
        <dt>服务发布触发：</dt>
        <dd>
          <Select
            showSearch={true}
            mode="tags"
            placeholder="选择服务"
            value={projectList}
            onChange={(value: string[]) => setProjectList(value)}
          >
            {processNameList
              ? processNameList.map(item => (
                  <Option value={item} key={item}>
                    {item}
                  </Option>
                ))
              : null}
          </Select>
        </dd>
      </dl>
    </Modal>
  );
};

export default RunSettingModal;
