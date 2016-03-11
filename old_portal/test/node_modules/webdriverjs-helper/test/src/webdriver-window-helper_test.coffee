webdriver = require 'selenium-webdriver'
builder = require './webdriver-builder'
require('chai').should()
require '../../lib/webdriverjs-helper'

describe 'webdriver window helper', ->

  driver = null
  currentWindow = null
  host = 'http://localhost:9001'

  before (done) -> 
    builder.getBrowser (browser) ->
        driver = browser.build()
        done()

  beforeEach -> 
    driver.get host
    currentWindow = driver.window()

  after -> driver.quit()

  describe '#position', ->

    it 'could set the position of current window', (done) ->
      currentWindow.position 500, 500
      currentWindow.getPosition().then (position) ->
        position.x.should.equal 500
        position.y.should.equal 500
        done()

    it 'could get the position of current window', (done) ->
      currentWindow.position 500, 500
      currentWindow.position (x, y) ->
        x.should.equal 500
        y.should.equal 500
        done()

  describe '#size', ->

    it 'could set the size of current window', (done) ->
      currentWindow.size 500, 400
      currentWindow.getSize().then (size) ->
        size.width.should.equal 500
        size.height.should.equal 400
        done()

    it 'could get the size of current window', (done) ->
      currentWindow.size 500, 400
      currentWindow.size (width, height) ->
        width.should.equal 500
        height.should.equal 400
        done()  

  describe '#maximize', ->

    if !process.env.TRAVIS
      it 'could maximize the window', (done) ->
        currentWindow.maximize()
        currentWindow.getSize().then (size) ->
          [maxWidth, maxHeight] = [size.width, size.height]
          currentWindow.size 100, 100
          currentWindow.position 200, 200
          currentWindow.maximize()
          currentWindow.size (width, height) ->
            width.should.equal maxWidth
            height.should.equal maxHeight
            done()

      