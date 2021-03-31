import React from 'react'
import moment from 'moment'
import { DatePicker } from 'antd'
import { caseNumber, planNumber, caseLogNumber } from './services'
import { caseNumberList, disabledDateFor90DaysExToday } from './interface'

const echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/legend')
require('echarts/lib/component/grid')

const calcTime = (time: any) => Math.round(time/1000)
const { RangePicker } = DatePicker

type State = {
  /** caseList列表 */
  caseList: caseNumberList[]
  planList: caseNumberList[]
  caseLogList: caseNumberList[]
  startDate: number
  endDate: number
}

class Dashboard extends React.Component<any, State> {
  selectDatePicker: (_:any, datastring: any) => void

  constructor(props: any) {
    super(props)
    this.state = {
      caseList: [],
      planList: [],
      caseLogList: [],
      startDate: calcTime(moment().startOf('day').add(-6,'days')).valueOf(),
      endDate: calcTime(moment(Date.now())).valueOf(),
    }
    this.selectDatePicker = this._selectDatePicker.bind(this)
  }


  componentDidMount() {
    this.getCaseList()
  }

  /**
    * 基于准备好的dom，初始化echarts实例
    */

  initializationState = () => {
    const { caseList, planList, caseLogList } = this.state

    var caseChart = echarts.init(document.getElementById('case'))
    var planChart = echarts.init(document.getElementById('plan'))
    var caseLogChart = echarts.init(document.getElementById('caseLog'))
    // 绘制图表
    caseChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data:['case总数量','新增case数量']
      },
      grid: {
        containLabel: true
      },
      xAxis: {
        type: 'category',
        nameGap: 20,
        name: '时间',
        data: this.handleDate(caseList, 'time')
      },
      yAxis: {
        type: 'value',
        nameGap: 20,
        name: '数量',
        min: 0
      },
      series: [
        {
          name:'case总数量',
          type:'line',
          data: this.handleDate(caseList, 'total_num')
        },
        {
          name:'新增case数量',
          type:'line',
          data: this.handleDate(caseList, 'increase_num')
        }
      ]
    })
    planChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data:['运行的plan总量','plan成功数量']
      },
      grid: {
        top: 120,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        nameGap: 20,
        name: '时间',
        data: this.handleDate(caseList, 'time')
      },
      yAxis: {
        type: 'value',
        nameGap: 20,
        name: '数量',
        min: 0
      },
      series: [
        {
          name:'运行的plan总量',
          type:'line',
          data: this.handleDate(planList, 'total_run_num')
        },
        {
          name:'plan成功数量',
          type:'line',
          data: this.handleDate(planList, 'successful_run_num')
        }
      ]
    })
    caseLogChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data:['运行的case总量','case成功数量', 'case失败数量']
      },
      grid: {
        top: 120,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        nameGap: 20,
        name: '时间',
        data: this.handleDate(caseList, 'time')
      },
      yAxis: {
        type: 'value',
        nameGap: 20,
        name: '数量',
        min: 0
      },
      series: [
        {
          name:'运行的case总量',
          type:'line',
          data: this.handleDate(caseLogList, 'total_run_num')
        },
        {
          name:'case成功数量',
          type:'line',
          data: this.handleDate(caseLogList, 'successful_run_num')
        },
        {
          name:'case失败数量',
          type:'line',
          data: this.handleDate(caseLogList, 'failed_run_num')
        }
      ]
    })
  }

  /**
   * 获取case相关统计
   */

  getCaseList = async () => {
    const { startDate, endDate } = this.state

    try {
      const { data }: any = await caseNumber(startDate, endDate)
      this.setState({ caseList: data ? data.list : [] })
    } catch (error) {
      console.log('获取case相关统计失败', error)
    }
    try {
      const { data }: any = await planNumber(startDate, endDate)
      this.setState({ planList: data ? data.list : [] })
    } catch (error) {
      console.log('获取plan相关统计失败', error)
    }
    try {
      const { data }: any = await caseLogNumber(startDate, endDate)
      this.setState({ caseLogList: data ? data.list : [] })
    } catch (error) {
      console.log('获取caselog相关统计失败', error)
    }
    this.initializationState()
  }

  /**
   * 获取数据
   */

  handleDate = (data: any[], name: string) => {
    const test: any[] = []
    data.map((item, _) => {
      test.push(item[name] ? item[name] : 0)
    })
    return test
  }

  /**
   * 时间选择
   */

  _selectDatePicker(_: any, dateString: any) {
    const startDate = calcTime(moment(dateString[0]).startOf('hour').valueOf())
    const endDate = calcTime(moment(dateString[1]).endOf('d').valueOf()) - 1

    this.setState(
      {
        startDate,
        endDate
      },
      () => this.getCaseList()
    )
  }

  render() {
      return (
          <div>
            <section>
              <RangePicker
                onChange={this.selectDatePicker}
                allowClear={false}
                disabledDate={disabledDateFor90DaysExToday}
                defaultValue={[moment(Date.now()).add(-6, "days"), moment(Date.now())]}
              />
            </section>
            <br />
            <br />
            <br />
            <section>

              <div id="case" style={{ width: '100%', height: 600 }} />
              <div id="plan" style={{ width: '100%', height: 600 }} />
              <div id="caseLog" style={{ width: '100%', height: 600 }} />
            </section>
          </div>
      )
  }
}

export default Dashboard
