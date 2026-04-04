<script>
  let { selected = [] } = $props();

  async function bufferUpdate(bool, ms = 750) {
    if (bool) return bool;
    await new Promise((resolve) => setTimeout(resolve, ms))
    return bool;
  }

  let hidden = $derived(await bufferUpdate(selected.length > 0));
</script>

<div class="intro" style:opacity={selected.length ? 0 : 1} style:visibility={hidden ? 'hidden' : 'visible'}>
  <div>
    <h1>Explore twin cities</h1>
    <p>
      This is an experimental data visualisation based on twin cities data
      extracted from <a href="https://www.wikidata.org" target="_blank"
        >Wikidata</a
      >.
    </p>
    <p>
      Select a city or click "random city" to begin, then click on connected
      cities to expand your network. You can also change the view from a network
      to a geographic map.
    </p>
    <p>
      This tool was designed and coded by <a
        href="https://bsky.app/profile/bothness.bsky.social"
        target="_blank">Ahmad Barclay</a
      >. If you're feeling a bit nerdy, you can download the data for this
      visualisation in the form of nodes (cities) and edges (the connections
      between them). You can also get the source code on Github.
    </p>
  </div>
</div>

<style>
  .intro {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    transition: opacity 0.75s;
  }
  .intro > div {
    max-width: 600px;
  }
</style>
