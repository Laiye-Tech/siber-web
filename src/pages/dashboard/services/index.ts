import { post } from '@/services';

import { caseNumberList } from '../interface';

/**
 * 查询case列表
 */

export async function caseNumber(start_time: number, end_time: number) {
	const url = '/stat/case';
	const requestBody = {
		start_time,
		end_time
	};

	return post<caseNumberList>(url, requestBody);
}

/**
 * 查询plan列表
 */

export async function planNumber(start_time: number, end_time: number) {
	const url = '/stat/planlog';
	const requestBody = {
		start_time,
		end_time
	};

	return post<caseNumberList>(url, requestBody);
}

/**
 * 查询caselog列表
 */

export async function caseLogNumber(start_time: number, end_time: number) {
	const url = '/stat/caselog';
	const requestBody = {
		start_time,
		end_time
	};

	return post<caseNumberList>(url, requestBody);
}
