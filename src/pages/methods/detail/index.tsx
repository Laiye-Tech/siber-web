import React, { useState, useEffect } from 'react';
import withRouter from 'umi/withRouter';
import { Button, message, Row, Col } from 'antd';
import { connect } from 'dva';

import { dispatchBreadCrumbs } from '@/utils/utils';
import { createMethod } from '../services';

import { ManageMode } from '@/services/interface';
import { MethodInfo, RequestMethodList } from '../interface';
import httpSetting from '../components/httpSetting';
import grpcSetting from '../components/grpcSetting';
import graphQLSetting from '../components/graphQLSetting';

import styles from './index.less';

type Props = {
  location: any;
};

const MethodDetails: any = (props: Props) => {
  const type = props.location.query.method_type;
  const methodName = props.location.query.methodName ? props.location.query.methodName : '';

  const initGrpcParams = {
    method_name: '',
    proto_files: [],
    import_paths: [],
    http_uri: '',
    http_request_mode: '',
    insert_time: '',
    service: '',
  };

  const initHttpParams = {
    method_name: '',
    http_uri: '',
    http_request_mode: '',
    insert_time: '',
    service: '',
  };

  const initGraphQLParams = {
    method_name: '',
    http_uri: '',
    http_request_mode: RequestMethodList[0],
    insert_time: '',
    graph_query: '',
    service: '',
  };

  /** grpc接口的参数 */
  const [grpcParams, setGrpcParams] = useState<MethodInfo>(initGrpcParams);
  /** http接口的参数 */
  const [httpParams, setHttpParams] = useState<MethodInfo>(initHttpParams);
  /** graphql接口的参数 */
  const [graphQLParams, setGraphQLParams] = useState<MethodInfo>(initGraphQLParams);

  useEffect(() => {
    const { dispatch } = props;
    dispatchBreadCrumbs(dispatch, [methodName]);
  }, []);

  /**
   * 保存
   */
  const handleCreateMethod = async () => {
    let params: any = {};

    if (type === 'grpc') {
      if (!grpcParams.proto_files[0]) {
        message.error('proto文件相对路径必填！');
        return false;
      }

      if (!grpcParams.method_name) {
        message.error('method必选！');
        return false;
      }

      // 创建method
      if (!methodName) {
        delete grpcParams.insert_time;
      }
      params = grpcParams;
    }

    if (type === 'http' || type === 'graphQL') {
      params = type === 'http' ? httpParams : graphQLParams;

      if (!params.http_request_mode) {
        message.error('http请求方式必选！');
        return false;
      }

      if (!params.http_uri) {
        message.error('uri必填！');
        return false;
      }

      if (!params.method_name.split('.')[1]) {
        message.error('method名称必填！');
        return false;
      }

      if (!methodName) {
        delete params.insert_time;
      }
    }

    if (type === 'graphQL') {
      // if (!graphQLParams.graph_query) {
      //   message.error('query必填！');
      //   return false;
      // }

      params.graph_query = graphQLParams.graph_query;
    }

    params.method_type = type;

    !params.service && delete params.service;

    const { _, success, errmsg }: any = await createMethod(
      !methodName ? ManageMode.CREATE : ManageMode.UPDATE,
      params,
    );

    if (!success) {
      message.error(errmsg);
      return false;
    }

    message.success('method录入成功');
  };

  return (
    <div className={styles.container}>
      <Button type="primary" className={styles.btn} onClick={handleCreateMethod}>
        {`保存`}
      </Button>
      <Row type="flex" justify="space-around" align="middle">
        <Col span={20}>
          {type === 'grpc'
            ? grpcSetting({
                initGrpcParams: grpcParams,
                setGrpcParams: setGrpcParams,
                methodName: methodName,
              })
            : null}

          {type === 'http'
            ? httpSetting({
                initHttpParams: httpParams,
                setHttpParams: setHttpParams,
                methodName: methodName,
              })
            : null}

          {type === 'graphQL'
            ? graphQLSetting({
                initGraphQLParams: graphQLParams,
                setGraphQLParams: setGraphQLParams,
                methodName: methodName,
              })
            : null}
        </Col>
      </Row>
    </div>
  );
};

export default withRouter(connect()(MethodDetails));
