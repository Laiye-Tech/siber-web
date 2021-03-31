import moment from 'moment'

const TODAY = parseInt(
  moment()
    .add(0, 'days')
    .format('YYYYMMDD'),
  10
)

const THREEMOTHAGO = parseInt(
  moment()
    .add(-90, 'days')
    .format('YYYYMMDD'),
  10
)

export interface caseNumber {
	total_num?: number;
	increase_num?: number;
	time: number;
	total_run_num?: number
	successful_run_num?: number;
	failed_run_num?: number;
}

export interface caseNumberList {
	list: caseNumber[]
}

// 日期选择范围在90天以内,不包括今天
export function disabledDateFor90DaysExToday(dates: any) {
  const chose = parseInt(dates.format('YYYYMMDD'), 10)
  return chose > TODAY || chose <= THREEMOTHAGO
}
