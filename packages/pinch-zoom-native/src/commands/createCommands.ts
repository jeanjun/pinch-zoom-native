import * as commands from '.'

import type { PinchZoomShared } from '../shared'

export type Commands = {
  [Key in keyof typeof commands]: ReturnType<typeof commands[Key]>
}

export const createCommands = (shared: PinchZoomShared) => (
  Object.entries(commands).reduce((commandSet, [commandKey, commandFn]) => {
    if (typeof commandFn === 'function') 
      (commandSet as any)[commandKey] = commandFn(shared)

    return commandSet
  }, {})
)