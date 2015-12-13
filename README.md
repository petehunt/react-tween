# react-tween

![unmaintained](http://img.shields.io/badge/status-unmaintained-red.png)

## intro

I don't know anything about animation and I haven't looked at prior art so none of this is novel most likely.

## definitions

First some made up definitions:

  * **tween:** `f(t)`
  * **live tween:** stateful object that contains `f(t)` as well as the start time.
  * **animation:** a bunch of live tweens applied to a set of CSS properties

## the three modes

  * If all tweens in the animation are of a very simple form (cubic-bezier) they can be compiled into a small number of CSS keyframes and run off thread
  * If a tween contains at least one piece of "custom logic" (i.e. a JS expr that cannot be expressed as a cubic-bezier) they can be compiled into a large number of CSS keyframes (1 per frame) and run off thread. More work to do, but still off-thread!
  * If a live tween is read by JS at any time it may be used to make rendering decisions, so flip to "software rendering" (reconcile every requestAnimationFrame)
