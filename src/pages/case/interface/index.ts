export interface CaseProps {
  methodList: any[];
}

export interface CaseInfo {
  case_id?: string;
  method_name?: string; // 方法名称,格式：应用名.服务名.方法名
  case_name?: string; // case名称，用户自定义
  case_tags?: string[]; // case的tag
  request_header?: any[]; // request的header，用户自定义
  request_body?: string; // request的body，用户自定义
  check_point?: any[]; //检查点，诸如：检查response body 中的 username='tina'
  inject_point?: any[]; //注入点，诸如：保存response body 中的 username 为变量
  sleep_point?: number; //睡眠点，执行完方法后休息多久
  parent_cases?: string; // 程序根据request 生成，不需要用户维护
  remark?: string; //备注，用户填充
  invalid_date?: number; //失效时间，未失效的case该值为0
  user_update?: string; //最后修改的用户名称
  insert_time?: number; // case创建时间
  update_time?: number; // case最后修改时间
  version_control?: string; //case版本
}

export interface MethodInfo {
  method_name: string;
  proto_files: string[];
  import_paths: string[];
  http_uri: string;
  http_request_mode: string;
}

export interface CaseInfoList {
  case_info_list: CaseInfo[];
}

export interface MethodInfoList {
  method_list: MethodInfo[];
}

export interface CaseVersion {
  case_id: string;
  version_control: string;
}

export interface MethodDescribe {
  proto_files: string;
  http_request_mode: string;
  http_uri: string;
  method_name: string;
  request_message: string;
  response_message: string;
  import_paths: string[];
}

export interface RunCaseRequest {
  case_id: string;
  case_name: string;
  environment_name: string; // plan的执行环境，开发：dev  测试：test  灰度：stage
  environment_id: string;
  interface_type: string; //plan执行的类型，如：http/grpc/OpenAPI
}

export interface CaseTagInfo {
  tag_id: string;
  tag_name: string;
  insert_time: string;
  update_time: string;
}

export interface CaseTagInfoList {
  tag_list: CaseTagInfo[];
}

export const checkPoint = [
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'exist',
  'length',
  'in',
  'include',
  'not include',
];

export const keyPreList = [
  '$ResponseBody',
  '$ResponseHeader',
  '$ResponseTime',
  '$ResponseStatus',
  '$RequestBody',
  '$RequestHeader',
];

export const ENV_REQUEST_TYPE = {
  dev: '开发',
  test: '测试',
  stage: '灰度',
  prod: '线上',
};

export const GRPC_MAGE_LIST = [
  'docUnderstanding',
  'docUnderstandingEngine',
  'InformationExtract',
  'FuzzySearch',
  'ocr',
];
