
import React from 'react'
import MonacoEditor from 'react-monaco-editor'

import { suggestionList } from '@/utils/constans'

type Props = {
  height?: number;
  id: string;
  initeDate: any;
  readOnly: boolean;
  onJsonChange?: (json: any) => void;
};

type State = {
  tipList: string[];
  calculateValue: string;
  language: string
}

class JsonEditor extends React.PureComponent<Props, State> {
  defaultProps = {
    readOnly: false
  }
  timeouter: any
  monacoEditorRef: any = React.createRef()
  constructor(props: Props) {
    super(props)
    this.state = {
      tipList: ['.', 'F', 'V'], // 储存计算框提示语的首字母
      calculateValue: '',
      language: "json"
    }
  }

  componentDidMount() {
    const { initeDate } = this.props
    this.setState({calculateValue: initeDate}, () => this.formatData())

    window.onunload = () => {
      sessionStorage.setItem('isLoadDEditor', "false");
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const editor = this.monacoEditorRef.current.editor
      const { initeDate } = nextProps
      const { calculateValue } = this.state
      // 编辑框的值
      if (calculateValue !== initeDate) {
        this.setState({
          language: "json",
          calculateValue: nextProps.initeDate
        }, () =>  editor ? editor.getAction('editor.action.formatDocument').run() : null)
      }
  }

  componentWillUnMount() {
    clearTimeout(this.timeouter)
    this.monacoEditorRef.current.editor.dispose()
  }

  formatData = () => {
    const editor = this.monacoEditorRef.current.editor
    this.timeouter = setTimeout(() => {
      if (editor && editor.getAction('editor.action.formatDocument')) {
        editor.getAction('editor.action.formatDocument').run()
      }
    }, 300)
  }

  onBlur = () => {
    const { onJsonChange } = this.props
    const { calculateValue } = this.state
    onJsonChange  ? onJsonChange(calculateValue) : null
  }

  onChangeHandle = (value: string) => {
    this.setState({
      calculateValue: value,
      language: 'python'
    })
  }

  editorDidMountHandle = (editor: any, monaco: any) => {
    const { tipList } = this.state

    if (sessionStorage.getItem('isLoadDEditor') === 'true') {
      return
    }

    sessionStorage.setItem('isLoadDEditor', "true");

    monaco.languages.registerCompletionItemProvider('python', {

    provideCompletionItems(model: any, position: any) {

      // 获取当前行数
      const line = position.lineNumber

      // 获取当前列数
      const column = position.column

      // 获取当前输入行的所有内容
      const content = model.getLineContent(line)
      const sym = content[column - 2]
      // 通过下标来获取当前光标后一个内容，即为刚输入的内容
      if (sym === 'F') {
        return {
          suggestions: [{
            label: 'FUNCTION',
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: 'FUNCTION',
            detail: ''
          }]
          }
        }

      if (sym === 'V') {
        return {
          suggestions: [{
            label: 'VARIABLE',
            kind: monaco.languages.CompletionItemKind.Text,
            insertText: 'VARIABLE',
            detail: ''
          }]
          }
        }

        return {
          suggestions: suggestionList.map((item: any) => ({ label: item, insertText: item, detail: "", kind: monaco.languages.CompletionItemKind['Function'] }))
          }
        },
      triggerCharacters: tipList
    })
  }

  options = {
    selectOnLineNumbers: true,
    renderSideBySide: false,
    readOnly: this.props.readOnly,
    minimap: {
      enabled: false
    }
  }

  render() {
    const { height } = this.props
    const { language, calculateValue } = this.state
    return (
      <div onBlur={this.onBlur}>
        <MonacoEditor
          ref={this.monacoEditorRef}
          height={height ? `${height}` : `300`}
          language={language}
          value={calculateValue}
          options={this.options}
          onChange={this.onChangeHandle}
          editorDidMount={this.editorDidMountHandle}
        />
      </div>
    )
  }
}

export default JsonEditor
