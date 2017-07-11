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

export class UpdateTracker<Props, State = {}> {
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

  componentDidUpdate(nextProps: Props, nextState: State, prevProps: Props, prevState: State) {
    let props: {[k: string]: any} = {}
    for (let key in nextProps) {
      if (nextProps.hasOwnProperty(key)) {
        let value = nextProps[key]
        props[key] = value instanceof BaseRef ? value.deref() : value
      }
    }
    this.__prevProps = props
  }
}

export class Component<Props, State = {}> extends React.Component<Props, State> {
  protected __updateTracker = new UpdateTracker()

  shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): boolean {
    return this.__updateTracker.shouldComponentUpdate(nextProps, nextState, nextContext)
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    return this.__updateTracker.componentDidUpdate(this.props, this.state, prevProps, prevState)
  }
}

// Helper for React's lack of support for redrawing when children props change.
// Pass all children props as _redraw=[prop1, prop2, ...] to containing component.
export interface ChildrenRedrawProps {
  _redraw?: any
}
