// @ts-check

import { expect, describe, test } from 'vitest'
import search from '../index.js'

const doc1 = { id: 'doc1', text: 'I can\'t shoot straight unless I\'ve had a Pint! at' }
const doc2 = { id: 'doc2', text: 'Don\'t shoot shoot shoot that thing at me.' }
const doc3 = { id: 'doc3', text: 'I\'m your shooter.' }
const doc4 = { id: 'doc4', text: ' shoot shoot shoot' }
const docs = [doc1, doc2, doc3, doc4]

describe('search', () => {
  test('empty docs', () => {
    expect(search([], 'shoot')).toEqual([])
  })

  test('empty term', () => {
    expect(search(docs, '')).toEqual([])
  })

  test('clean words', () => {
    expect(search(docs, 'pint')).toEqual(['doc1'])
    expect(search(docs, 'pint!')).toEqual(['doc1'])
  })

  test('relevance', () => {
    expect(search(docs, 'shoot')).toEqual(['doc2', 'doc4', 'doc1'])
  })

  test('phrase', () => {
    expect(search(docs, 'shoot at me')).toEqual(['doc2', 'doc1', 'doc4'])
  })
})
