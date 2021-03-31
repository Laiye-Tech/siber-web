import { post } from '@/services';
import { ManageMode, FilterInfo } from '@/services/interface';

/**
 * 查询 process plan列表
 */
export async function listProcess(filterInfo: FilterInfo) {
  const url = 'list/processplan';
  const requestBody = filterInfo;

  return post<any>(url, requestBody);
}

/**
 * 查询 process 列表
 */
export async function listProcessNameList() {
  const url = 'list/process';
  const requestBody = {};

  return post<any>(url, requestBody);
}

/**
 * 操作单个 process
 */
export async function manageProcess(manageMode: ManageMode, process_plan_info: any) {
  const url = '/manage/processplan';
  const requestBody = {
    manage_mode: manageMode,
    process_plan_info,
  };

  return post<any>(url, requestBody);
}

/**
 * 查询 process plan log列表
 */
export async function listProcessPlanLog(processName: string, tag?: string) {
  const url = 'list/processplanlog';
  const requestBody = {
    process_name: processName
  };

  if (tag) {
    requestBody.tag = tag
  }

  return post<any>(url, requestBody);
}

