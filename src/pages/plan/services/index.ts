import { post } from '@/services';
import { ManageMode, FilterInfo } from '@/services/interface';

import { PlanInfo,
  PlanInfoList,
  PlanLogList,
  GetIterationsResponse,
  GetAllProjectsResponse,
  GetAllBranchByProjectResponse
} from '../interface';

/**
 * 查询 plan 列表
 */
export async function listPlan(filterInfo: FilterInfo) {
  const url = '/list/plan';
  const requestBody = filterInfo;

  return post<PlanInfoList>(url, requestBody);
}

/**
 * 操作单个 plan
 */
export async function managePlan(manageMode: ManageMode, planInfo: PlanInfo) {
  const url = '/manage/plan';
  const requestBody = {
    manage_mode: manageMode,
    plan_info: planInfo,
  };

  return post<PlanInfo>(url, requestBody);
}

/**
 * 运行单个plan
 */
export async function runPlan(planId: string, environmentName: string) {
  const url = '/run/plan';
  const requestBody = {
    plan_info: {
      plan_id: planId
    },
    trigger_condition: {
      environment_name: environmentName
    }
  };

  return post<PlanLogList>(url, requestBody);
}

/**
 * plan版本
 */
export async function getPlanVersionList() {
  const url = '/ci/iterations';
  const requestBody = {};

  return post<GetIterationsResponse>(url, requestBody);
}

/**
 * plan获取全部项目列表
 */
export async function getPlanProjectList() {
  const url = '/ci/list/project';
  const requestBody = {};

  return post<GetAllProjectsResponse>(url, requestBody);
}

/**
 * 根据项目获取分支
 */
export async function getBranchList(project: string) {
  const url = '/ci/list/branch';
  const requestBody = {project};

  return post<GetAllBranchByProjectResponse>(url, requestBody);
}

