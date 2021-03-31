import { post } from '@/services';

import {
	PlanLogInfo
  } from '../interface';

/**
 * 查询case详情
 */
export async function caseLogDetail(caseLogId: string) {
	const url = '/log/detail/case';
	const requestBody = {
		case_log_id: caseLogId
	};

	return post<PlanLogInfo>(url, requestBody);
}
