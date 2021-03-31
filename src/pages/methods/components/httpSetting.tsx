import React, { useState, useEffect } from 'react'
import { Input, Card, Select, message } from 'antd';

import { MethodInfo, RequestMethodList, HttpMethodPre } from '../interface';
import { ManageMode } from '@/services/interface';
import { createMethod } from '../services';

import styles from '../detail/index.less'

const { Option } = Select;

type Props = {
  initHttpParams: MethodInfo,
  methodName: string,
  setHttpParams: (value: MethodInfo) => void
}

const httpSetting: any = (props: Props) => {
  const { initHttpParams, setHttpParams } = props

   /** http设置method名称的前缀*/
   const [httpMethodPre, setHttpMethodPre] = useState<string>(HttpMethodPre[0])
   /** http设置method名称的输入框*/
   const [httpMethodValue, setHttpMethodValue] = useState<string>('')

  useEffect(() => {
    props.methodName !== '' ? getHttpSetting() : null;
   },[]);

   /**
    * 获取http设置内容
    */
   const getHttpSetting = async () => {

    setHttpMethodPre(`${props.methodName.split('.')[0]}${props.methodName.split('.')[1]}`)
    setHttpMethodValue(`${props.methodName.split('.')[2]}`)

    const param = {
      method_name: props.methodName
    }

    const { success, data, errmsg }: any = await createMethod(ManageMode.QUERY, param);

    if (!success) {
      message.error(errmsg);
      return false
    }

    const initParams =  {
      http_request_mode: data.http_request_mode ? data.http_request_mode : '',
      http_uri: data.http_uri ? data.http_uri : '',
      method_name: data.method_name ? data.method_name : '',
      insert_time: data.insert_time ? data.insert_time : '',
      service: data.service ? data.service : ''
    }

    setHttpParams(initParams)
  }

return (
  <Card title="基础设置" bordered={false}>
    <dl>
      <dt>http请求方式： </dt>
      <dd>
        <Select
          showSearch={true}
          style={{ width: '100%' }}
          placeholder="请选择请求方式"
          value={initHttpParams.http_request_mode}
          onChange={(value: string) => setHttpParams({...initHttpParams, http_request_mode: value})}
        >
          {RequestMethodList && RequestMethodList.length
            ? RequestMethodList.map((item: any) => (
                <Option key={item} value={item}>
                  {item}
                </Option>
              ))
            : null}
        </Select>
      </dd>
    </dl>
    <dl>
      <dt>uri： </dt>
      <dd>
        <Input value={initHttpParams.http_uri} onChange={(e) => setHttpParams({...initHttpParams, http_uri: e.target.value})} />
      </dd>
    </dl>
    <dl>
      <dt>method名称： </dt>
      <dd>
        <Select
          style={{ width: '200px' }}
          value={httpMethodPre}
          disabled={!!props.methodName}
          onChange={(value: string) => {setHttpMethodPre(value), setHttpParams({...initHttpParams, method_name: `${value}.${httpMethodValue}`})}}
        >
          {HttpMethodPre.map((item: string) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
        <Input
          disabled={!!props.methodName}
          value={httpMethodValue}
          onChange={(e) => {setHttpMethodValue(e.target.value), setHttpParams({...initHttpParams, method_name: `${httpMethodPre}.${e.target.value}`})}}
        />
      </dd>
    </dl>
    <dl className={props.methodName && initHttpParams.service ? '' : styles.hidden}>
      <dt>服务名称： </dt>
      <dd>
        <Input
          disabled={true}
          value={initHttpParams.service}
        />
      </dd>
    </dl>
  </Card>
  )
}

export default httpSetting
