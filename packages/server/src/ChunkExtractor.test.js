import path from 'path'
import stats from '../__fixtures__/stats.json'
import ChunkExtractor from './ChunkExtractor'

describe('ChunkExtrator', () => {
  let extractor

  beforeEach(() => {
    extractor = new ChunkExtractor({
      stats,
      outputPath: path.resolve(__dirname, '../__fixtures__'),
    })
  })

  describe('#stats', () => {
    it('should load stats from file', () => {
      extractor = new ChunkExtractor({
        statsFile: path.resolve(__dirname, '../__fixtures__/stats.json'),
      })

      expect(extractor.stats).toBe(stats)
    })

    it('should load stats from stats', () => {
      expect(extractor.stats).toBe(stats)
    })
  })

  describe('#addChunk', () => {
    it('should reference chunk', () => {
      extractor.addChunk('foo')
      expect(extractor.chunks).toEqual(['foo'])
    })

    it('should be uniq', () => {
      extractor.addChunk('a')
      extractor.addChunk('b')
      extractor.addChunk('b')
      expect(extractor.chunks).toEqual(['a', 'b'])
    })
  })

  describe('#getScriptTags', () => {
    it('should return main script tag without chunk', () => {
      expect(extractor.getScriptTags()).toMatchInlineSnapshot(`
"<script>window.__LOADABLE_REQUIRED_CHUNKS__ = [];</script>
<script async data-chunk=\\"main\\" src=\\"/dist/node/main.js\\"></script>"
`)
    })

    it('should return other chunks if referenced', () => {
      extractor.addChunk('letters-A')
      expect(extractor.getScriptTags()).toMatchInlineSnapshot(`
"<script>window.__LOADABLE_REQUIRED_CHUNKS__ = [\\"letters-A\\"];</script>
<script async data-chunk=\\"letters-A\\" src=\\"/dist/node/letters-A.js\\"></script>
<script async data-chunk=\\"main\\" src=\\"/dist/node/main.js\\"></script>"
`)
    })
  })

  describe('#getScriptElements', () => {
    it('should return main script tag without chunk', () => {
      expect(extractor.getScriptElements()).toMatchInlineSnapshot(`
Array [
  <script
    dangerouslySetInnerHTML={
      Object {
        "__html": "window.__LOADABLE_REQUIRED_CHUNKS__ = [];",
      }
    }
  />,
  <script
    async={true}
    data-chunk="main"
    src="/dist/node/main.js"
  />,
]
`)
    })

    it('should return other chunks if referenced', () => {
      extractor.addChunk('letters-A')
      expect(extractor.getScriptElements()).toMatchInlineSnapshot(`
Array [
  <script
    dangerouslySetInnerHTML={
      Object {
        "__html": "window.__LOADABLE_REQUIRED_CHUNKS__ = [\\"letters-A\\"];",
      }
    }
  />,
  <script
    async={true}
    data-chunk="letters-A"
    src="/dist/node/letters-A.js"
  />,
  <script
    async={true}
    data-chunk="main"
    src="/dist/node/main.js"
  />,
]
`)
    })
  })

  describe('#getStyleTags', () => {
    it('should return main style tag without chunk', () => {
      expect(extractor.getStyleTags()).toMatchInlineSnapshot(
        `"<link data-chunk=\\"main\\" rel=\\"stylesheet\\" href=\\"/dist/node/main.css\\">"`,
      )
    })

    it('should return other chunks if referenced', () => {
      extractor.addChunk('letters-A')
      expect(extractor.getStyleTags()).toMatchInlineSnapshot(`
"<link data-chunk=\\"letters-A\\" rel=\\"stylesheet\\" href=\\"/dist/node/letters-A.css\\">
<link data-chunk=\\"main\\" rel=\\"stylesheet\\" href=\\"/dist/node/main.css\\">"
`)
    })

  })

  describe('#getInlineStyleTags', () => {
    it('should return inline style tags as a promise', () => {
      extractor.addChunk('letters-A')
      expect.assertions(1)
      return extractor.getInlineStyleTags().then(data => expect(data).toMatchInlineSnapshot(`
"<style data-chunk=\\"letters-A\\">
        body {
  background: pink;
}

        </style>
        
<style data-chunk=\\"main\\">
        h1 {
  color: cyan;
}
        </style>
        "
`),
      )
    })

  })

  describe('#getStyleElements', () => {
    it('should return main style tag without chunk', () => {
      expect(extractor.getStyleElements()).toMatchInlineSnapshot(`
Array [
  <link
    data-chunk="main"
    href="/dist/node/main.css"
    rel="stylesheet"
  />,
]
`)
    })

    it('should return other chunks if referenced', () => {
      extractor.addChunk('letters-A')
      expect(extractor.getStyleElements()).toMatchInlineSnapshot(`
Array [
  <link
    data-chunk="letters-A"
    href="/dist/node/letters-A.css"
    rel="stylesheet"
  />,
  <link
    data-chunk="main"
    href="/dist/node/main.css"
    rel="stylesheet"
  />,
]
`)
    })

  })

  describe('#getInlineStyleElements', () => {
    it('should return inline style elements as a promise', () => {
      extractor.addChunk('letters-A')
      expect.assertions(1)
      return extractor.getInlineStyleElements().then(data => expect(data).toMatchInlineSnapshot(`
Array [
  <style
    dangerouslySetInnerHTML={
      Object {
        "__html": "body {
  background: pink;
}
",
      }
    }
    data-chunk="letters-A"
  />,
  <style
    dangerouslySetInnerHTML={
      Object {
        "__html": "h1 {
  color: cyan;
}",
      }
    }
    data-chunk="main"
  />,
]
`),
      )
    })

  })

  describe('#getCssString', () => {
    it('should return a string of the referenced css files as a promise', () => {
      extractor.addChunk('letters-A')
      expect.assertions(1)
      return extractor.getCssString().then(data => expect(data).toMatchInlineSnapshot(`
"body {
  background: pink;
}

h1 {
  color: cyan;
}"
`),
      )
    })
    
  })

  describe('#getLinkTags', () => {
    it('should return main script tag without chunk', () => {
      expect(extractor.getLinkTags()).toMatchInlineSnapshot(`
"<link data-chunk=\\"main\\" rel=\\"preload\\" as=\\"style\\" href=\\"/dist/node/main.css\\">
<link data-chunk=\\"main\\" rel=\\"preload\\" as=\\"script\\" href=\\"/dist/node/main.js\\">
<link data-parent-chunk=\\"main\\" rel=\\"preload\\" as=\\"script\\" href=\\"/dist/node/letters-C.js\\">
<link data-parent-chunk=\\"main\\" rel=\\"prefetch\\" as=\\"script\\" href=\\"/dist/node/letters-D.js\\">"
`)
    })

    it('should return other chunks if referenced', () => {
      extractor.addChunk('letters-A')
      expect(extractor.getLinkTags()).toMatchInlineSnapshot(`
"<link data-chunk=\\"letters-A\\" rel=\\"preload\\" as=\\"style\\" href=\\"/dist/node/letters-A.css\\">
<link data-chunk=\\"letters-A\\" rel=\\"preload\\" as=\\"script\\" href=\\"/dist/node/letters-A.js\\">
<link data-chunk=\\"main\\" rel=\\"preload\\" as=\\"style\\" href=\\"/dist/node/main.css\\">
<link data-chunk=\\"main\\" rel=\\"preload\\" as=\\"script\\" href=\\"/dist/node/main.js\\">
<link data-parent-chunk=\\"main\\" rel=\\"preload\\" as=\\"script\\" href=\\"/dist/node/letters-C.js\\">
<link data-parent-chunk=\\"main\\" rel=\\"prefetch\\" as=\\"script\\" href=\\"/dist/node/letters-D.js\\">"
`)
    })
  })

  describe('#getLinkElements', () => {
    it('should return main script tag without chunk', () => {
      expect(extractor.getLinkElements()).toMatchInlineSnapshot(`
Array [
  <link
    as="style"
    data-chunk="main"
    href="/dist/node/main.css"
    rel="preload"
  />,
  <link
    as="script"
    data-chunk="main"
    href="/dist/node/main.js"
    rel="preload"
  />,
  <link
    as="script"
    data-parent-chunk="main"
    href="/dist/node/letters-C.js"
    rel="preload"
  />,
  <link
    as="script"
    data-parent-chunk="main"
    href="/dist/node/letters-D.js"
    rel="prefetch"
  />,
]
`)
    })

    it('should return other chunks if referenced', () => {
      extractor.addChunk('letters-A')
      expect(extractor.getLinkElements()).toMatchInlineSnapshot(`
Array [
  <link
    as="style"
    data-chunk="letters-A"
    href="/dist/node/letters-A.css"
    rel="preload"
  />,
  <link
    as="script"
    data-chunk="letters-A"
    href="/dist/node/letters-A.js"
    rel="preload"
  />,
  <link
    as="style"
    data-chunk="main"
    href="/dist/node/main.css"
    rel="preload"
  />,
  <link
    as="script"
    data-chunk="main"
    href="/dist/node/main.js"
    rel="preload"
  />,
  <link
    as="script"
    data-parent-chunk="main"
    href="/dist/node/letters-C.js"
    rel="preload"
  />,
  <link
    as="script"
    data-parent-chunk="main"
    href="/dist/node/letters-D.js"
    rel="prefetch"
  />,
]
`)
    })
  })

  describe('#requireEntryPoint', () => {
    it('should load the first entrypoint', () => {
      const x = extractor.requireEntrypoint()
      expect(x).toBe('hello')
    })
  })
})
