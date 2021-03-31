import { PlanLogInfo } from './index'

export interface PlanLogInfoList {
	plan_log_list: PlanLogInfo[];
}


export interface PlanLogParams {
	planName?: string,
  planStatus?: number[],
  interfaceType?: string[],
  trigger?: string[],
  environmentName?: string[],
  versionControl?: string[]
}
