import { post } from '@/services';

import {
    CaseLogInfoList
  } from '../interface/caseLog';

/**
 * 查询case日志
 */
export async function caseLog(flowLogId: string) {
	const url = '/log/list/case';
	const requestBody = {
	flow_log_id: flowLogId
	};

	return post<CaseLogInfoList>(url, requestBody);
}
