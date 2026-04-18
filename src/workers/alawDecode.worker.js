const alawDecodeTable = new Int16Array(256)

function buildAlawTable() {
  for (let i = 0; i < 256; i++) {
    const code = i ^ 0x55
    let exponent = (code & 0x70) >> 4
    let mantissa = code & 0x0f

    if (exponent > 0) {
      mantissa += 16
    }

    let sample = (mantissa << 4) + 8
    if (exponent > 1) {
      sample <<= (exponent - 1)
    }

    alawDecodeTable[i] = (code & 0x80) !== 0 ? sample : -sample
  }
}

buildAlawTable()

self.onmessage = function(e) {
  const { g711Bytes } = e.data
  const pcm = new Float32Array(g711Bytes.length)

  for (let i = 0; i < g711Bytes.length; i++) {
    pcm[i] = alawDecodeTable[g711Bytes[i]] / 32768
  }

  self.postMessage({ pcm }, [pcm.buffer])
}
