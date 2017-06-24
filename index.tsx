import * as React from 'react'
import {BaseRef} from 'ts-immutable-struct'

export function isEqual(x: any, y: any): boolean {
  // We only support (deep) comparison for arrays
  if (x instanceof Array && y instanceof Array && x.length == y.length) {
    for (let index = 0; index < x.length; index++) {
      if (!isEqual(x[index], y[index])) {
        return false
      }
    }
    return true
  }
  // Handles NaN !== NaN
  return x === y || (x !== x && y !== y)
    || (x instanceof BaseRef && y instanceof BaseRef && isEqual(x.deref(), y.deref()))
}

export class Component<Props, State = {}> extends React.Component<Props, State> {
  protected __prevProps: {[k: string]: any} = {}

  shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): boolean {
    for (let key in nextProps) {
      if (nextProps.hasOwnProperty(key)) {
        let nextValue = nextProps[key]
        let oldValue: any = this.__prevProps[key]
        if (!isEqual(oldValue, nextValue)) {
          return true
        }
      }
    }
    return false
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    let props: {[k: string]: any} = {}
    for (let key in this.props) {
      if (this.props.hasOwnProperty(key)) {
        let value = (this.props as any)[key]
        props[key] = value instanceof BaseRef ? value.deref() : value
      }
    }
    this.__prevProps = props
  }
}

// Helper for React's lack of support for redrawing when children props change.
// Pass all children props as _redraw=[prop1, prop2, ...] to containing component.
export interface ChildrenRedrawProps {
  _redraw?: any
}
