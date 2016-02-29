(function() {
  var dataUrl = 'https://raw.githubusercontent.com/fossasia/open-event/master/testapi/event/1/sessions'

  function NavbarCtrl(sessionStore) {
    var elem = document.getElementById('navbar')
    var dropdownDay = elem.querySelector('.dropdown-day')

    sessionStore.on('change', function() {
      var currentDate = sessionStore.currentDate()
      var year = currentDate.getFullYear(),
          month = currentDate.getMonth() + 1,
          day = currentDate.getDate();

      dropdownDay.textContent = year + '/' + month + '/' + day
    })
  }

  /**
   * [SessionListCtrl description]
   * @param {[type]} sessionStore [description]
   */
  function SessionListCtrl(sessionStore) {
    var self = this
    var tpl = document.getElementById('session-list-tpl')
    var elem = null

    this.state = sessionStore.trackList()

    sessionStore.on('change', function() {
      renderChildren()
    })

    this.render = function() {
      elem = tpl.cloneNode(true)
      return elem
    }

    function clear(trackList) {
      while(trackList.firstChild)
        trackList.removeChild(trackList.firstChild)
    }

    function renderChildren() {
      var trackListNode = elem.querySelector('.track-list')
      var trackList = sessionStore.trackList()
      var track = null

      clear(trackListNode)

      for (var i = 0; i < trackList.length; i++) {
        trackListNode.appendChild(
          new SessionListPerTrackCtrl(trackList[i]).render()
        )
      }
    }
  }

  /**
   * [SessionListPerTrackCtrl description]
   * @param {[type]} params [description]
   */
  function SessionListPerTrackCtrl(params) {
    var tpl = document.getElementById('session-list-per-track-tpl')
    var elem = null

    this.render = function() {
      elem = tpl.cloneNode(true)
      doRender()
      return elem
    }

    function doRender() {
      elem.querySelector('.track-title').textContent = params.title
      renderChildren()
    }

    function renderChildren() {
      var sessionListNode = elem.querySelector('.session-list')
      for(var i = 0; i < params.sessions.length; i++) {
        sessionListNode.appendChild(
          new SessionCtrl(params.sessions[i]).render()
        )
      }
    }
  }

  /**
   * [SessionCtrl description]
   */
  function SessionCtrl(params) {
    var tpl = document.getElementById('session-tpl')
    var elem = null

    this.render = function() {
      elem = tpl.cloneNode(true)
      elem.querySelector('.session-title').textContent = params.title
      return elem
    }
  }

  /**
   * [SessionStore description]
   * @param {[type]} options [description]
   */
  function SessionStore(options) {
    var listeners = []
    var currentDate = new Date(2016, 2, 18)

    var dummyData = [
      {
        track: 'OpenTech', 
        date: '2016-03-18', 
        speakers: ['Hong Phuc'], 
        start: '10:00 AM', 
        title: 'Grand Opening'
      },
      {
        track: 'OpenTech', 
        date: '2016-03-19', 
        speakers: ['Stephanie Taylor'], 
        start: '09:30 AM', 
        title: 'Google Summer of Code and Google Code-In'
      },
      {
        track: 'Web Tech', 
        date: '2016-03-19', 
        speakers: ['Dan Tran'], 
        start: '11:00 AM', 
        title: 'Chat Bots'
      },
    ]

    function notify(event, payload) {
      var handlers = listeners[event] || []
      for (var i = 0; i < handlers.length; i++) {
        handlers[i](payload)
      }
    }

    function fetchData() {
      // populate data
      $.ajax(options.url, {
        success: onDataComplete,
        error: onDataError,
        method: 'GET',
        dataType: 'json'
      })
    }

    function zeroFill(num) {
      if (num < 10) return '0' + num.toString()
      else return num.toString()
    }

    function selectDay(date) {
      currentDate = date
      notify('change', currentDate)
    }

    function getTrackList() {
      var year = currentDate.getFullYear(),
          month = currentDate.getMonth() + 1,
          day = currentDate.getDate();

      var currentDay = year.toString() + '-' + zeroFill(month) + '-' + zeroFill(day) 

      var filtered = []
      var result = []
      var tracks = {}
      var session, keys

      for(var i = 0; i < dummyData.length; i++) {
        if (dummyData[i].date === currentDay) 
          filtered.push(dummyData[i])
      }

      for(var j = 0; j < filtered.length; j++) {
        session = filtered[j]
        if (!tracks[session.track]) {
          tracks[session.track] = {title: session.track, sessions: []}
        }
        tracks[session.track].sessions.push(session)
      }

      keys = Object.keys(tracks)
      for (var k = 0; k < keys.length; k++) {
        result.push(tracks[keys[k]])
      }

      return result
    }

    function getCurrentDate() {
      return currentDate
    }

    function registerListener(event, cb) {
      listeners[event] = listeners[event] || []
      listeners[event].push(cb)
    }

    function onDataComplete(data) {
      notify('data', data)
    }

    function onDataError(xhr, textStatus, errorText) {
      notify('error', errorText)
    }

    return {
      fetch: fetchData,
      selectDay: selectDay,
      currentDate: getCurrentDate,
      trackList: getTrackList,
      on: registerListener
    }
  }

  var store = SessionStore({url: dataUrl})
  var sessionList = new SessionListCtrl(store)
  var navbarCtrl = new NavbarCtrl(store)

  function parseDate(hash) {
    if (!hash.match(/\d{4}-\d{2}-\d{2}/)) {
      throw Error('Invalid date: ' + hash)
      return
    }

    var parts = hash.split('-')
    var year = parseInt(parts[0]),
        month = parseInt(parts[1] - 1),
        day = parseInt(parts[2])

    return new Date(year, month, day)
  }

  function actionSelectDay() {
    var hash = window.location.hash
    var date = parseDate(hash.replace(/^#\//, ''))
    store.selectDay(date)
  }

  document.getElementById('container').appendChild(sessionList.render())

  window.onhashchange = actionSelectDay
  actionSelectDay()

})()
