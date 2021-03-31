import React, { useState, useEffect } from 'react';

import { Drawer, Button, Select, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { ManageMode } from '@/services/interface';

import { manageProcess } from '../../services';

const { Option } = Select;
import styles from './index.styles.less';

const DrawerForm = (props: any) => {
  const {
    visible,
    processDetail,
    processNameList,
    planList,
    setDrawVisible,
    getProcessList,
  } = props;

  const defaultDetail = {
    process_name: '',
    plan_info: [
      {
        plan_name: '',
        plan_id: '',
      },
    ],
  };

  const [detail, setDetail] = useState<any>({ ...defaultDetail });
  useEffect(() => {
    if (setDrawVisible) {
      setDetail(processDetail ? { ...processDetail } : { ...defaultDetail });
    }
  }, [processDetail, setDrawVisible]);

  // 添加一组plan
  const addPLan = () => {
    const _planList = detail.plan_info ? [...detail.plan_info] : [];

    _planList.push({
      plan_id: '',
      plan_name: '',
    });

    detail.plan_info = [..._planList];
    setDetail({ ...detail });
  };

  const handleProcessChange = value => {
    detail.process_name = value;
    setDetail({ ...detail });
  };

  const handlePlanNameChange = index => value => {
    const _planList = [...detail.plan_info];
    // 不能添加重复的plan
    const res = _planList.filter(item => item.plan_id === value);

    if (res.length) {
      message.error('不能添加重复plan');
      return false;
    }

    _planList[index].plan_id = value;
    setDetail({ ...detail });
  };

  const handlePlanDelete = index => () => {
    const _planList = [...detail.plan_info];

    if (_planList.length <= 1) {
      message.error('plan列表至少选择一项');
      return false;
    }

    _planList.splice(index, 1);

    detail.plan_info = [..._planList];

    setDetail({ ...detail });
  };

  const submit = async () => {
    const process_info = {};
    const isCreate = !detail.process_plan_id;
    let _plan_info = [];

    // 校验数据
    if (!detail.process_name.trim()) {
      message.error('process名称必选');
      return false;
    }

    process_info.process_name = detail.process_name;

    if (detail.plan_info) {
      _plan_info = detail.plan_info
        .map(item => {
          return {
            plan_id: item.plan_id,
          };
        })
        .filter(item => item.plan_id);
    }

    if (!_plan_info.length) {
      message.error('plan列表至少选择一项');
      return false;
    }

    process_info.plan_info = [..._plan_info];

    if (!isCreate) {
      process_info.process_plan_id = detail.process_plan_id;
    }

    const { success, data, errmsg }: any = await manageProcess(
      isCreate ? ManageMode.CREATE : ManageMode.UPDATE,
      process_info,
    );

    if (!success) {
      message.error(errmsg);
      return false;
    }

    message.success(`${isCreate ? '创建' : '修改'} 成功`);
    getProcessList();
    setDrawVisible();
  };

  return (
    <Drawer
      title={`${detail && detail.process_plan_id ? '编辑' : '新建'}process`}
      width={560}
      onClose={setDrawVisible}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div
          style={{
            textAlign: 'right',
          }}
        >
          <Button onClick={setDrawVisible} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button onClick={submit} type="primary">
            保存
          </Button>
        </div>
      }
    >
      <dl className={styles.detailDl}>
        <dt className={styles.detailDt}>process名称：</dt>
        <dd className={styles.detailDd}>
          <Select
            value={detail && detail.process_name ? detail.process_name : ''}
            style={{ width: '100%' }}
            onChange={handleProcessChange}
            showSearch={true}
            filterOption={(input, option) => option.children.indexOf(input) > -1}
          >
            {processNameList && processNameList.length
              ? processNameList.map(item => (
                  <Option value={item} key={item}>
                    {item}
                  </Option>
                ))
              : null}
          </Select>
        </dd>
      </dl>

      <dl className={styles.detailDl}>
        <dt className={styles.detailDt}>plan列表：</dt>
        {detail?.plan_info?.length
          ? detail.plan_info.map((item, index) => (
              <dd className={styles.detailDd} key={item.plan_id}>
                <Select
                  key={item.plan_id}
                  value={item.plan_id}
                  style={{ width: '100%', marginRight: '10px' }}
                  showSearch={true}
                  onChange={handlePlanNameChange(index)}
                  filterOption={(input, option) => option.children.indexOf(input) > -1}
                >
                  {planList && planList.length
                    ? planList.map(planItem => (
                        <Option value={planItem.plan_id} key={planItem.plan_id}>
                          {planItem.plan_name}
                        </Option>
                      ))
                    : null}
                </Select>
                <CloseOutlined onClick={handlePlanDelete(index)} />
              </dd>
            ))
          : null}
      </dl>

      <dl className={styles.addBtn}>
        <Button type="dashed" style={{ width: '300px', margin: '0 auto' }} onClick={addPLan}>
          添加plan
        </Button>
      </dl>
    </Drawer>
  );
};

export default DrawerForm;
