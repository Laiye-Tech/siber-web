import { post } from '@/services';

import {
	FlowLogInfoList
  } from '../interface/flowLog';

/**
 * 查询flow日志
 */
export async function flowLog(planLogId: string) {
	const url = '/log/list/flow';
	const requestBody = {
			plan_log_id: planLogId
	};

	return post<FlowLogInfoList>(url, requestBody);
}
