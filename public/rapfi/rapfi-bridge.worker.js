/* Rapfi WASM bridge worker — gomocalc.com fallback build */
var EngineInstance = null
var pendingResolve = null
var engineReady = false

function locateFile(url, engineDirURL) {
  if (/^rapfi.*\.data$/.test(url)) url = 'rapfi.data'
  return engineDirURL + url
}

function onStdout(output) {
  if (pendingResolve && output.indexOf(' ') === -1) {
    if (output === 'OK') return
    var parts = output.split(',')
    if (parts.length === 2) {
      var x = +parts[0]
      var y = +parts[1]
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        var resolve = pendingResolve
        pendingResolve = null
        resolve({ x: x, y: y })
        return
      }
    }
  }
  self.postMessage({ type: 'stdout', data: output })
}

self.onmessage = function (e) {
  var type = e.data.type
  var data = e.data.data

  if (type === 'command') {
    if (EngineInstance) EngineInstance.sendCommand(data)
    return
  }

  if (type === 'think') {
    if (!EngineInstance || !engineReady) {
      self.postMessage({ type: 'error', data: 'engine not ready' })
      return
    }
    pendingResolve = function (move) {
      self.postMessage({ type: 'move', data: move })
    }
    var cmds = data.commands
    for (var i = 0; i < cmds.length; i++) {
      EngineInstance.sendCommand(cmds[i])
    }
    return
  }

  if (type === 'init') {
    var engineURL = data.engineURL
    var engineDirURL = engineURL.substring(0, engineURL.lastIndexOf('/') + 1)
    self.importScripts(engineURL)

    self.Rapfi({
      locateFile: function (url) {
        return locateFile(url, engineDirURL)
      },
      onReceiveStdout: function (o) {
        onStdout(o)
      },
      onReceiveStderr: function (o) {
        self.postMessage({ type: 'stderr', data: o })
      },
      onExit: function (c) {
        self.postMessage({ type: 'exit', data: c })
      },
      setStatus: function (s) {
        if (s === 'Running...' || s === '') {
          if (!engineReady) {
            engineReady = true
            self.postMessage({ type: 'ready' })
          }
        }
        var match = s.match(/\((\d+)\/(\d+)\)/)
        if (match) {
          var loaded = parseInt(match[1], 10)
          var total = parseInt(match[2], 10)
          self.postMessage({
            type: 'loading',
            data: { progress: loaded / total, loadedBytes: loaded, totalBytes: total },
          })
          if (loaded === total && !engineReady) {
            engineReady = true
            self.postMessage({ type: 'ready' })
          }
        }
      },
      wasmMemory: data.memoryArgs ? new WebAssembly.Memory(data.memoryArgs) : undefined,
    }).then(function (instance) {
      EngineInstance = instance
    })
  }
}
