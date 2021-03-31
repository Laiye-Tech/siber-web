import React, { useState, useEffect } from 'react'
import withRouter from 'umi/withRouter';
import { Button, Input, Row, Col, Card, message } from 'antd';
import { connect } from 'dva'

import { dispatchBreadCrumbs } from '@/utils/utils'
import { manageEnv } from '../services';
import { ManageMode } from '@/services/interface';

import {
  EnvInfo,
  ENV_GRPC_TYPE,
  ENV_HTTP_TYPE
} from '../interface';

import SecretSetting from '../components/SecretSetting'
import styles from './index.less';

type Props = {
  location: any;
}

const PlanDetail: any = (props: Props) => {
  const envId = props.location.query.envId ? props.location.query.envId : ''
  /** 保存时的参数 */
  const [params, setParams] = useState<EnvInfo>({env_name: '', env_mode: 'interface', grpc: {}, http: {}})
  /** 编辑/创建 */
  const [type, setType] = useState<string>('')
  const [configData, setConfigData] = useState<any>(null)

  useEffect(() => { inintDate(envId) },[]);

   /** 全部envList */
   const envGrpcList = [
    'dev_envoy',
    'test_envoy',
    'stage_envoy',
    'prod_envoy'
   ]

   const envHttpList = [
    'dev_url',
    'test_url',
    'stage_url',
    'prod_url'
   ]

  /**
   * 初始化数据
   */
  const inintDate = async (envId: string) => {
    const { location, dispatch } = props

    if (envId) {
      const idParams = {
        env_id: envId
      };

      const { data, success, errmsg }: any = await manageEnv(ManageMode.QUERY, idParams);

      if (!success) {
        message.error(errmsg);
        return false;
      }

      const initParams: EnvInfo =  {
        env_name: data.env_name,
        grpc: data.grpc ? data.grpc : {},
        http: data.http ? data.http : {}
      }

      dispatchBreadCrumbs(dispatch, [data.env_name])
      setParams(initParams)

      setConfigData(data.secret_list ? data.secret_list : null)
    }
    setType(location.state && location.state.type ? location.state.type : '')
  };

  /**
   * 输入框输入时
   */
  const onInputChange = (item: any) => (e: any) => {
    const checkedParams = {...params}

    // envoy的是grpc url的是http
    if (item.indexOf('envoy') > -1) {
      checkedParams.grpc[item] = e.target.value
      setParams(checkedParams)
    }

    if (item.indexOf('url') > -1) {
      checkedParams.http[item] = e.target.value
      setParams(checkedParams)
    }
  }

  const formatItem = (data: any) => {
    const obj = {}
    data.key.map((item, index) => {
      if (item && data.value[index]) {
        obj[item] =  data.value[index]
      }
    })
    return obj
  }

  /**
   * 格式化成对象
   */
  const formatConfigData = (configList) => {
    const secret_list = configList.map(item => {
      const config: any = {
        secret_name: '',
        secret_info: {
          dev_secret: {},
          test_secret: {},
          stage_secret: {},
          prod_secret: {}
        }
      }
      config.secret_name = item.name
      config.type = item.type
      config.secret_info.dev_secret = formatItem(item.dev)
      config.secret_info.test_secret = formatItem(item.test)
      config.secret_info.stage_secret = formatItem(item.stage)
      config.secret_info.prod_secret = formatItem(item.prod)

      return config

    })
    return secret_list
  }

  /**
   * 保存/创建
   */
  const handleSubmit = async() => {
    const { location } = props;

    const list:any = {}
    if (params && params.grpc) {
      Object.assign(list, params.grpc)
    }
    if (params && params.http) {
      Object.assign(list, params.http)
    }

    if (!params.env_name.trim()) {
      message.error('配置名称必填！');
      return false;
    }

    if (params.env_name.indexOf('#') !== -1) {
      message.error('配置名称中不可含有非法字符"#"！');
      return false;
    }

    if (type === 'edit') {
      params.env_id = location.query.envId;
      params.insert_time = location.state && location.state.insert_time ? location.state.insert_time : 0;
      params.env_mode = 'interface'
    }

    if (configData && configData.length) {
          // 应用配置信息
      params.secret_list = configData.map(item => {
        delete item.type
        return item
      })
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

  const setConfig = (config: any) => {
     setConfigData(formatConfigData(config))
  }

  return (
    <div className={styles.container}>
      <Button type="primary" className={styles.btn} onClick={handleSubmit}>
        {type ? `保存` : `创建`}
      </Button>
      <div className={styles.row}>
        <Row type="flex" justify="space-around" align="middle">
          <Col span={20}>
            <Card title="环境配置" bordered={false}>
              <dl>
                <dt>配置名称：</dt>
                <dd>
                  <Input
                    placeholder="配置名称"
                    value={params.env_name}
                    disabled={type === 'edit'}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({...params, env_name: e.target.value})}
                    style={{ width: '100%' }}
                  />
                </dd>
              </dl>
              <div className={styles.flexBox}>
                <p className={styles.flexP}>gRpc</p>
                <div style={{width: '100%'}}>
                  {envGrpcList && envGrpcList.length ? envGrpcList.map((item, idx) => (
                    <dl key={idx}>
                      <dt>{`${ENV_GRPC_TYPE[item]}配置地址:`}</dt>
                      <dd>
                        <Input
                          placeholder="配置地址"
                          value={params.grpc[item]}
                          onChange={onInputChange(item)}
                          style={{ width: '100%' }}
                        />
                      </dd>
                    </dl>
                  )) : null}
                </div>
              </div>

              <div className={styles.flexBox}>
                <p className={styles.flexP}>HTTP</p>
                <div style={{width: '100%'}}>
                  {envHttpList && envHttpList.length ? envHttpList.map((item, idx) => (
                    <dl key={idx}>
                      <dt>{`${ENV_HTTP_TYPE[item]}配置地址:`}</dt>
                      <dd>
                        <Input
                          placeholder="配置地址"
                          value={params.http[item]}
                          onChange={onInputChange(item)}
                          style={{ width: '100%' }}
                        />
                      </dd>
                    </dl>
                  )) : null}
                </div>
              </div>
            </Card>

            {<SecretSetting setConfigData={setConfig} configData={configData}/>}
          </Col>
        </Row>
      </div>
    </div>
  );

}

export default withRouter(connect()(PlanDetail))
