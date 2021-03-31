export interface PlanInfo {
  plan_id?: string;
  plan_name?: string;
  flow_list?: string[];
  environment_name?: string; // plan的执行环境，如：测试环境/灰度环境
  interface_type?: string; //plan执行的类型，如：http/grpc
  version_control?: string; //plan执行的版本，如：V3.24
  remark?: string;
  invalid_date?: number;
  user_update?: string;
  insert_time?: number;
  update_time?: number;
  environment_id?: string;
  env_name?: string;
  threads: number;
  trigger_condition: trigger_condition_item[];
}

export interface trigger_condition_item {
  environment_name: string;
  trigger_cron: string; // 定时触发的配置，如： */1 * * * *
  trigger_service_list: string[];
}

export interface PlanLogInfo {
  plan_log_id?: string;
  flow_log_id?: string;
  flow_id?: string;
  plan_id?: string;
  plan_name?: string;
  method_name?: string;
  flow_status?: number;
  plan_status?: number;
  case_status?: number;
  trigger?: string;
  version_control?: string;
  environment_name?: string; // plan的执行环境，如：测试环境/灰度环境
  interface_type?: string; //plan执行的类型，如：http/grpc
  db_insert_time?: number;
  db_update_time?: number;
  request_template?: string;
  request_value?: string;
  action?: string[];
  action_consequence?: string[];
  response_value?: string[];
  url?: string;
  case_name?: string;
  flow_name?: string;
}

export interface ResponseDetail {
  header: Map<string, string>;
  body: string;
  status_code: number; //响应码
  cost_time: number; // 响应时间
}

export interface CaseLog {
  case_log_id: string; // 自动生成的主键
  plan_log_id: string; // plan log 表中的 plan_log_id
  flow_log_id: string; // flow log 表中的 flow_log_id
  plan_name: string; // --以下为： case 所在 plan/flow 的name及ID。冗余作用，用于统计分析
  plan_id: string;
  flow_name: string;
  flow_id: string;
  flow_case_id: string;
  case_name: string; // -- 以下为：case配置的信息，用于历史信息保存。防止case修改后，找不到执行现场
  case_id: string;
  method_name: string;
  method_id: string;
  request_template: ResponseDetail;
  request_value: ResponseDetail; // 渲染后的request，实际发送给接口的值
  response_value: ResponseDetail; // 接口的实际返回值
  action: string[]; // case配置的action
  action_consequence: string[]; // action的执行结果
  case_status: number; // case的运行状态。0-等待 1-进行中 2-成功 3-失败 9-终止
  db_insert_time: number; // case开始运行时间
  db_update_time: number; // case运行结束/终止时间
  err_content: string; // case 失败原因，不仅action检查失败会失败，可能配置或者环境有问题导致失败
  url: string;
}

export interface GetIterationsResponse {
  current_iteration: string;
  history_iterations: string[];
}

export interface GetAllProjectsResponse {
  projects: string[];
}

export interface PlanLogList {
  plan_log_list: PlanLogInfo[];
}

export interface GetAllBranchByProjectResponse {
  branches: string[];
}

export interface PlanInfoList {
  plan_info_list: PlanInfo[];
}

export enum EINTERFACE_TYPE {
  'HTTP' = 'http',
  'GRPC' = 'grpc',
}

export enum EENVIRONMENT_TYPE {
  'DEV' = 'dev',
  'TEST' = 'test',
  'STAGE' = 'stage',
  'PROD' = 'prod',
}

export enum ETRIGGER_TYPE {
  'MANUAL',
  'TIMING',
  'ONLINE',
}

export enum EMERGEBRANCH_TYPE {
  'test' = 'test',
  'master' = 'master',
}

export enum ENVIRONMENT_TYPE {
  TEST = '测试环境',
  STAGE = '灰度环境',
  DEV = '开发环境',
  PROD = '线上环境',
  test = '测试环境',
  stage = '灰度环境',
  dev = '开发环境',
  prod = '线上环境',
}

export enum LOGSTATUS_TYPE {
  '等待' = 0,
  '进行中' = 1,
  '成功' = 2,
  '失败' = 3,
  '终止' = 9,
}

export const TRIGGER_TYPE = {
  MANUAL: '手动触发',
  TIMING: '定时触发',
  ONLINE: '线上触发',
};

export const INTERFACE_TYPE = {
  HTTP: 'http',
  GRPC: 'grpc',
};

export const STATUSCOLOR = {
  0: 'gray',
  1: 'gray',
  2: 'green',
  3: 'red',
  9: 'blur',
};
