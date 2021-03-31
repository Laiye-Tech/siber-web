import React, { useState, useEffect } from 'react'
import withRouter from 'umi/withRouter';
import { Button, Input, Row, Col, Card, message, Select } from 'antd';

import { manageEnv } from './services';
import { ManageMode } from '@/services/interface';

import {
  EnvInstance,
  EnvInfoInstance
} from './interface';

import styles from './detail/index.less';
const { Option } = Select


type Props = {
  location: any;
}

const PlanDetail: any = (props: Props) => {
  const envId = props.location.query.envId ? props.location.query.envId : ''
  /** 保存时的参数 */
  const [params, setParams] = useState<EnvInstance>({env_name: '', env_mode: 'instance', instance: {instance_type: 'mysql'} })
  /** 编辑/创建 */
  const [type, setType] = useState<string>('')

  useEffect(() => { inintDate(envId) },[]);

  /**
   * 初始化数据
   */
  const inintDate = async (envId: string) => {
    const { location } = props

    if (envId) {
      const idParams = {
        env_id: envId
      };

      const { data, success, errmsg }: any = await manageEnv(ManageMode.QUERY, idParams);

      if (!success) {
        message.error(errmsg);
        return false;
      }

      const initParams: EnvInfoInstance =  {
        env_name: data.env_name,
        instance: data.instance
      }
      setParams(initParams)
    }
    setType(location.state && location.state.type ? location.state.type : '')

  };

  /**
   * 输入框输入时
   */
  const onInputChange = (item: any) => (e: any) => {
    const checkedParams = {...params}
    checkedParams.instance[item] = e.target.value
    setParams(checkedParams)
  }

  /**
   * 下拉框选择
   */
  const onSelectChange = (item: string) => (value: string) => {
    const checkedParams = {...params}
    checkedParams.instance[item] = value
    setParams(checkedParams)
  };

  /**
   * 保存/创建
   */
  const handleSubmit = async() => {
    const { location } = props;
    const regNumber = /^[0-9]*$/

    if (!params.env_name || !params.instance.host || !params.instance.port || !params.instance.db || !params.instance.user || !params.instance.password || !params.instance.charset) {
      message.error('配置项均为必填！');
      return false;
    }

    if (params.instance.port && (!regNumber.test(params.instance.port))) {
      message.error(`${params.instance.port}不合法，请输入数字!`)
      return false;
    }

    if(params.instance.port && typeof(params.instance.port) === 'string') {
      params.instance.port = parseInt(params.instance.port, 10)
    }

    if (type === 'edit') {
      params.env_id = location.query.envId;
      params.env_mode = 'instance'
    }

    const { errmsg, success, data }: any = await manageEnv(
      type === 'edit' ? ManageMode.UPDATE : ManageMode.CREATE,
      params
    );

    if (!success) {
      message.error(errmsg);
      return false;
    }
    message.success(type ? '保存成功' : '创建成功');
    inintDate(data.env_id)
  }

  return (
    <div className={styles.container}>
      <Button type="primary" className={styles.btn} onClick={handleSubmit}>
        {type ? `保存` : `创建`}
      </Button>
      <div className={styles.row}>
        <Row type="flex" justify="space-around" align="middle">
          <Col span={20}>
            <Card title="instance环境配置" bordered={false}>
              <dl>
                <dt>配置名称:</dt>
                <dd>
                  <Input
                    placeholder="配置名称"
                    value={params.env_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({...params, env_name: e.target.value})}
                    style={{ width: '100%' }}
                  />
                </dd>
              </dl>
              <dl>
                <dt>instance_type:</dt>
                <dd>
                  <Select
                    style={{width: '100%'}}
                    defaultValue='MySql'
                  >
                    <Option key={'MySql'}>MySql</Option>
                  </Select>
                </dd>
              </dl>
              <Row>
                <Col span={24}>
                  <dl>
                    <dt>host:</dt>
                    <dd>
                      <Input
                        placeholder="host"
                        value={params.instance && params.instance.host ? params.instance.host : ''}
                        onChange={onInputChange('host')}
                        style={{ width: '100%' }}
                      />
                    </dd>
                  </dl>
                </Col>
                <Col span={24}>
                  <dl>
                    <dt>port:</dt>
                    <dd>
                      <Input
                        placeholder="port"
                        value={params.instance && params.instance.port ? params.instance.port : ''}
                        onChange={onInputChange('port')}
                        style={{ width: '100%' }}
                      />
                    </dd>
                  </dl>
                </Col>
                <Col span={24}>
                  <dl>
                    <dt>db:</dt>
                    <dd>
                      <Input
                        placeholder="db"
                        value={params.instance && params.instance.db ? params.instance.db : ''}
                        onChange={onInputChange('db')}
                        style={{ width: '100%' }}
                      />
                    </dd>
                  </dl>
                </Col>
                <Col span={24}>
                  <dl>
                    <dt>user:</dt>
                    <dd>
                      <Input
                        placeholder="user"
                        value={params.instance && params.instance.user ? params.instance.user : ''}
                        onChange={onInputChange('user')}
                        style={{ width: '100%' }}
                      />
                    </dd>
                  </dl>
                </Col>
                <Col span={24}>
                  <dl>
                    <dt>password:</dt>
                    <dd>
                      <Input
                        placeholder="password"
                        type="password"
                        value={params.instance && params.instance.password ? params.instance.password : ''}
                        onChange={onInputChange('password')}
                        style={{ width: '100%' }}
                      />
                    </dd>
                  </dl>
                </Col>
                <Col span={24}>
                  <dl>
                    <dt>charset:</dt>
                    <dd>
                    <Select
                      style={{width: '100%'}}
                      value={params.instance && params.instance.charset ? params.instance.charset : ''}
                      onChange={onSelectChange('charset')}
                    >
                      <Option key={'utf8'}>utf8</Option>
                      <Option key={'utf8mb4'}>utf8mb4</Option>
                    </Select>
                    </dd>
                  </dl>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );

}

export default withRouter(PlanDetail)
