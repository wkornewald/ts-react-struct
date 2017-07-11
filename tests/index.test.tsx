import {mount} from 'enzyme'
import * as React from 'react'
import {ChangeEvent} from 'react'
import * as ReactDom from 'react-dom'
import {Struct, LeafRef} from 'ts-immutable-struct'
import {Component} from '..'

interface Props extends React.HTMLProps<HTMLInputElement> {
  valueRef: LeafRef<string>,
}

class Input extends Component<Props> {
  onChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.valueRef.val(event.target.value, event)
  }

  render() {
    let props: Props = Object.assign({}, this.props)
    delete props.valueRef
    return <input {...props} value={this.props.valueRef.deref()} onChange={this.onChange} />
  }
}

test('Component rendering', () => {
  let data = Struct({
    value: 'ahoy',
  })

  const component = mount(
    <Input title="Title" valueRef={data.get('value')} />
  )

  let wasUser = false
  data.observe((event, oldVal, newVal) => {
    wasUser = event !== undefined
    component.update()
  })

  expect(component.html()).toEqual('<input title="Title" value="ahoy">')

  // Simulate user input
  let elem = component.find('input').getDOMNode() as HTMLInputElement
  elem.value = 'hey'
  component.find('input').simulate('change', {target: elem, currentTarget: elem})
  expect(wasUser).toEqual(true)
  expect(data.get('value').deref()).toEqual('hey')
  expect(component.html()).toEqual('<input title="Title" value="hey">')

  // Simulate programmatic value change
  data.get('value').val('hola')
  expect(wasUser).toEqual(false)
  expect(component.html()).toEqual('<input title="Title" value="hola">')
})
