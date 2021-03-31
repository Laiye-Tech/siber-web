import React, { useState, useEffect, Fragment } from 'react'

import { Button, Input, Popover, Checkbox } from 'antd';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import styles from './index.less'

const { Search } = Input;

type Props = {
  currentPage: number
  dataList: any[]
  searchValue: string
  getList: (searchValue?: string) => Promise<false | undefined>
  setPage: (page?: number) => void
  setnewcaseList: () => void
  onSelect: (item: any) => void
  setSearchValue: (value: string) => void
}

const SelectPaging = (props: Props) => {
  const { dataList, getList, currentPage, setPage, onSelect, setnewcaseList, setSearchValue, searchValue } = props
  const [selectValue, setSelectValue] = useState<string>('')
  const [visible, setVisible] = useState<boolean>(false)
  const [icon, setIcon] = useState<string>('caret-down')
  const [checkAll, setCheckAll] = useState<boolean>(false)
  const [checkList, setCheckList] = useState<any>([])
  const [checkStatusList, setCheckStatusList] = useState<any>([])

  // 动态设置下拉框的宽度
  const ele = document.getElementById('select-btn')
  const width = ele ? ele.clientWidth : 500

  useEffect(() => {
    if (checkAll) {
      setCheckList(dataList)
      setCheckStatusList([...dataList.map((item: boolean) => true)])
    }
  }, [dataList.length])

  /**
   * 进行搜索
   */
  const handleSearch = async (value: string) => {
    await setnewcaseList()
    await setPage(1)
    await setSearchValue(value)
    getList()
  }

  const handleSelect =  (item: any) => async () => {
    setSelectValue(item.name)
    await setSearchValue('')
    onSelect([item])
    setVisible(false)
    setIcon('caret-down')
  }

  const onhandleScroll = async (ele: any) => {
    const elescrollTop = ele.scrollTop

    if (elescrollTop >= ((20 - 8) * 36 * currentPage)) {
      await setPage()
      getList()
     }
  }

  const handleChangeSearchValue = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
  }

  /**
   * 全选操作
   */
  const handleCheckAll = (e: any) => {
    if (e.target.checked) {
      setCheckAll(true)
      setCheckStatusList([...dataList.map((item: boolean) => true)])
      setCheckList([...dataList])
    } else {
      setCheckAll(false)
      setCheckStatusList([...dataList.map((item: boolean) => false)])
      setCheckList([])
    }
  }

  const handleCheckItem = (item: any, index: number) => (e: any) =>{
    const checkIndex = checkList.findIndex((_item: any) => {
      return _item.id === item.id
    })

    if (e.target.checked) {
      checkList.push(item)
      checkStatusList[index] = true
      if (checkList.length === dataList.length) {
        setCheckAll(true)
      }
    } else {
      checkStatusList[index] = false
      setCheckAll(false)
      checkList.splice(checkIndex, 1)
    }

    setCheckList([...checkList])
    setCheckStatusList([...checkStatusList])
  }

  /**
   * 批量添加case
   */
  const handleBatchAdd = async () => {
    await onSelect(checkList)
    handleVisibleChange(false)
  }

  const handleVisibleChange = async (visible: boolean) => {
    // 关闭后清空搜索结果、搜索词条
    if (!visible) {
      await setSearchValue('')
      await setnewcaseList()
      await setPage(1)
      setCheckAll(false)
      setCheckList([])
      setCheckStatusList([])
      setIcon('caret-down')
      getList()
    }

    setVisible(visible)
  }

  const handleChangeIcon = () => {
    setIcon('caret-up')
  }

  const renderContent = () => {
    return (
      <div className={styles.searchContainer}>
        <div className="search-header">
          <Search
            placeholder='搜索'
            enterButton="搜索"
            onChange={handleChangeSearchValue}
            value={searchValue}
            onSearch={handleSearch}
          />
          <Button className="search-ok-btn" type="primary" onClick={handleBatchAdd}>确定</Button>
        </div>

        <Checkbox
          className="check-all"
          onChange={handleCheckAll}
          checked={checkAll}
        >
            全选
        </Checkbox>

        <ul
          style={{width: `${width - 32}px`}}
          className="search-ul"
          onScroll={e => onhandleScroll(e.target)}
        >
          {dataList.length ? dataList.map((item: any, index) => (
            <div className="search-li" key={item.id}>
              <Checkbox onChange={handleCheckItem(item, index)} checked={checkStatusList[index]}/>
              <li key={item.id} onClick={handleSelect(item)}>{item.name}</li>
            </div>
          )) : <div className={styles.noData}>暂无数据</div>}
        </ul>
       </div>
     )
  }

  return (
    <div className={styles.container}>
      <Popover
        content={renderContent()}
        trigger="click"
        style={{width: '300px'}}
        visible={visible}
        placement="bottom"
        onVisibleChange={handleVisibleChange}
      >
        <Button style={{width: '100%'}} onClick={handleChangeIcon} id='select-btn'>
          {selectValue || '请选择case'}
          {icon === 'caret-down' ? <CaretDownOutlined style={{textAlign: 'right'}}/> : <CaretUpOutlined style={{textAlign: 'right'}}/>}

          {/* <CaretDownOutlined /> */}

        </Button>

      </Popover>
    </div>
  )
}

export default SelectPaging




