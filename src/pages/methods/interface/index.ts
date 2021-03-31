export interface ServiceInfo {
  service_name: string;
  method_list: string[];
}

export interface PlanInfoList {
  proto_files: string[];
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

export interface MethodInfo {
  method_name: string;
  method_type: string;
  proto_files?: string[];
  import_paths?: string[];
  http_uri?: string;
  http_request_mode?: string;
  insert_time: string;
  graph_query?: string;
  service?: string;
}

export const RequestMethodList = [
  'POST',
  'GET',
  'PUT',
  'COPY',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'LOCK',
  'PURGE',
  'LINK',
  'UNLINK',
  'UNLOCK',
  'VIEW',
  'PROPFIND',
];

export const HttpMethodPre = [
  'Siber.OpenAPI',
  'Siber.Frontend',
  'Siber.Algorithm',
  'Siber.Mage',
  'Siber.Commander',
];

type graphql_query_detail_item = {
  version: string;
  query_string: string;
};

export interface QraphqlQueryInfo {
  http_uri: string;
  graphql_query_detail: graphql_query_detail_item[];
}
