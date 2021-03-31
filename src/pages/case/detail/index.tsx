import React, { Fragment } from 'react';
import withRouter from 'umi/withRouter';
import router from 'umi/router';
import copy from 'copy-to-clipboard';
import {
  Button,
  Input,
  Select,
  Card,
  Col,
  Row,
  message,
  Modal,
  Tooltip,
  Tabs,
  AutoComplete,
  Upload,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { connect } from 'dva';

import { dispatchBreadCrumbs } from '@/utils/utils';
import {
  manageCase,
  listMethod,
  runCase,
  describeRequest,
  manageCaseVersion,
  caseEnvList,
  caseTagList,
  upload,
} from '../services';
import { getPlanVersionList } from '../../plan/services';
import { MethodInfo, checkPoint, keyPreList, GRPC_MAGE_LIST } from '../interface';
import { ManageMode } from '@/services/interface';
import { initDateOutput } from '@/utils/constans';

import {
  EINTERFACE_TYPE,
  EENVIRONMENT_TYPE,
  ENVIRONMENT_TYPE,
  INTERFACE_TYPE,
} from '../../plan/interface';

import JsonEditor from '@/components/JsonEditor';
import RenderHeaderTable from '../components/RenderHeaderTable';
import RenderInjectCase from '../components/InjectCase';
import { isJSON } from '@/utils/constans';

import styles from './index.less';
const MODE = window.config.mode;

const { Option } = Select;
const { TabPane } = Tabs;
const { confirm } = Modal;
const { TextArea } = Input;

type CurrentCaseDate = {
  case_id: string;
  /** case选择的版本号 */
  version_control: string;
  /**url */
  url_parameter: string;
  /** case输出data */
  check_point: any;
  inject_point: any;
  sleep_point: number;
  request_body: any;
  case_version_id: string;
  request_header_key: string[];
  request_header_value: string[];
};

const defaultEnvRequest = {
  dev: '{}',
  test: '{}',
  stage: '{}',
  prod: '{}',
};

const initCurrentCaseData = {
  case_id: '',
  version_control: '',
  url_parameter: '',
  /** case输出data */
  check_point: initDateOutput.check_point,
  inject_point: initDateOutput.inject_point,
  sleep_point: 0,
  header_value: '',
  request_body: '',
  case_version_id: '',
  request_header_key: [''],
  request_header_value: [''],
};

type State = {
  /** proto定义 */
  protoValue: string;
  /** case名称 */
  name: string;
  /** case初始名称 */
  initName: string;
  /** 所在methods */
  methods: string;
  /** methods列表 */
  methodsList: MethodInfo[];
  /** 创建时间 */
  insertTime: number;
  /** 接口类型 */
  interface_type: string;
  /** 运行环境 */
  environment_name: string;
  /** case运行modal */
  runVisible: boolean;
  activeKey: string;
  panes: any;
  currentCaseDate: CurrentCaseDate;
  planVersionList: any;
  instanceName: string;
  envNameList: any[];
  env_id: string;
  /** 静态case的请求体 */
  injectRequestBody: any;
  /** 用户标记的tag列表 */
  currentCaseTagList: string[];
  /** 所有tag列表 */
  allCaseTagList: string[];
  fileData: any;
  fileUrl: string;
  /** 项目名称 */
  projectName: string;
  projectversionList: any;
};

type Props = {
  location: any;
};

class CaseDetail extends React.PureComponent<Props, State> {
  state: State = {
    protoValue: '',
    name: '',
    initName: '',
    methods: '',
    methodsList: [],
    insertTime: 0,
    interface_type: INTERFACE_TYPE.HTTP,
    environment_name: EENVIRONMENT_TYPE.TEST,
    runVisible: false,
    activeKey: 'newVersion',
    panes: [{ title: '新版本', key: 'newVersion' }],
    currentCaseDate: JSON.parse(JSON.stringify(initCurrentCaseData)),
    planVersionList: [],
    instanceName: '',
    envNameList: [],
    env_id: '',
    injectRequestBody: JSON.parse(JSON.stringify(defaultEnvRequest)),
    currentCaseTagList: [],
    allCaseTagList: [],
    fileData: null,
    fileUrl: '',
    projectName: '',
    projectversionList: [],
  };

  async componentDidMount() {
    const {
      location: { query },
      dispatch,
    } = this.props;
    const caseId = query.caseId;
    const currentCaseDate = { ...this.state.currentCaseDate };
    currentCaseDate.case_id = caseId ? caseId : '';

    await this.setState({ currentCaseDate });
    await this.toGetPlanVersionList();

    await this.inintDate();

    // 设置面包屑名称列表
    dispatchBreadCrumbs(dispatch, [this.state.name]);
    this.getListMethod();
    this.handleCaseEnv();
    this.getCaseTagList();
  }

  /**
   * 获取case版本
   */
  toGetPlanVersionList = async () => {
    const { success, data, errmsg }: any = await getPlanVersionList();
    if (!success) {
      message.error(errmsg);
      return false;
    }

    this.setState({
      projectversionList: data?.iteration_list || [],
    });
  };

  /**
   * 获取case的tag列表
   */
  getCaseTagList = async () => {
    const { success, data, errmsg }: any = await caseTagList({
      filter_content: {
        page: '1',
        page_size: '1500',
      },
    });
    if (!success) {
      message.error(errmsg);
      return false;
    }

    const allCaseTagList =
      data?.tag_list ? data.tag_list.map((item: any) => item.tag_name) : [];

    this.setState({ allCaseTagList });
  };

  /**
   * 获取某一版本的详情
   */
  getCaseVersion = async () => {
    const { activeKey, currentCaseDate, panes } = this.state;

    if (activeKey === 'newVersion') {
      message.success('复制成功，请选择当前case所属版本');
      this.initCaseVersion({ ...currentCaseDate, version_control: '' }, 'noVersion');
      return;
    }

    if (!panes.length) {
      this.initCaseVersion(
        { ...initCurrentCaseData, case_id: currentCaseDate.case_id },
        'noVersion',
      );
      return;
    }

    const params = {
      case_id: currentCaseDate.case_id,
      version_control: activeKey,
    };

    const { data, errmsg, success }: any = await manageCaseVersion(ManageMode.QUERY, params);

    if (!success) {
      message.error(errmsg);
      return;
    }

    this.initCaseVersion(data, 'hasVersion');
  };

  onTabsChange = (activeKey: string) => {
    this.setState({ activeKey }, () => this.getCaseVersion());
  };

  changeRequestHeader = (operate: string, index?: number) => () => {
    const currentCaseDate: any = { ...this.state.currentCaseDate };
    const { request_header_value, request_header_key } = currentCaseDate;

    if (operate === 'add') {
      request_header_key.push('');
      request_header_value.push('');
    } else {
      request_header_key.splice(index, 1);
      request_header_value.splice(index, 1);
    }

    this.setState({ currentCaseDate });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  submitCaseVersion = async () => {
    const { location } = this.props;
    const modeType = location.query.modeType;
    const { injectRequestBody, currentCaseTagList, allCaseTagList } = this.state;
    let _injectRequestBody: any = {};
    const currentCaseDate: any = { ...this.state.currentCaseDate };
    const {
      inject_point,
      check_point,
      request_body,
      request_header_key,
      request_header_value,
    } = currentCaseDate;
    const request_header_params: any = {};
    let _tagList = [];

    for (let index = 0; index < request_header_key.length; index++) {
      const item = request_header_key[index];
      if (item && request_header_value[index]) {
        request_header_params[item] = request_header_value[index];
      }
    }

    // 校验必填项、request_body字段是否合法
    if (!currentCaseDate.case_id) {
      message.warning('请先保存基础信息!');
      return false;
    }

    if (!currentCaseDate.version_control) {
      message.error('请输入case版本名称');
      return false;
    }

    const islegalJSON = !request_body || isJSON(request_body);

    if (modeType === 'interface' && !islegalJSON) {
      message.error('请求体格式不合法');
      return false;
    }

    if (modeType === 'inject') {
      for (let key in injectRequestBody) {
        const islegalJSON = !injectRequestBody[key] || isJSON(injectRequestBody[key]);

        if (!islegalJSON) {
          message.error('请求体格式不合法');
          return false;
        }
      }
    }

    currentCaseDate.inject_point = inject_point
      .map(item => ({
        ...item,
        key: item.key.keyValue ? `${item.key.pre}.${item.key.keyValue}` : `${item.key.pre}`,
      }))
      .filter(item => item.key && item.content);

    currentCaseDate.check_point = check_point
      .map(item => ({
        ...item,
        content: this.contentTypTrans(item.content),
      }))
      .filter(item => {
        const keyValue = (item.key.pre === '$ResponseTime' || item.key.pre === '$ResponseStatus') ? item.key.pre : item.key.keyValue

        return keyValue && item.relation && this.checkValue(item.content)
      }).map(item => ({
        ...item,
        key: item.key.keyValue ? `${item.key.pre}.${item.key.keyValue}` : `${item.key.pre}`
      }));

    currentCaseDate.check_point
      ? (currentCaseDate.check_point = this.formatContent(currentCaseDate.check_point))
      : null;
    currentCaseDate.inject_point
      ? (currentCaseDate.inject_point = this.formatContent(currentCaseDate.inject_point))
      : null;

    // 对空数据进行处理
    for (var key in currentCaseDate) {
      if (
        !currentCaseDate[key] ||
        (typeof currentCaseDate[key] === 'object' && !Object.keys(currentCaseDate[key]).length)
      ) {
        delete currentCaseDate[key];
      }
    }

    // 请求头数据
    currentCaseDate.request_header = request_header_params;

    // 请求体数据
    if (modeType === 'interface') {
      if (!request_body || !Object.keys(JSON.parse(request_body)).length) {
        delete currentCaseDate.request_body;
      } else {
        currentCaseDate.request_body = JSON.stringify(JSON.parse(currentCaseDate.request_body));
      }
    }

    if (modeType === 'instance') {
      if (!currentCaseDate.request_body || !currentCaseDate.request_body.length) {
        delete currentCaseDate.request_body;
      }
    }

    if (modeType === 'inject') {
      for (let key in injectRequestBody) {
        if (injectRequestBody[key] && injectRequestBody[key] !== '{}') {
          _injectRequestBody[key] = JSON.parse(injectRequestBody[key]);
        }
      }
    }

    if (Object.keys(_injectRequestBody).length) {
      currentCaseDate.request_body = JSON.stringify(_injectRequestBody);
    }

    delete currentCaseDate.request_header_key;
    delete currentCaseDate.request_header_value;

    const { data, errmsg, success }: any = await manageCaseVersion(
      ManageMode.UPDATE,
      currentCaseDate,
    );

    if (!success) {
      message.error(errmsg);
      return;
    }

    message.success('保存成功');
    this.inintDate();
  };

  /**
   * 判断期望值是否有效
   */
  checkValue = (value: any) => {
    if (
      typeof value === 'object' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return true;
    }

    if ( typeof value === 'string') {
      return !!value
    }

    // if (typeof value === 'string' && (value[0] === "'" || value[0] === '"')) {
    //   return true
    // }

    return false;
  };

  formatContent = (value: any) => {
    // 剔除字符串前后的引号
    return value.map((item: any) =>
      typeof item.content === 'string'
        ? { ...item, content: item.content.replace(/^\"|\"$/g, '') }
        : item,
    );
  };

  /**
   * 弹出删除框
   */
  showConfirm = () => {
    confirm({
      title: '确认删除',
      content: '您确认删除此case版本吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => this.remove(),
    });
  };

  /**
   * 获取env_name
   */
  handleCaseEnv = async () => {
    const { location } = this.props;
    const modeType = location.query.modeType;
    const params = {
      content: '',
      page: '1',
      page_size: '20',
      method: modeType,
    };

    const { data, success, errmsg }: any = await caseEnvList(params);
    if (!success) {
      message.error(errmsg);
      return;
    }
    this.setState({ envNameList: data?.env_list || []  });
  };

  /**
   * 新增case版本，是基于所在版本进行复制
   */
  add = () => {
    const { panes, activeKey } = this.state;
    const currentCaseDate = { ...this.state.currentCaseDate };

    // 如果已经处于新增，那将不允许再次新增，除非保存当前新增的信息
    if (panes.filter(item => item.key === 'newVersion').length) {
      return false;
    }

    // 判断当前版本是不是已经保存
    if (panes.length && activeKey === 'newVersion') {
      // 没有保存
      message.warning('请先保存所在版本');
      return false;
    }

    currentCaseDate.version_control = '';
    panes.push({ title: '新版本', key: 'newVersion' });
    this.setState({ panes, activeKey: 'newVersion', currentCaseDate }, () => this.getCaseVersion());
  };

  remove = async () => {
    let { activeKey, panes, currentCaseDate } = this.state;

    // 如果只剩初始化的版本，则不能删除，根据version_id判断
    if (panes.length === 1 && activeKey === 'newVersion') {
      return false;
    }

    // 根据activeKey判断，是否需要调用删除接口
    if (activeKey !== 'newVersion') {
      const params = {
        case_id: currentCaseDate.case_id,
        version_control: activeKey,
      };

      // 调用删除接口
      const { errmsg, success }: any = await manageCaseVersion(ManageMode.DELETE, params);

      if (!success) {
        message.error(errmsg);
        return;
      }

      message.success('删除成功');
    }

    const newPanes = panes.filter(item => item.key !== activeKey);
    const newActiveKey = newPanes[newPanes.length - 1].key;

    this.setState({ panes: newPanes, activeKey: newActiveKey }, () => {
      this.getCaseVersion();
    });
  };

  /**
   * method列表接口【已注册】
   */
  getListMethod = async () => {
    const { data, success, errmsg }: any = await listMethod({
      filter_content: { page_size: '1000' },
    });

    if (!success) {
      message.error(errmsg);
      return;
    }

    this.setState({
      methodsList:
        data.method_list && data.method_list.length
          ? data.method_list.map((item: MethodInfo) => item.method_name)
          : [],
    });
  };

  /**
   * 选择method，展示相应的请求体
   */
  getDescribeRequest = async (messageName: string) => {
    const { data, success }: any = await describeRequest(messageName);
    const currentCaseDate: any = { ...this.state.currentCaseDate };

    if (!success) {
      message.warning('未检索到请求体，需手动输入');
      return false;
    }

    if (data.request_message !== '{}') {
      currentCaseDate.request_body = data.request_message;
      this.setState({ currentCaseDate });
    }
  };

  /**
   * 格式化初始数据（check_point、inject_point）
   */
  formatData = (data: any, type: string) => {
    return data
      ? data.map(
          item =>
            (item = {
              ...item,
              key: {
                pre: item.key.split('.')[0],
                keyValue: item.key
                  .split('.')
                  .filter((_: string, index: string) => index)
                  .join('.'),
              },
              content:
                type === 'check_point'
                  ? item.content[0] === '{'
                    ? `"${item.content}"`
                    : JSON.stringify(item.content)
                  : item.content,
            }),
        )
      : initDateOutput[type];
  };

  /**
   * 初始化数据
   */
  inintDate = async (tag?: string) => {
    let panesList = [...this.state.panes];
    let currentCaseDate = { ...this.state.currentCaseDate };

    if (currentCaseDate.case_id) {
      const params = {
        case_id: currentCaseDate.case_id,
      };

      const { data, success, errmsg }: any = await manageCase(ManageMode.QUERY, params);

      if (!success) {
        message.error(errmsg);
        return false;
      }

      // tag !== 'basic'  基础信息保存的时候不更新版本信息
      if (data.case_version && tag !== 'basic') {
        panesList = [];

        currentCaseDate = { ...data.case_version[0] };
        data.case_version.map(item =>
          panesList.push({
            title: item.version_control,
            key: item.version_control,
          }),
        );
      }

      if (tag !== 'basic') {
        this.initCaseVersion(currentCaseDate, data.case_version ? 'hasVersion' : 'noVersion');
      }

      const methods = data.method_name ? data.method_name : '';

      this.setState({
        panes: panesList,
        initName: data.case_name ? data.case_name : '',
        name: data.case_name ? data.case_name : '',
        currentCaseTagList: data.case_tags ? data.case_tags : [],
        instanceName: data.instance_name ? data.instance_name : '',
        methods,
        insertTime: data.insert_time ? data.insert_time : 0,
      });

      // 根据当前的 method_name 获取case版本信息
      this.getCaseVersionFromMethod(methods, 'init');
    }
  };

  /**
   * 初始化case某一版本
   */
  initCaseVersion = (data: any, type: string) => {
    let currentCaseDate = { ...data };
    const { location } = this.props;
    const modeType = location.query.modeType;

    if (type === 'hasVersion') {
      currentCaseDate = JSON.parse(JSON.stringify(this.formatCaseVersion(currentCaseDate)));

      if (modeType === 'inject') {
        this.setState({ injectRequestBody: currentCaseDate.request_body });
      }
    }

    this.setState({
      currentCaseDate: currentCaseDate,
      activeKey:
        currentCaseDate.version_control && type === 'hasVersion'
          ? currentCaseDate.version_control
          : `newVersion`,
    });
  };

  /**
   * 初始化request_body
   */
  formatRequestbody = (request_body: string) => {
    const { location } = this.props;
    const modeType = location.query.modeType;
    if (modeType === 'interface') {
      return request_body ? request_body : '{}';
    }
    if (modeType === 'instance') {
      return request_body ? request_body : '';
    }
    if (modeType === 'inject') {
      const obj: any = {};
      const _requestBody = request_body ? JSON.parse(request_body) : {};

      if (!request_body) {
        return defaultEnvRequest;
      }

      for (let key in defaultEnvRequest) {
        obj[key] = _requestBody[key] ? JSON.stringify(_requestBody[key]) : '{}';
      }

      return obj;
    }
  };

  /**
   * case版本的数据进行初始化
   */
  formatCaseVersion = (currentCaseDate: any) => {
    currentCaseDate.check_point = this.formatData(currentCaseDate.check_point, 'check_point');
    currentCaseDate.inject_point = this.formatData(currentCaseDate.inject_point, 'inject_point');
    currentCaseDate.sleep_point = currentCaseDate.sleep_point
      ? Number(currentCaseDate.sleep_point)
      : 0;
    currentCaseDate.request_body = this.formatRequestbody(currentCaseDate.request_body);
    currentCaseDate.url_parameter = currentCaseDate.url_parameter
      ? currentCaseDate.url_parameter
      : '';

    currentCaseDate.request_header_key = currentCaseDate.request_header
      ? Object.keys(currentCaseDate.request_header)
      : [''];
    currentCaseDate.request_header_value = currentCaseDate.request_header
      ? Object.values(currentCaseDate.request_header)
      : [''];

    return currentCaseDate;
  };

  /**
   * 根据 method 获取 case 版本列表
   */
  getCaseVersionFromMethod = (value: string, origin?: string) => {
    const { projectversionList } = this.state;
    const currentCaseDate = { ...this.state.currentCaseDate };
    let selectIterationList = [];

    // 根据methods 来判断是 哪个项目
    // 每个项目对应不同的版本列表
    let projectName = '';

    if (
      value.startsWith('Siber.Mage') ||
      value.startsWith('docUnderstanding') ||
      value.startsWith('docUnderstandingEngine') ||
      value.startsWith('InformationExtract') ||
      value.startsWith('FuzzySearch') ||
      value.startsWith('ocr')
    ) {
      projectName = 'Mage';
    } else if (value.startsWith('Siber.Commander')) {
      projectName = 'Commander';
    } else {
      projectName = 'Wulai';
    }

    // 如果私有部署的话、直接赋值、不用根据项目名设置case版本列表
    if (MODE !== 'pvt') {
      selectIterationList = projectversionList.filter(item => item.project_name === projectName)[0];
    } else {
      selectIterationList = projectversionList[0];
    }

    const _planVersionList = selectIterationList.history_iterations;
    const currentIteration = selectIterationList.current_iteration;

    if (!origin) {
      currentCaseDate.version_control = currentIteration;
    }

    this.setState({
      planVersionList: _planVersionList,
      currentCaseDate,
      projectName,
    });
  };

  handleMethodChange = (value: string) => {
    this.getCaseVersionFromMethod(value);
    this.setState({ methods: value }, () => this.getDescribeRequest(value));
  };

  /**
   * case名称变化
   */
  handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({ name: value });
  };

  /**
   * interface_name变化
   */
  handleInstanceNameChange = (value: string) => {
    this.setState({ instanceName: value });
  };

  /**
   * case版本变化
   */
  handleVersionChange = (value: string) => {
    const currentCaseDate: any = { ...this.state.currentCaseDate };
    currentCaseDate.version_control = value;

    this.setState({ currentCaseDate });
  };

  /**
   * mysql请求体变化
   */
  handleBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const currentCaseDate = { ...this.state.currentCaseDate };
    currentCaseDate.request_body = event.target.value;

    this.setState({ currentCaseDate });
  };

  /**
   * 获取JSON编辑器的值, 并进行解析
   */
  handleJsonChange = (json: any) => {
    const currentCaseDate = { ...this.state.currentCaseDate };
    currentCaseDate.request_body = json;

    this.setState({ currentCaseDate });
  };

  /**
   * 接口类型、运行环境变化
   */
  handleChange = (tag: string) => (e: string) => {
    const state = { ...this.state };
    state[tag] = e;
    this.setState(state);
  };

  handleRunClick = async () => {
    const { currentCaseDate } = this.state;

    if (!currentCaseDate.case_id) {
      message.warning('请先保存基础信息');
      return false;
    }

    // 自动保存
    await this.submitCaseVersion();

    this.setState({ runVisible: true });
  };

  handleRunCaseVersion = async () => {
    const { location } = this.props;
    const modeType = location.query.modeType;
    const {
      currentCaseDate: { case_id },
      initName,
      environment_name,
      interface_type,
      env_id,
      envNameList,
    } = this.state;
    const environment_id =
      modeType === 'instance'
        ? '5e3d5e1e2da9cd001f5edafa'
        : env_id
        ? env_id.toString()
        : envNameList && envNameList[0]
        ? envNameList[0].env_id
        : 0;
    const params = {
      interface_type: modeType === 'instance' ? 'grpc' : interface_type,
      environment_name,
      environment_id,
      case_id,
      case_name: initName,
    };

    let caseLogId = '';
    const { data, success, details }: any = await runCase(params);

    if (!success) {
      message.error(details[0].serving_data);
      caseLogId = details[0].request_id ? details[0].request_id : '';
    } else {
      caseLogId = data.case_log_id;
    }

    if (caseLogId) {
      window.open(
        `/case/detail/caseDetail?caseLogId=${caseLogId}%23caseId%3D${case_id}%26modeType%3D${modeType}&origin=case`,
        '_blank',
      );
    }
  };

  /**
   * case基础信息进行保存
   */
  submitCaseBasic = async () => {
    const { location } = this.props;
    const modeType = location.query.modeType;
    const {
      name,
      methods,
      insertTime,
      instanceName,
      currentCaseTagList,
      allCaseTagList,
    } = this.state;

    const currentCaseDate = { ...this.state.currentCaseDate };

    if (!name || !name.trim()) {
      message.error('case名称必填！');
      return false;
    }

    if (modeType === 'interface' && !methods) {
      message.error('method必填！');
      return false;
    }

    // 取差量
    //  differenceTagList = currentCaseTagList.filter(item => !allCaseTagList.includes(item))

    const params: any = {
      case_name: name,
      case_tags: currentCaseTagList,
      method_name: methods,
      insert_time: insertTime,
      case_mode: modeType,
    };

    if (modeType === 'instance') {
      params.instance_name = instanceName;
      delete params.method_name;
    }

    if (currentCaseDate.case_id) {
      params.case_id = currentCaseDate.case_id;
    }

    const { errmsg, success, data }: any = await manageCase(
      currentCaseDate.case_id ? ManageMode.UPDATE : ManageMode.CREATE,
      params,
    );

    if (!success) {
      message.error(errmsg);
      return false;
    }

    message.success('基础信息保存成功');

    currentCaseDate.case_id = data.case_id;
    await this.setState({ currentCaseDate });
    await this.inintDate('basic');
  };

  /**
   * 睡眠点修改
   */
  hanhleSleepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentCaseDate: any = { ...this.state.currentCaseDate };

    let val = e.target.value.replace(/\D/g, '');
    val = val.replace(/^0/, '');

    currentCaseDate.sleep_point = Number(val);

    this.setState({ currentCaseDate });
  };

  /*
   * 期望值类型预转换
   */
  contentTypTrans = (value: string) => {
    // 数字
    if (!isNaN(value)) {
      return parseFloat(value);
    }
    // 布尔
    if (value === 'true' || value === 'false') {
      return eval(value.toLowerCase());
    }

    // 数组
    if (value[0] === '[') {
      return eval(value);
    }

    return value;
  };

  /**
   * 添加一项
   */
  caseAdd = (type: string) => () => {
    const currentCaseDate: any = { ...this.state.currentCaseDate };

    const checkoutItem = {
      key: {
        pre: keyPreList[0],
        keyValue: '',
      },
      relation: '=',
      content: '',
    };

    type === 'inject_point' ? delete checkoutItem['relation'] : null;

    currentCaseDate[type].push(checkoutItem);

    this.setState({ currentCaseDate });
  };

  /**
   * 删除一项
   */
  deleted = (type: string, index: number) => () => {
    const currentCaseDate: any = { ...this.state.currentCaseDate };
    currentCaseDate[type].splice(index, 1);

    this.setState({ currentCaseDate });
  };

  /**
   * 修改一项
   */
  checkChange = (type: string, index: number, tag: string, originType?: string) => (e: any) => {
    const currentCaseDate: any = { ...this.state.currentCaseDate };
    // 判断是不是变量来源--进行特殊处理
    if (tag === 'key') {
      originType === 'pre'
        ? (currentCaseDate[type][index][tag].pre = e)
        : (currentCaseDate[type][index][tag].keyValue = e);
    } else {
      currentCaseDate[type][index][tag] = typeof e === 'string' ? e : e.target.value;
    }

    this.setState({ currentCaseDate });
  };

  handleHeaderChange = (tag: string, index: number, value: string) => {
    const currentCaseDate = { ...this.state.currentCaseDate };
    let { request_header_key, request_header_value }: any = currentCaseDate;

    tag === 'header_value'
      ? (request_header_value[index] = value)
      : (request_header_key[index] = value);
    this.setState({ currentCaseDate });
  };

  handleUrlChange = (e: any) => {
    const currentCaseDate: any = { ...this.state.currentCaseDate };
    currentCaseDate.url_parameter = e.target.value;

    this.setState({ currentCaseDate });
  };

  countEle = (arr: any, value: string) =>
    arr.reduce((pre: number, cut: string) => (cut === value ? pre + 1 : pre), 0);

  handleHeaderBlur = (index: number, tag: string) => (value: string) => {
    const currentCaseDate = { ...this.state.currentCaseDate };
    const { request_header_key }: any = currentCaseDate;

    if (tag === 'header_value') {
      return false;
    }

    const countEle = this.countEle(request_header_key, value);

    if (countEle > 1) {
      message.error('请求体的key不可重复');
      request_header_key[index] = '';
    }

    this.setState({ currentCaseDate });
  };

  handleOk = () => {
    this.setState({ runVisible: false }, () => this.handleRunCaseVersion());
  };

  handleCancel = () => {
    this.setState({ runVisible: false });
  };

  handleTagChange = (value: string[]) => {
    const _value = value.map(item => Boolean(item) && item.trim()).filter(item => !!item);

    this.setState({ currentCaseTagList: [..._value] });
  };

  imgchange = async event => {
    this.setState({ fileData: event.target.files[0] });
  };

  subImg = async () => {
    const { fileData } = this.state;

    let formData = new FormData();
    formData.append('img', fileData);
    const { success, data, errmsg } = await upload(formData);

    if (!success) {
      message.error(errmsg);
      return false;
    }

    message.success('上传成功');
    this.setState({ fileUrl: data.url });
  };

  copyUrl = () => {
    const { fileUrl } = this.state;
    copy(fileUrl) ? message.success('复制成功') : message.error('复制失败');
  };

  /**
   * 渲染 -检查项- 模块
   */
  renderCheckPoint = (type: string) => {
    const { currentCaseDate } = this.state;

    return (
      <div className={styles.output}>
        <dl className={styles.caseDl}>
          <div className={`${styles.caseDt} ${styles.output}`}>
            <dt>变量来源</dt>
            {type === 'check_point' ? <dt style={{ width: '15%' }}> 关系</dt> : null}
            <dt>{type === 'check_point' ? `期望值` : `变量名`}</dt>
          </div>

          {currentCaseDate[type]
            ? currentCaseDate[type].map((item: any, index: number) => (
                <div className={styles.caseDd} key={index}>
                  <dd>
                    <Select
                      value={item.key.pre}
                      onChange={this.checkChange(type, index, 'key', 'pre')}
                    >
                      {keyPreList.map(item => (
                        <Option key={item} value={item}>
                          {' '}
                          {item}{' '}
                        </Option>
                      ))}
                    </Select>
                    <Tooltip title={item?.key?.keyValue?.length > 16 ? item.key.keyValue : null}>
                      <AutoComplete
                        id={`origin-${type}-${index}`}
                        style={{
                          display:
                            item.key.pre !== '$ResponseTime' && item.key.pre !== '$ResponseStatus'
                              ? 'block'
                              : 'none',
                          width: '150%',
                        }}
                        value={item?.key?.keyValue || ''}
                        options={['$json']}
                        options={[]}
                        onChange={this.checkChange(type, index, 'key', 'value')}
                      />
                    </Tooltip>
                  </dd>
                  {type === 'check_point' ? (
                    <dd style={{ width: '15%' }}>
                      <Select
                        value={item.relation}
                        onChange={this.checkChange(type, index, 'relation')}
                      >
                        {checkPoint.map(item => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    </dd>
                  ) : null}

                  <dd>
                    <Tooltip title={item.content?.length > 16 ? item.content : null}>
                      <Input
                        value={item.content}
                        id={`variable-${type}-${index}`}
                        onChange={this.checkChange(type, index, 'content')}
                        autoComplete="off"
                      />
                    </Tooltip>
                  </dd>
                  <MinusCircleOutlined
                    className={styles.iconButton}
                    onClick={this.deleted(type, index)}
                  />
                </div>
              ))
            : null}
        </dl>
        <div style={{ width: '100%', display: 'flex' }}>
          <Button type="dashed" onClick={this.caseAdd(type)} className={styles.addBtn}>
            <PlusOutlined />
            添加一项
          </Button>
        </div>
      </div>
    );
  };

  renderCaseName = (activeKey: string) => {
    const { currentCaseDate, planVersionList } = this.state;
    const { version_control } = currentCaseDate;

    return (
      <Fragment>
        <h5>case版本：</h5>
        <dd>
          <Select
            showSearch={true}
            value={version_control}
            onChange={this.handleVersionChange}
            disabled={activeKey !== 'newVersion' ? true : false}
            placeholder="请选择Case版本"
          >
            {planVersionList.map((item: string) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        </dd>
      </Fragment>
    );
  };

  renderCaseVersion = (activeKey: string) => {
    const { location } = this.props;
    const modeType = location.query.modeType;
    const { currentCaseDate, envNameList, injectRequestBody, fileUrl } = this.state;
    const { sleep_point, request_body, url_parameter } = currentCaseDate;

    if (modeType === 'inject') {
      return (
        <Fragment>
          {this.renderCaseName(activeKey)}
          {
            <RenderInjectCase
              handleJsonChange={this.handleJsonChange}
              initeDate={request_body}
              injectRequestBody={injectRequestBody}
            />
          }
          <h5>注入项：</h5>
          {this.renderCheckPoint('inject_point')}
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          <dl>
            {this.renderCaseName(activeKey)}

            {modeType === 'instance' ? null : <Fragment>
              <h5>url参数：</h5>
              <Input value={url_parameter} onChange={this.handleUrlChange} />

              <h5>请求头：</h5>
              <RenderHeaderTable
                currentCaseDate={currentCaseDate}
                handleHeaderChange={this.handleHeaderChange}
                changeRequestHeader={this.changeRequestHeader}
                handleHeaderBlur={this.handleHeaderBlur}
                envNameList={envNameList}
              />

              <h5>上传文件：</h5>
              <input
                type="file"
                name="img"
                accept=".jpg, .png, .jpeg, .png, .pdf, .bmp, .tiff, .gif, .txt, .doc, .docx"
                onChange={this.imgchange}
              />
              <Button onClick={this.subImg} style={{ marginLeft: 0 }}>
                上传
              </Button>
              {fileUrl ? (
                <div style={{ marginTop: '20px' }}>
                  <span>文件存储地址：{fileUrl}</span>
                  <Button onClick={this.copyUrl}>复制</Button>
                </div>
              ) : null}

            </Fragment>}
            
            <h5>请求体：</h5>
            {modeType === 'instance' ? (
              <TextArea
                value={request_body}
                style={{ height: '200px' }}
                onChange={this.handleBodyChange}
              />
            ) : (
              <JsonEditor
                id={`case-input-${activeKey}`}
                onJsonChange={this.handleJsonChange}
                initeDate={request_body}
              />
            )}

            <h5>注入项：</h5>
            {this.renderCheckPoint('inject_point')}

            <h5>检查项：</h5>
            {this.renderCheckPoint('check_point')}

            <h5>睡眠时间：</h5>
            <Input
              placeholder="请填写睡眠时间"
              value={sleep_point.toString()}
              onChange={this.hanhleSleepChange}
              autoComplete="off"
            />
          </dl>
        </Fragment>
      );
    }
  };

  renderCaseBasic = () => {
    const { location } = this.props;
    const modeType = location.query.modeType;
    const { methods, methodsList, instanceName, envNameList } = this.state;

    if (modeType === 'inject') {
      return null;
    }

    if (modeType == 'instance') {
      return (
        <dl>
          <dt>所在的实例：</dt>
          <dd>
            <Select
              value={instanceName}
              style={{ width: '100%' }}
              onChange={this.handleInstanceNameChange}
            >
              {envNameList.map(value => (
                <Option key={value.env_name}>{value.env_name}</Option>
              ))}
            </Select>
          </dd>
        </dl>
      );
    }

    if (modeType == 'interface') {
      return (
        <dl>
          <dt>所在的Method：</dt>
          <dd>
            <Select
              value={methods}
              showSearch={true}
              style={{ width: '100%' }}
              placeholder="请选择method"
              optionFilterProp="children"
              onChange={this.handleMethodChange}
              filterOption={true}
            >
              {methodsList && methodsList.length
                ? methodsList.map((item: any) => (item ? <Option key={item}>{item}</Option> : null))
                : null}
            </Select>
          </dd>
        </dl>
      );
    }
  };

  render() {
    const { location } = this.props;
    const modeType = location.query.modeType;
    const {
      name,
      methods,
      methodsList,
      interface_type,
      environment_name,
      runVisible,
      activeKey,
      panes,
      instanceName,
      envNameList,
      allCaseTagList,
      currentCaseTagList,
    } = this.state;

    return (
      <div className={styles.container}>
        <Row type="flex" justify="space-around">
          <Col span={20}>
            <div className={styles.basic}>
              <Card title="基础设置" bordered={false}>
                <dl>
                  <dt>Case名称：</dt>
                  <dd>
                    <Input
                      placeholder="请输入Case名称"
                      value={name}
                      onChange={this.handleNameChange}
                      autoComplete="off"
                    />
                  </dd>
                </dl>

                {this.renderCaseBasic()}

                <dl>
                  <dt>打标签：</dt>
                  <Select
                    mode="tags"
                    placeholder="请选择标签"
                    value={currentCaseTagList}
                    onChange={this.handleTagChange}
                    style={{ width: '100%' }}
                  >
                    {allCaseTagList.map(item => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </dl>

                <dl>
                  <Button type="primary" onClick={this.submitCaseBasic}>
                    保存
                  </Button>
                </dl>
              </Card>
            </div>

            <Card title="Case设置" bordered={false}>
              <Tabs
                hideAdd={true}
                onChange={this.onTabsChange}
                activeKey={activeKey}
                type="card"
                onEdit={this.onEdit}
              >
                {panes.map((pane) => (
                  <TabPane tab={pane.title} key={pane.key}>
                    {this.renderCaseVersion(pane.key)}
                  </TabPane>
                ))}
              </Tabs>
              <dl className={styles.caseSettingBtn}>
                <Button type="primary" onClick={this.submitCaseVersion}>
                  保存
                </Button>
                <Button type="primary" onClick={this.add}>
                  新增版本
                </Button>
                <Button type="primary" onClick={this.showConfirm}>
                  删除
                </Button>
                <Button type="primary" onClick={this.handleRunClick}>
                  运行
                </Button>
              </dl>
            </Card>
          </Col>
        </Row>
        <Modal
          title="Case运行"
          visible={runVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          maskClosable={false}
          okText="运行"
          cancelText="取消"
        >
          {modeType === 'interface' ? (
            <div>
              <div className={styles.runModal}>
                <h5>接口类型：</h5>
                <Select
                  value={interface_type}
                  onChange={this.handleChange('interface_type')}
                  style={{ width: '100%' }}
                >
                  <Option value={EINTERFACE_TYPE.HTTP}>{INTERFACE_TYPE.HTTP}</Option>
                  <Option value={EINTERFACE_TYPE.GRPC}>{INTERFACE_TYPE.GRPC}</Option>
                </Select>
              </div>

              <div className={styles.runModal}>
                <h5>环境配置：</h5>
                <Select
                  style={{ width: '100%' }}
                  defaultValue={
                    envNameList && envNameList[0] ? envNameList[0].env_name : '请选择协议名称'
                  }
                  onChange={this.handleChange('env_id')}
                >
                  {envNameList.map(value => (
                    <Option key={value.env_id}>{value.env_name}</Option>
                  ))}
                </Select>
              </div>
            </div>
          ) : (
            <div className={styles.runModal}>
              <h5>运行协议: </h5>
              <Input value="mysql" style={{ width: '100%' }} disabled={true} autoComplete="off" />
            </div>
          )}

          <div className={styles.runModal}>
            <h5>运行环境：</h5>
            <Select
              value={environment_name}
              onChange={this.handleChange('environment_name')}
              style={{ width: '100%' }}
            >
              <Option value={EENVIRONMENT_TYPE.DEV}>{ENVIRONMENT_TYPE.DEV}</Option>
              <Option value={EENVIRONMENT_TYPE.TEST}>{ENVIRONMENT_TYPE.TEST}</Option>
              <Option value={EENVIRONMENT_TYPE.STAGE}>{ENVIRONMENT_TYPE.STAGE}</Option>
              <Option value={EENVIRONMENT_TYPE.PROD}>{ENVIRONMENT_TYPE.PROD}</Option>
            </Select>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withRouter(connect()(CaseDetail));
