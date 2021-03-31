
/**
 * 渲染 -请求头- 模块
 */
import React, {useState} from 'react'
import { Button, AutoComplete, Cascader } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

import styles from '../detail/index.less';

type Props = {
  currentCaseDate: any
  envNameList: any[]
  handleHeaderChange: (tag: string, index: number, value: string) => void
  changeRequestHeader: (operate: string, index?: number) => () => void
  handleHeaderBlur: (index: number, tag: string) => (value: any) => void
}

const RenderHeaderTable = (props: Props) => {
  const { currentCaseDate, changeRequestHeader, handleHeaderChange, handleHeaderBlur, envNameList: envList } = props
  const { request_header_key, request_header_value } = currentCaseDate;

  const cascaderData = envList.length && envList.map(item => {
    const obj = {
      value: '',
      label: '',
      children: []
    }

    obj.value = item.env_name
    obj.label = item.env_name
    obj.children = item.secret_list ? item.secret_list.map(item => {
      return {
        value: item.secret_name,
        label: item.secret_name
      }
    }) : []

    return obj
  })

  const handleChange = (tag, index) => (value) => {
    const tagValue = value
    handleHeaderChange(tag, index, tagValue)
  }

  const displayRender = label => label.join('#')

  const onCascaderChange = (index: number) => (value: string[]) => {
    const _value = value.join('#')

    handleHeaderChange('header_key', index, `Siber#${_value}`)
  }

  const renderCascader = (index: number) => {
    return (
      <Cascader
        options={cascaderData}
        onChange={onCascaderChange(index)}
        displayRender={displayRender}
        placeholder="请选择"
        style={{width: '170%'}}
      />
    )
  }

  const renderKeyInput = (key: string, index: number, tag: string) => {
    const dataSource = tag === 'header_key' ? [{value: 'Siber'}] : [{value: 'SiberAuth'}]

    return (
      <div style={{width: '100%', display: 'flex'}}>
        <AutoComplete
          value={key}
          options={dataSource}
          style={{ width: '100%', height: '32px' }}
          onChange={handleChange(tag, index)}
          onBlur={handleHeaderBlur(index, tag)}
        />
        {key === 'Siber' && tag === 'header_key' ?  renderCascader(index) : null}
      </div>
    )
  }

  return (
      <dl className={styles.caseDl}>
        <div className={`${styles.caseDt}`}>
          <dt>key</dt>
          <dt>value</dt>
        </div>
        {request_header_key.map((item: string, index: number) => (
          <div className={styles.caseDd} key={`header-${index}`}>
          <dd>
            {renderKeyInput(item, index, 'header_key')}
          </dd>

          <dd>
            {renderKeyInput(request_header_value[index], index, 'header_value')}
          </dd>
          <MinusCircleOutlined className={styles.iconButton} onClick={changeRequestHeader('delete', index)} />
         </div>
        ))}
        <div style={{ width: '100%', display: 'flex' }}>
          <Button type="dashed" style={{width: '70%', margin: '0 auto'}} onClick={changeRequestHeader('add')}>
            <PlusOutlined /> 添加一项
          </Button>
        </div>
      </dl>
  )
}

export default RenderHeaderTable
