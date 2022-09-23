# Timers

### Messy Notes - Need to rework later

We have a new datatype called a timermap, which is simply a `tick number` integer plus a map/dictionary. The map has unit ids for the key, and the value is an integer of how many actions the actor is expected to perform (how many timers it had set for it) at that tick.

All timermaps are kept in the `timerList` which simply holds an ordered list of timermaps.

Every time a new tick takes place, it checks the length of the timerList and sees if it is at least maxTimerDuration (ex. 25, or whatever number we expect the longest timer to be). If not, it creates a bunch of empty timermaps and adds them to the timerList.

After checking timerList length, the next timermap in list is popped (and verified that the `tick number` in the timermap is equal to the current tick) and then all of the kv pairs in the map are iterated through. While iterating, the key is read to identify what actor (strucutre, unit, ...) needs to be updated, and the value is read to know how many actions are expected to be performed.

Each actor has its own `timers` field, which is a list of tuples which specify `(tickNumber, action)`. The `action` specifies what the unit should do (ie. `move`, `attack`, ...). When the unit needs to be updated as specified by the global `timerList`, the unit is run through a `process` function which reads all of the unit's `timers` and processes each one which is expected to run at the current tick. While processing each action, the actor can mutate its own state or other actors states, and as a result it is expected to:

- Emit events for each relevant mutation
- Delete old timers and create new timers for itself (making sure to add them both to the unit's `timers` field and the correct timermap in the global `timerList`)
- Call the `process` function for other actors it is affecting which deletes/sets new timers & emits events as well (ie. applying a speed debuff requires the target unit to run `process` with the `("speedDebuff", 5)` action), or (ie. apply damage `("damage", 2)`)
