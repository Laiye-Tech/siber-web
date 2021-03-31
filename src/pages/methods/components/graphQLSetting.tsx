import React, { useState, useEffect } from 'react'
import { Input, Card, Select, message } from 'antd';

import {
  MethodInfo,
  RequestMethodList,
  HttpMethodPre,
  graphql_query_detail_item,
} from '../interface';
import { ManageMode } from '@/services/interface';
import { createMethod, getQraphqlMethodList, getQraphqlQueryInfo } from '../services';

import styles from '../detail/index.less';

const { Option } = Select;
const { TextArea } = Input;

type Props = {
  initGraphQLParams: MethodInfo;
  methodName: string;
  setGraphQLParams: (value: MethodInfo) => void;
};

const defaultData = {
  chooseQuery: {
    version: '',
    query_string: '',
  },
};

const graphQLSetting: any = (props: Props) => {
  const { initGraphQLParams, setGraphQLParams } = props;

  /** method名称的前缀*/
  const [httpMethodPre, setHttpMethodPre] = useState<string>(HttpMethodPre[0]);
  /** method名称的下拉框*/
  const [httpMethodValue, setHttpMethodValue] = useState<string>('');
  const [methodList, setMethodList] = useState<string[]>([]);
  const [queryList, setQueryList] = useState<graphql_query_detail_item[]>([]);
  const [chooseQuery, setChooseQuery] = useState<graphql_query_detail_item>(
    defaultData.chooseQuery,
  );

  useEffect(() => {
    if (props.methodName) {
      getGraphQLSetting();
    }
    getGraphqlQueryList();
  }, []);

  /**
   *  获取graphql 定义的列表
   */
  const getGraphqlQueryList = async () => {
    const {
      success,
      data: { graphql_methods },
      errmsg,
    } = await getQraphqlMethodList();

    if (!success) {
      message.error(errmsg);
      return false;
    }

    setMethodList([...graphql_methods]);
  };

  /**
   * 获取http设置内容
   */
  const getGraphQLSetting = async () => {
    setHttpMethodPre(`${props.methodName.split('.')[0]}${props.methodName.split('.')[1]}`);
    setHttpMethodValue(`${props.methodName.split('.')[2]}`);

    const param = {
      method_name: props.methodName,
    };

    const { success, data, errmsg }: any = await createMethod(ManageMode.QUERY, param);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    const initParams = {
      http_request_mode: data.http_request_mode ? data.http_request_mode : '',
      http_uri: data.http_uri ? data.http_uri : '',
      method_name: data.method_name ? data.method_name : '',
      insert_time: data.insert_time ? data.insert_time : '',
      graph_query: data.graph_query ? data.graph_query : '',
      service: data.service ? data.service : '',
    };

    setGraphQLParams(initParams);
  };

  /**
   * 选择method后获取query信息
   */
  const handleChangeMethod = (value: string) => {
    setHttpMethodValue(value);
    setChooseQuery({ ...defaultData.chooseQuery });
    getQueryInfo(value);
  };

  const getQueryInfo = async (methodName: string) => {
    const {
      success,
      data: { http_uri, graphql_query_detail },
      errmsg,
    }: any = await getQraphqlQueryInfo(methodName);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    setGraphQLParams({
      ...initGraphQLParams,
      http_uri: http_uri,
      method_name: `${httpMethodPre}.${methodName}`,
    });

    setQueryList([...graphql_query_detail]);
    setChooseQuery({ ...graphql_query_detail[0] });
  };

  const handleChooseQuery = (version: string) => {
    const chooseQuery = queryList.filter(item => item.version === version)[0];
    setChooseQuery({ ...chooseQuery });
  };

  return (
    <Card title="基础设置" bordered={false}>
      <dl>
        <dt>http请求方式： </dt>
        <dd>
          <Select
            showSearch={true}
            style={{ width: '100%' }}
            placeholder="请选择请求方式"
            value={initGraphQLParams.http_request_mode}
            onChange={(value: string) =>
              setGraphQLParams({ ...initGraphQLParams, http_request_mode: value })
            }
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

      <dl className={props.methodName && initGraphQLParams.service ? '' : styles.hidden}>
        <dt>服务名称： </dt>
        <dd>
          <Input disabled={true} value={initGraphQLParams.service} />
        </dd>
      </dl>

      <dl>
        <dt>method名称： </dt>
        <dd>
          <Select
            style={{ width: '200px' }}
            value={httpMethodPre}
            disabled={!!props.methodName}
            onChange={(value: string) => {
              setHttpMethodPre(value),
                setGraphQLParams({
                  ...initGraphQLParams,
                  method_name: `${value}.${httpMethodValue}`,
                });
            }}
          >
            {HttpMethodPre.map((item: string) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>

          <Select
            showSearch={true}
            style={{ width: '100%' }}
            placeholder="选择method"
            onChange={handleChangeMethod}
            disabled={props.methodName}
            value={httpMethodValue}
          >
            {methodList.map((item: string) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </dd>
      </dl>

      <dl>
        <dt>uri：</dt>
        <dd>
          <Input
            value={initGraphQLParams.http_uri}
            onChange={e => setGraphQLParams({ ...initGraphQLParams, http_uri: e.target.value })}
          />
        </dd>
      </dl>

      {initGraphQLParams.graph_query ? (
        <dl>
          <dt>query： </dt>
          <dd>
            <TextArea
              value={initGraphQLParams.graph_query}
              rows={8}
              onChange={e =>
                setGraphQLParams({ ...initGraphQLParams, graph_query: e.target.value })
              }
            />
          </dd>
        </dl>
      ) : (
        <dl className={styles.queryInfo}>
          <dt>query多版本展示： </dt>
          <div className={styles.queryInfoContainer}>
            <dd>
              <Select
                showSearch={true}
                style={{ width: '100%' }}
                placeholder="选择版本"
                onChange={value => handleChooseQuery(value)}
                value={chooseQuery.version || undefined}
              >
                {queryList.map((item, index) => (
                  <Option key={`${item.version} - ${index}`} value={item.version}>
                    {item.version}
                  </Option>
                ))}
              </Select>
            </dd>
            <dd>
              <TextArea
                placeholder="query定义"
                value={chooseQuery.query_string}
                rows={8}
                disabled={true}
              />
            </dd>
          </div>
        </dl>
      )}
    </Card>
  );
};

export default graphQLSetting;
