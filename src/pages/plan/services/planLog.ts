import { post } from '@/services';

import { PlanLogInfoList, PlanLogParams } from '../interface/planLog';


/**
 * plan log 日志查询
 */
export async function planLog(
  plan_id: string,
  params: PlanLogParams,
  page: number,
  page_size: number
) {
  const url = '/log/list/plan';
  const requestBody = {
    plan_id,
    params,
    page,
    page_size
  };

  return post<PlanLogInfoList>(url, requestBody);
}
