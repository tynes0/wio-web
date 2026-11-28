import { test } from 'node:test'
import assert from 'node:assert/strict'
import { shouldCloseNavigationOnLeave } from '../src/navigation.js'

const gap = { nodeType: 1 }
const panel = { nodeType: 1 }
const link = { nodeType: 1 }
const outside = { nodeType: 1 }
const boundary = { contains: (node) => [gap, panel, link].includes(node) }
test('Header padding is a safe pointer bridge into the dropdown', () => {
  assert.equal(shouldCloseNavigationOnLeave(boundary, gap), false)
})
test('Panel links and preview remain inside the navigation boundary', () => {
  assert.equal(shouldCloseNavigationOnLeave(boundary, panel), false)
  assert.equal(shouldCloseNavigationOnLeave(boundary, link), false)
})
test('Entering page content closes the menu', () => {
  assert.equal(shouldCloseNavigationOnLeave(boundary, outside), true)
})
test('Leaving the browser does not prematurely discard the dropdown', () => {
  assert.equal(shouldCloseNavigationOnLeave(boundary, null), false)
  assert.equal(shouldCloseNavigationOnLeave(boundary, {}), false)
})
