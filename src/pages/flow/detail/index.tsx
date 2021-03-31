import React from 'react';
import router from 'umi/router';
import withRouter from 'umi/withRouter';
import { connect } from 'dva';

import { dispatchBreadCrumbs } from '@/utils/utils';
import { Button, Select, Input, Row, Col, Card, message, Radio } from 'antd';
import arrayMove from 'array-move';
import SortableList from '../components/SortableList';

import { manageFlow } from '../services';
import { FlowInfo, ErunMode } from '../interface';
import { listCase, manageCase, manageCaseVersion } from '@/pages/case/services';
import JsonEditor from '@/components/JsonEditor';
import SelectPaging from '@/components/SelectPaging';
import { randomRange } from '@/utils/constans';
import { ManageMode } from '@/services/interface';

import styles from './index.less';

const { Option } = Select;

type Props = {
  location: any;
};

type State = {
  interfaceType: string;
  environmentType: string;
  // case输入data
  inputDate: string;
  // case输出data
  outputDate: string;
  /** flow名称 */
  name: string;
  /** 当前是进入类型（编辑/创建） */
  type: 'edit' | 'copy' | '';
  /** 创建时间 */
  insertTime: number;
  /** case版本列表 */
  caseVersionList: string[];
  /** 当前的caseID */
  currentCaseId: string;
  /** 当前case版本 */
  currentCaseVersion: string;
  /** case_mode */
  caseMode: string;
  /** 运行控制 */
  runMode: string;
  currentPage: number;
  /** case列表下拉框的内容 */
  newcaseList: any[];
  searchValue: string;
  /** 设置流程中的case列表 */
  selectCaseList: any;
};

class FlowDetail extends React.PureComponent<Props, State> {
  state: State = {
    interfaceType: 'http',
    environmentType: 'test',
    inputDate: '{}',
    outputDate: '{}',
    name: '',
    type: '',
    insertTime: 0,
    currentCaseId: '',
    currentCaseVersion: '',
    caseMode: '',
    runMode: 'ABORT',
    currentPage: 1,
    newcaseList: [],
    searchValue: '',
    selectCaseList: [],
  };

  async componentDidMount() {
    const { location, dispatch } = this.props;
    const flowId = location.query.flowId ? location.query.flowId : '';
    flowId && (await this.getFlowDetailData(flowId));
    dispatchBreadCrumbs(dispatch, [this.state.name]);
    this.togetCaseList();
  }

  onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    this.setState({ selectCaseList: arrayMove(this.state.selectCaseList, oldIndex, newIndex) });
  };

  /**
   * 获取case列表
   */
  togetCaseList = async () => {
    const { currentPage, searchValue } = this.state;
    let _newcaseList = [];

    const { success, data, errmsg }: any = await listCase({
      filter_content: {
        content: searchValue,
        page: `${currentPage}`,
        page_size: '20',
      },
    });

    if (!success) {
      message.error(errmsg);
      return false;
    }

    const _data = JSON.parse(JSON.stringify(data));

    const _list = _data.case_info_list ? [..._data.case_info_list] : [];

    _newcaseList =
      _list && _list.length
        ? _list.map((item: any) => {
            return {
              name: item.case_name,
              id: item.case_id,
            };
          })
        : [];

    const newcaseList = this.state.newcaseList.concat(_newcaseList);

    this.setState({ newcaseList: newcaseList.concat() });
  };

  /**
   * 搜索case列表
   */
  setnewcaseList = async () => {
    this.setState({ newcaseList: [] });
  };

  setPage = (page?: number) => {
    this.setState({ currentPage: page ? page : this.state.currentPage + 1 });
  };

  setSearchValue = (value: string) => {
    this.setState({ searchValue: value });
  };

  getFlowDetailData = async (flowId: string) => {
    const params: any = {
      flow_id: flowId,
    };

    const { data, success, errmsg }: any = await manageFlow(ManageMode.QUERY, params);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    this.inintDate(data);
  };

  /**
   * 初始化数据
   */
  inintDate = (data: any) => {
    const { location } = this.props;

    const flowName =
      data.flow_name && location.query.type === 'copy'
        ? `${data.flow_name}_${randomRange(6)}`
        : data.flow_name;

    this.setState({
      runMode: data.run_mode ? data.run_mode : 'ABORT',
      name: flowName,
      insertTime: data.insert_time ? data.insert_time : 0,
      selectCaseList: data.case_list_detail ? data.case_list_detail : [],
    });

    this.setState({ type: location.query.type });
  };

  handleCaseChange = (checkCaseList: any) => {
    if (!checkCaseList.length) {
      return false;
    }

    const _selectCaseList = checkCaseList.map((item: any) => {
      return {
        case_name: item.name,
        case_id: item.id,
      };
    });

    const selectCaseList = [...this.state.selectCaseList];

    if (checkCaseList.length === 1) {
      this.getCaseVersion(checkCaseList[0].id);
    }

    const newSelectCaseList = selectCaseList.concat(_selectCaseList);
    this.setState({ selectCaseList: newSelectCaseList });
  };

  handleCaseDelete = (caseIndex: number) => {
    let selectCaseList = [...this.state.selectCaseList];

    selectCaseList.splice(caseIndex, 1);
    this.setState({ selectCaseList });
  };

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  };

  getCaseVersion = async (id: string) => {
    const params = {
      case_id: id,
    };

    const { data, success, errmsg }: any = await manageCase(ManageMode.QUERY, params);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    const caseVersionList = data.case_version
      ? data.case_version.map(item => item.version_control)
      : [];
    const caseMode = data.case_mode ? data.case_mode : '';

    await this.setState({
      caseVersionList,
      caseMode: caseMode,
      currentCaseId: params.case_id,
      inputDate: '{}',
      outputDate: '{}',
    });

    await this.handleCaseSelect(caseVersionList[0]);
  };

  handleCaseSelect = async (value: string) => {
    await this.setState({ currentCaseVersion: value });
    await this.hanleRenderJson();
  };

  /**
   * 展示case输入输出的json
   */
  hanleRenderJson = async () => {
    const { currentCaseId, currentCaseVersion, caseMode } = this.state;
    let requestBody = caseMode === 'instance' ? '' : {};

    const params = {
      case_id: currentCaseId,
      version_control: currentCaseVersion,
    };

    const { data, success, errmsg }: any = await manageCaseVersion(ManageMode.QUERY, params);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    if (data.request_body) {
      requestBody = caseMode === 'instance' ? data.request_body : JSON.parse(data.request_body);
    }

    const inputDate: string = JSON.stringify({
      request_header: data.request_header ? data.request_header : {},
      request_body: requestBody,
    });

    const check_point = data.check_point ? data.check_point : [];
    const inject_point = data.inject_point ? data.inject_point : [];

    const outputDate: string = JSON.stringify({
      check_point: check_point,
      inject_point: inject_point,
      sleep_point: data.sleep_point ? data.sleep_point : 0,
    });

    this.setState({
      inputDate,
      outputDate,
    });
  };

  onRunModeChange = (e: any) => {
    this.setState({ runMode: e.target.value });
  };

  /**
   * 获取JSON编辑器的值, 并进行解析
   */
  handleJsonChange = (type: string) => (data: any) => {
    if (type === 'inputDate') {
      this.setState({ inputDate: data });
    } else {
      this.setState({ outputDate: data });
    }
  };

  /**
   * 保存
   */
  handleSubmit = async () => {
    const { location } = this.props;
    const { name, type, selectCaseList, insertTime, runMode } = this.state;

    if (!name || !name.trim()) {
      message.error('flow名称必填！');
      return false;
    }

    if (!selectCaseList.length) {
      message.error('至少设置一条个case!');
      return false;
    }

    const params: FlowInfo = {
      flow_name: name,
      run_mode: runMode,
      case_list: selectCaseList.map(item => item.case_id),
      insert_time: insertTime,
    };

    if (type === 'edit') {
      params.flow_id = location.query.flowId;
    }

    if (type === 'copy') {
      params.insert_time ? delete params.insert_time : null;
    }

    const { errmsg, success, data }: any = await manageFlow(
      type === 'edit' ? ManageMode.UPDATE : ManageMode.CREATE,
      params,
    );

    if (!success) {
      message.error(errmsg);
      return false;
    }

    message.success('保存成功');

    if (type !== 'edit') {
      router.push({
        pathname: '/flow',
      });
    }

    this.inintDate(data);
  };

  render() {
    const {
      name,
      inputDate,
      outputDate,
      type,
      caseVersionList,
      currentCaseVersion,
      runMode,
      newcaseList,
      currentPage,
      searchValue,
      selectCaseList,
    } = this.state;

    return (
      <div className={styles.container}>
        <Button type="primary" onClick={this.handleSubmit} className={styles.btn}>
          {' '}
          {type ? '保存' : '创建'}{' '}
        </Button>
        <div className={styles.row}>
          <Row type="flex" justify="space-around" align="middle">
            <Col span={11}>
              <Card title="基础配置" bordered={false}>
                <dl>
                  <dt>Flow名称：</dt>
                  <dd>
                    <Input
                      placeholder="请输入Flow名称"
                      value={name}
                      onChange={this.handleNameChange}
                    />
                  </dd>
                </dl>

                <dl>
                  <dt>case运行控制： </dt>
                  <dd>
                    <Radio.Group onChange={this.onRunModeChange} value={runMode}>
                      <Radio value={ErunMode.ABORT}>错误终止</Radio>
                      <Radio value={ErunMode.IGNORE_ERROR}>错误忽略</Radio>
                    </Radio.Group>
                  </dd>
                </dl>

                <dl>
                  <dt>Case列表：</dt>
                  <dd>
                    <SelectPaging
                      dataList={newcaseList}
                      getList={this.togetCaseList}
                      setPage={this.setPage}
                      searchValue={searchValue}
                      currentPage={currentPage}
                      onSelect={this.handleCaseChange}
                      setSearchValue={this.setSearchValue}
                      setnewcaseList={this.setnewcaseList}
                    />
                  </dd>
                </dl>
              </Card>

              <Card title="设置流程" bordered={false} className={styles.SortableList}>
                <SortableList
                  items={selectCaseList}
                  sortEnd={this.onSortEnd}
                  setItemInner={(item: any) => (
                    <span
                      onClick={() => this.getCaseVersion(item.case_id)}
                      className={styles.sortSpan}
                    >
                      {item.case_name}
                    </span>
                  )}
                  handleCaseDelete={this.handleCaseDelete}
                />
              </Card>
            </Col>

            <Col span={11}>
              <Card title="Case设置：" bordered={false}>
                <div className={styles.caseSetting}>
                  <p>Case版本选择:</p>
                  <Select
                    value={currentCaseVersion ? currentCaseVersion : undefined}
                    showSearch={true}
                    style={{ width: '100%' }}
                    placeholder="请选择case版本"
                    optionFilterProp="children"
                    onSelect={this.handleCaseSelect}
                    allowClear={true}
                  >
                    {caseVersionList
                      ? caseVersionList.map((item: any) =>
                          item ? (
                            <Option key={item} value={item}>
                              {item}
                            </Option>
                          ) : null,
                        )
                      : null}
                  </Select>
                </div>

                <div className={styles.caseSetting}>
                  <p>Case输入:</p>
                  <JsonEditor
                    readOnly={true}
                    id="flow-input"
                    initeDate={inputDate}
                    onJsonChange={this.handleJsonChange('inputDate')}
                  />
                </div>

                <div className={styles.caseSetting}>
                  <p>Case输出:</p>
                  <JsonEditor
                    readOnly={true}
                    id="flow-output"
                    initeDate={outputDate}
                    onJsonChange={this.handleJsonChange('outputDate')}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default withRouter(connect()(FlowDetail));
