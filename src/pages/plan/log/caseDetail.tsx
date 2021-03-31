import React from 'react';

import moment from 'moment';
import { Row, Col, Card, message, Collapse, Input } from 'antd';
import { connect } from 'dva'

import { dispatchBreadCrumbs } from '@/utils/utils'
import { LOGSTATUS_TYPE } from '../interface';

import { caseLogDetail } from '../services/caseDetail';

import styles from '../detail/index.less';

const { Panel } = Collapse;
import JsonEditor from '@/components/JsonEditor';
const {TextArea} = Input

type Props = {
  location: any;
};

type State = {
  /** planList列表 */
  plan_name: string;
  method_name: string;
  flow_name: string;
  case_name: string;
  case_version: string;
  case_status: number;
  db_insert_time: string;
  db_update_time: string;
  request_template_status: number;
  request_template_body: string;
  request_template_header: any;
  request_value_status: number;
  request_value_body: string;
  request_value_header: any;
  response_value_status: number;
  response_value_body: string;
  response_value_header: any;
  action_consequence: any;
  cost_time: number;
  url: string;
  request_value: string;
  request_template_url_parameter: string;
  request_value_url_parameter: string;
};

class PlanCaseDetail extends React.PureComponent<Props, State> {
  state: State = {
    plan_name: '',
    method_name: '',
    flow_name: '',
    case_name: '',
    case_version: '',
    case_status: 0,
    db_insert_time: '',
    db_update_time: '',
    request_template_body: '{}',
    request_template_status: 0,
    request_template_header: [],
    request_value_body: '{}',
    request_value_status: 0,
    request_value_header: [],
    response_value_status: 0,
    response_value_body: '{}',
    response_value_header: [],
    request_value: '',
    action_consequence: [],
    cost_time: 0,
    url: '',
    request_template_url_parameter: '',
    request_value_url_parameter: ''
  };

  componentDidMount() {
    this.getCaseList();
  }

  /**
   * 获取case列表
   */
  getCaseList = async () => {
    const { location, dispatch } = this.props;

    const caseLogId = decodeURIComponent(location.query.caseLogId).split('#')[0]

    const { data, success, errmsg }: any = await caseLogDetail(caseLogId);
    if (!success) {
      message.error(errmsg);
      return false;
    }

    if (data) {
      const time = data.db_insert_time && data.db_insert_time.length > 10 ? moment.unix(data.db_insert_time/1000).format('YYYY-MM-DD HH:mm:ss') : moment.unix(data.db_insert_time).format('YYYY-MM-DD HH:mm')

      if (location.query.origin === 'case') {
        dispatchBreadCrumbs(dispatch, [data.case_name, `${data.case_name}-日志详情`])
      } else {
        dispatchBreadCrumbs(dispatch, [data.plan_name, `开始时间-${time}`, data.flow_name, data.case_name])
      }

      this.setState({
        plan_name: data.plan_name,
        flow_name: data.flow_name,
        case_name: data.case_name,
        case_version: data.version_control,
        method_name: data.method_name,
        case_status: data.case_status,
        db_insert_time: data.db_insert_time ? data.db_insert_time.length > 10 ? moment.unix(data.db_insert_time/1000).format('YYYY-MM-DD HH:mm:ss'): moment.unix(data.db_insert_time).format('YYYY-MM-DD HH:mm') : '-',

        db_update_time: data.db_update_time ? data.db_update_time.length > 10 ? moment.unix(data.db_update_time/1000).format('YYYY-MM-DD HH:mm:ss'): moment.unix(data.db_update_time).format('YYYY-MM-DD HH:mm') : '-',

        request_template_header: data.request_template?.header || [],
        request_template_body: data.request_template?.body || '{}',

        request_value_body: data.request_value?.body || '{}',
        request_value_header: data.request_value?.header || [],

        response_value_body: data.response_value?.body || '',
        response_value_header:  data.response_value?.header || [],
        response_value_status: data.response_value?.status_code || 0,

        action_consequence: data.action_consequence || [],
        cost_time:  data.response_value?.cost_time || 0,
        url: data.url || '',
        request_template_url_parameter: data.request_template?.url_parameter || '',
        request_value_url_parameter: data.request_value?.url_parameter || ''
      });
    }
  };


  renderHeaderTable = (dataSource: any) => {
    const keys = Object.keys(dataSource)
    return (
      <Collapse>
        {keys.map((item, idx) => (
          <Panel header={item} key={`${item}_${idx}`}>
            <p>{dataSource[item]}</p>
          </Panel>
        ))}
      </Collapse>
    )
  };

  /**
   * 展示的
   */

  renderBody = (title: string, data: any, body: string, name: string, extra: any) => (
    <Col span={11}>
      <Card title={title} bordered={true}>
        <section>
          {name === 'response_value' && extra ? <h4>状态： {extra}</h4> : null}
        </section>
        <br />

        <section>
          {name !== 'response_value' && extra ? <div> <h4 style={{display: 'inline-block'}}>url参数：</h4> <span style={{wordBreak: 'break-all'}}>{extra}</span> </div>  : null}
        </section>

        <section>
          {this.state.cost_time && title === '接口返回值' ? <h4>响应时间：{this.state.cost_time} ms</h4> : ''}
        </section>
        <br /><br /><br />

        <section>
          <h4>{title === '接口返回值' ? '返回头' : '请求头'}</h4>
          {this.renderHeaderTable(data)}
        </section>
        <br /><br /><br />

        <section>
          <h4>{title === '接口返回值' ? '返回体' : '请求体'}</h4>

          {data["Content-Type"]=== 'text/html'  ? (
            <TextArea
              rows={5}
              value={body}
            />
          ) : (
            <JsonEditor
              id={name}
              initeDate={body}
            />
          )}
        </section>
      </Card>
    </Col>
  )

  render() {
    const {
      plan_name,
      method_name,
      case_status,
      db_insert_time,
      db_update_time,
      request_template_body,
      request_template_header,
      request_value_body,
      request_value_header,
      response_value_body,
      response_value_header,
      response_value_status,
      action_consequence,
      url,
      request_value_url_parameter,
      request_template_url_parameter,
      flow_name,
      case_name,
      case_version
    } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <Row type="flex" justify="space-around" align="middle">
            <Col span={23}>
              <Card title="基础设置" bordered={false}>
              <dl>
                  <dt>method名称：</dt>
                  <dd>{method_name}</dd>
                </dl>

                <dl>
                  <dt>Plan名称：</dt>
                  <dd>{plan_name}</dd>
                </dl>

                <dl>
                  <dt>flow名称：</dt>
                  <dd>{flow_name}</dd>
                </dl>

                <dl>
                  <dt>case名称：</dt>
                  <dd>{case_name}</dd>
                </dl>

                <dl>
                  <dt>case版本：</dt>
                  <dd>{case_version}</dd>
                </dl>

                {url ?
                  (
                    <dl>
                      <dt>请求地址：</dt>
                      <dd>{url}</dd>
                    </dl>
                  ) : null
                }

                <dl>
                  <dt>case状态:</dt>
                  <dd>{LOGSTATUS_TYPE[case_status]}</dd>
                </dl>

                <dl>
                  <dt>结束时间：</dt>
                  <dd>{db_insert_time}</dd>
                </dl>

                <dl>
                  <dt>开始时间</dt>
                  <dd>{db_update_time}</dd>
                </dl>
              </Card>
            </Col>
          </Row>
        </div>

        <div className={styles.row}>
          <Row type="flex" justify="space-around">
            {/* 请求模版 */}
            {
              this.renderBody('请求模版', request_template_header, request_template_body, 'request_template', request_template_url_parameter)
            }

            {/* 请求列表 */}
            {this.renderBody('请求列表',  request_value_header, request_value_body, 'request_value', request_value_url_parameter )}

            {/* 接口返回值 */}
            {this.renderBody('接口返回值', response_value_header, response_value_body ? response_value_body : '{}', 'response_value', response_value_status)}

            {/* action执行结果 */}
            <Col span={11}>
              <Card title="action执行结果：" bordered={false}>
              {action_consequence && action_consequence.map((value, index) => {
              const jsonVal = value ? value : '{}'
              return (
                <div style={{marginBottom: '16px'}} key={index}>
                  <JsonEditor
                    id={`action_consequence${index}`}
                    initeDate={jsonVal}
                  />
                </div>
              )})}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default connect()(PlanCaseDetail);
