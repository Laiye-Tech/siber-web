import { post } from '@/services';
import { ManageMode, FilterInfo } from '@/services/interface';
import { FlowInfo, FlowInfoList } from '../interface';

/**
 * 查询 flow 列表
 */
export async function listFlow(filterInfo: FilterInfo) {
  const url = '/list/flow';
  const requestBody = filterInfo;

  return post<FlowInfoList>(url, requestBody);
}

/**
 * 操作单个 flow
 */
export async function manageFlow(manageMode: ManageMode, flowInfo: FlowInfo) {
  const url = '/manage/flow';
  const requestBody = {
    manage_mode: manageMode,
    flow_info: flowInfo,
  };

  return post<FlowInfo>(url, requestBody);
}
