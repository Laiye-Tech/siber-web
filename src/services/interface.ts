export type AxiosResult<T> = {
  success: boolean;
  code: number;
  data: T | null;
  errmsg: string;
  details: any[]
};

export enum ManageMode {
  'QUERY' = 'QUERY',
  'CREATE' = 'CREATE',
  'UPDATE' = 'UPDATE',
  'DELETE' = 'DELETE',
  'DUPLICATE'= 'DUPLICATE'
}

export interface FilterInfo {
  filter_content: any;
}

export interface checkPointKey {
  pre: string,
  keyValue: string
}
export interface ManageActionSub {
  key: checkPointKey;
  relation?: string;
  content: string;
}

export type InputDate = {
  /** 输入request_header */
  request_header: any;
  /** 输入request_body */
  request_body: any;
};

export type OutputDate = {
  /** 输出check_point */
  check_point: ManageActionSub[];
  /** 输出inject_point */
  inject_point: ManageActionSub[];
  /** 输出sleep_point */
  sleep_point: number;
};

export type EnvRequest = {
  content: string;
  page: string;
  page_size: string;
  method: string;
};
