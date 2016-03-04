(function() {
  var dataUrl = './sessions.json'

  function clone(node) {
    var elem = node.cloneNode(true)
    elem.id = 'node-' + Math.round(Math.random() * 10000).toString()
    return elem
  }

  function clear(node) {
    while(node.firstChild)
      node.removeChild(node.firstChild)
  }

  function NavbarCtrl(sessionStore) {
    var elem = document.getElementById('navbar')
    sessionStore.on('change', function() {
      var strDay = moment(sessionStore.currentDate()).format('YYYY-MM-DD')
      var list = elem.querySelectorAll('#navbar .nav li')
      for (var i = 0; i < list.length; i++) {
        list.item(i).className = ''
      }
      document.getElementById('nav-' + strDay).className = 'active'
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
      elem = clone(tpl)
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
      elem = clone(tpl)
      doRender()
      return elem
    }

    function doRender() {
      elem.querySelector('.track-title').textContent = params.title
      renderChildren()
    }

    function renderChildren() {
      var sessionListNode = elem.querySelector('.session-list')
      clear(sessionListNode)

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
    var tpl = document.querySelector('.session-tpl')
    var elem = null

    this.render = function() {

      var speakers = []
      params.speakers.forEach(function(speaker) {
        speakers.push(speaker.name)
      })
      
      elem = clone(tpl)
      elem.setAttribute('data-session-id', params.session_id)
      elem.querySelector('.session-title').textContent = params.title
      elem.querySelector('.session-location').textContent = params.location
      elem.querySelector('.session-speakers').textContent = speakers.join(', ')
      elem.querySelector('.session-start').textContent = params.start_time.format('h:mm a')
      elem.querySelector('.session-end').textContent = params.end_time.format('h:mm a')
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

    var sessionData = {}

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
      var strDay = moment(currentDate).format('YYYY-MM-DD')
      var obj = sessionData[strDay] || []
      var result = []
      Object.keys(obj).forEach(function(key) {
        result.push(obj[key])
      })
      return result
    }

    function getCurrentDate() {
      return currentDate
    }

    function registerListener(event, cb) {
      listeners[event] = listeners[event] || []
      listeners[event].push(cb)
    }

    function parseData(_data) {
      var m, strDay, trackName

      // data[yyyy-mm-dd][track][session]
      _data.sessions.forEach(function(session) {
        session.start_time = session.start_time ? moment(session.start_time) : undefined
        session.end_time = session.end_time ? moment(session.end_time) : undefined

        if (!session.start_time)
          return

        var strDay = session.start_time.format('YYYY-MM-DD')
        var trackName = session.track.name

        if (!sessionData[strDay]) 
          sessionData[strDay] = {}

        if (!sessionData[strDay][trackName]) 
          sessionData[strDay][trackName] = {title: trackName, sessions: []}

        sessionData[strDay][trackName].sessions.push(session)
      })
    }

    function onDataComplete(data) {
      parseData(data)
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

  function actionSelectDay() {
    var hash = window.location.hash.replace(/^#\//, '') || '2016-03-18'
    var date = moment(hash).toDate()
    store.selectDay(date)
  }

  // store and controllers
  var store = SessionStore({url: dataUrl})
  var sessionList = new SessionListCtrl(store)
  var navbarCtrl = new NavbarCtrl(store)

  document.getElementById('container').appendChild(sessionList.render())

  window.onhashchange = actionSelectDay
  store.on('data', actionSelectDay)

  store.fetch()
})()
