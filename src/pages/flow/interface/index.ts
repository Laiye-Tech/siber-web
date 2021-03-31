export interface ManageFlowCaseSub {
  order: string;
  case_id: string;
}

export interface FlowInfo {
  flow_id?: string;
  flow_name?: string;
  case_list?: string[];
  case_list_detail?: ManageFlowCaseSub[]; // 在flow中修改case后，视为定制化case，修改后的case详情存在这里
  remark?: string;
  variable_input?: string; // case级别定义的变量，I期用不到
  variable_output?: string; //case级别定义的变量，I期用不到
  invalid_date?: number;
  user_update?: string;
  insert_time?: number;
  update_time?: number;
  run_mode: string;
}

export enum ErunMode {
  IGNORE_ERROR='IGNORE_ERROR',
  ABORT='ABORT'
}

export interface FlowInfoList {
  flow_info_list: FlowInfo[];
}
