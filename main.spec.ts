import {prepareData} from './main'
import {Entity} from './examples/types'
import input from './examples/input.json'
import output from './examples/output.json'

test('basic prepareData test', () => {
  expect(prepareData(input, {sprintId: 977})).toEqual(output)
})