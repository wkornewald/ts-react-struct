# ts-react-struct

[![npm version](https://badge.fury.io/js/ts-react-struct.svg)](https://badge.fury.io/js/ts-react-struct)
[![NPM downloads](https://img.shields.io/npm/dm/ts-react-struct.svg?style=flat)](https://npmjs.org/package/ts-react-struct)
[![Build Status](https://travis-ci.org/wkornewald/ts-react-struct.svg?branch=master)](https://travis-ci.org/wkornewald/ts-react-struct)

`ts-react-struct` is a TypeScript package for using `React` and `immutable.js` with type-safe cursors and a central event system.
The emphasis here is on type-safety.

You'll usually want to combine this with [ts-immutable-struct](https://github.com/wkornewald/ts-immutable-struct).

## Getting started

Install the package:
```sh
npm install --save ts-immutable-struct ts-react-struct
```

Example usage:
```typescript
import * as React from 'react'
import {ChangeEvent} from 'react'
import * as ReactDom from 'react-dom'
import {Struct, LeafRef, ChangeReason} from 'ts-immutable-struct'
import {Component} from 'ts-immutable-struct'

interface Props extends React.HTMLProps<HTMLInputElement> {
  valueRef: LeafRef<string>,
}

class Input extends Component<Props> {
  onChange(event: ChangeEvent<HTMLInputElement>) {
    this.props.valueRef.val(event.target.value, new ChangeReason(event.nativeEvent))
  }

  render() {
    let props: Props = Object.assign({}, this.props)
    delete props.valueRef
    return <input {...props} value={this.props.valueRef.deref()} onChange={this.bindMethod('onChange')} />
  }
}

let data = Struct({
  value: 'ahoy',
})

function render() {
  return ReactDom.render(<Input valueRef={data.get('value')} />, document.getElementById('content'))
}
render()

data.observe((oldVal, newVal, event) => {
  render()
})
```

Now, the state is always in sync with the DOM:
```typescript
data.get('value').deref()
// => "ahoy"

data.get('value').val('hola', new ChangeReason())
// => Input gets rerendered as <input value="hola" />

// <= user types "hey" into input field
data.get('value').deref() // => "hey"
```
