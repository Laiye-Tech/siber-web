export interface EnvList {
  env_list: EnvListInfo[]
  total_num: number
}

export interface EnvListInfo {
  env_id: string;
  env_name: string;
  grpc?: object;
  http?: object
  db_insert_time: number;
  db_update_time: number;
}

export interface EnvInfo {
  env_id?: string;
  env_name?: string;
  env_mode?: string;
  grpc?: object;
  http?: object;
  insert_time?: string;
  host?: string
	port?: number
	db?: string
	user?: string
	password?: string
	charset?: string
	instance_type?: string
}

// export const ENV_TYPE  = {
//   'dev_envoy' : 'gRPC联调' ,
//   'test_envoy' : 'gRPC测试',
//   'stage_envoy' : 'gRPC灰度',
//   'prod_envoy' : 'gRPC线上',
//   'dev_url' : 'HTTP联调',
//   'test_url' : 'HTTP测试',
//   'stage_url' : 'HTTP灰度',
//   'prod_url' : 'HTTP线上'
// }

export const ENV_GRPC_TYPE  = {
  'dev_envoy' : '开发' ,
  'test_envoy' : '测试',
  'stage_envoy' : '灰度',
  'prod_envoy' : '线上',
}

export const ENV_HTTP_TYPE  = {
  'dev_url' : '开发',
  'test_url' : '测试',
  'stage_url' : '灰度',
  'prod_url' : '线上'
}

export interface FilterInfo {
  filter_content: any;
}

export interface EnvInstance {
	env_id?: string;
	env_name?: string;
	instance?: string;
}

export interface EnvInfoInstance {
	host?: string
	port?: number
	db?: string
	user?: string
	password?: string
	charset?: string
	instance_type?: string
}
