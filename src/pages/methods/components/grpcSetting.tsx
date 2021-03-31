import React, { useState, useEffect } from 'react'
import { Button, Input, Card, message, Select } from 'antd';
import marked from 'marked';

import { methodsOnProto, getMethodDescribe, createMethod, listProto } from '../services';
import { ManageMode } from '@/services/interface';
import { MethodInfo } from '../interface';

import styles from '../detail/index.less';

const { Option } = Select;

// marked 设置
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: true,
  sanitize: true,
  smartLists: true,
  smartypants: true,
});

type Props = {
  initGrpcParams: MethodInfo,
  methodName: string,
  setGrpcParams: (value: MethodInfo) => void
}

const grpcSetting: any = (props: Props) => {
  const {initGrpcParams, setGrpcParams} = props

  const [requestMessage, setRequestMessage] = useState<string>('')
  const [responseMessage, setResponseMessage] = useState<string>('')
  const [methodName, setMethodName] = useState<string>('')
  /** 是否更新当前的method列表以及method详情 */
  const [isGetMethod, toIsGetMethod] = useState<boolean>(false)
   /** 解析后的methodsList */
  const [methodsList, setMethodsList] = useState<string[]>([])
   /** 解析后的protoList */
   const [protoList, setProtoList] = useState<string[]>([])

  useEffect(() => {
    getProtoList()
   },[]);

  useEffect(() => {
    props.methodName !== '' ? getGrpcSetting() : null;
   },[]);

   useEffect(() => {
     if (initGrpcParams.proto_files.length && initGrpcParams.method_name) {
      getMethodList()
      handleMethodChange(initGrpcParams.method_name)
     }
   },[isGetMethod]);

   /**
    * 获取proto列表
    */
   const getProtoList = async () => {

    const { success, data, errmsg }: any = await listProto();

    if (!success) {
      message.error(errmsg);
      return false;
    }
    setProtoList(data && data.proto_files ? data.proto_files : []);
   }

   /**
    * 初始化grpc设置内容
    */
   const getGrpcSetting = async () => {
     const param = {
      method_name: props.methodName
     }

    const { success, data, errmsg }: any = await createMethod(ManageMode.QUERY, param);

    if (!success) {
      message.error(errmsg);
      return false
    }

    setGrpcParams({
      ...initGrpcParams,
      proto_files: data.proto_files,
      method_name: props.methodName,
      insert_time: data.insert_time ? data.insert_time : '',
      service: data.service ? data.service : ''
    })
    toIsGetMethod(true)
   }

  /**
   * 获取proto下的method列表
   */
  const getMethodList = async () => {
    const { proto_files } = initGrpcParams;

    if (!proto_files[0]) {
      message.error('proto文件相对路径必填！');
      return false;
    }

    const { data, success, errmsg }: any = await methodsOnProto(proto_files[0]);

    if (!success) {
      message.error(errmsg);
      setGrpcParams({...initGrpcParams, method_name: ''})
      setMethodsList([])
      return false;
    }

    if (data.method_list.length) {
      message.success('解析成功！可在method中进行选择');
      setMethodsList(data.method_list)
    } else {
      message.success('解析成功！暂无method列表');
    }
  };

    /**
   * 获取method的详情
   */
  const handleMethodChange = async (value: string) => {
    const { proto_files } = initGrpcParams;
    const { data, success, errmsg }: any = await getMethodDescribe(value, proto_files);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    const params: MethodInfo = {
      http_request_mode: data.http_request_mode ? data.http_request_mode : '',
      import_paths: data.import_paths ? data.import_paths : [],
      http_uri: data.http_uri ? data.http_uri : '',
      method_name: value,
      proto_files: initGrpcParams.proto_files,
      service: initGrpcParams.service
    }

    setMethodName(data.method_name ? data.method_name : '')
    setRequestMessage(data.request_message ? data.request_message : '')
    setResponseMessage(data.response_message ? data.response_message : '')
    setGrpcParams(params)
  };

  return (
      <div>
        <Card title="基础设置" bordered={false}>
          <dl>
            <dt>proto文件相对路径： </dt>
            <dd>
              <Select
                showSearch={true}
                value={initGrpcParams.proto_files.length ? initGrpcParams.proto_files[0] : ''}
                style={{ width: '100%' }}
                placeholder="请选择proto"
                optionFilterProp="children"
                onChange={(value: string) => setGrpcParams({...initGrpcParams, proto_files: [value]})}
              >
                {protoList
                  ? protoList.map((item: any) => item ? <Option key={item}>{item}</Option> : null)
                  : null}
              </Select>

              <Button
                type="primary"
                className={styles.analysisBtn}
                onClick={getMethodList}
              >
                {`解析`}
              </Button>
            </dd>
          </dl>
          <dl>
            <dt>methods列表： </dt>
            <dd>
              <Select
                showSearch={true}
                value={initGrpcParams.method_name ? initGrpcParams.method_name : ''}
                style={{ width: '100%' }}
                placeholder="请选择case"
                optionFilterProp="children"
                onChange={handleMethodChange}
              >
                {methodsList
                  ? methodsList.map((item: any) => item ? <Option key={item}>{item}</Option> : null)
                  : null}
              </Select>
            </dd>
          </dl>
        </Card>

        <Card title="method描述" bordered={false}>
          <dl>
            <dt>http请求方式： </dt>
            <dd>
              <Input value={initGrpcParams.http_request_mode} disabled={true} />
            </dd>
          </dl>
          <dl>
            <dt>uri： </dt>
            <dd>
              <Input value={initGrpcParams.http_uri} disabled={true} />
            </dd>
          </dl>
          <dl>
            <dt>method名称： </dt>
            <dd>
              <Input value={methodName} disabled={true} />
            </dd>
          </dl>
          <dl className={props.methodName && initGrpcParams.service ? '' : styles.hidden}>
            <dt>服务名称： </dt>
            <dd>
              <Input
                disabled={true}
                value={initGrpcParams.service}
              />
            </dd>
         </dl>
          <dl>
            <dt>请求信息： </dt>
            <dd>
              <div
                className={styles.marked}
                dangerouslySetInnerHTML={{
                  __html: marked(`### ${requestMessage}`),
                }}
              />
            </dd>
          </dl>
          <dl>
            <dt>响应信息： </dt>
            <dd>
              <div
                className={styles.marked}
                dangerouslySetInnerHTML={{
                  __html: marked(`### ${responseMessage}`),
                }}
              />
            </dd>
          </dl>
          <dl>
            <dt>导入路径： </dt>
            <dd>
              <Select
                style={{ width: '100%' }}
                value={initGrpcParams.import_paths && initGrpcParams.import_paths.length ? initGrpcParams.import_paths[0] : undefined}
                placeholder="请选择路径"
              >
                {initGrpcParams.import_paths && initGrpcParams.import_paths.length
                  ? initGrpcParams.import_paths.map((item: any) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))
                  : null}
              </Select>
            </dd>
          </dl>
        </Card>
      </div>
    )
  }

export default grpcSetting
