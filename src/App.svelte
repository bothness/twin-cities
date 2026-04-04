<script>
  import { onMount } from "svelte";
  import { tsvParse } from "d3-dsv";
  import ForceGraph from "./lib/ForceGraph.svelte";
  import Select from "./lib/Select.svelte";
  import Intro from "./lib/Intro.svelte";

  const nodes_path = "./data/nodes.tsv";
  const links_path = "./data/links.tsv";

  let selected = []
  let mode = "network";

  let data;

  onMount(async () => {
    const nl = await Promise.all([
      (await fetch(nodes_path)).text(),
      (await fetch(links_path)).text(),
    ]);
    const nodeList = tsvParse(nl[0], (d) => {
      return { ...d, lng: +d.lng, lat: +d.lat, twins: [] };
    }).sort((a, b) => a.name.localeCompare(b.name));
    const nodes = {};
    for (const n of nodeList) nodes[n.id] = n;
    const links = tsvParse(nl[1]).map((l, i) => ({ ...l, id: i }));
    for (const l of links) {
      nodes[l.source].twins.push(l.target);
      nodes[l.target].twins.push(l.source);
    }
    data = { nodeList, nodes, links };
  });
</script>

<main>
  {#if data}
    <ForceGraph links={data.links} nodes={data.nodes} {mode} bind:selected />
  {/if}
  <!-- <Intro {selected}/> -->
  <div id="select-box">
    {#if data}
      <Select
        options={data.nodeList}
        on:change={(e) => {
          if (e?.detail?.id) selected = [...selected, e.detail.id];
        }}
      />
      <button
        on:click={() =>
          (selected = [
            ...selected,
            data.nodeList[Math.floor(Math.random() * data.nodeList.length)].id,
          ])}>Random City</button
      >
      <button on:click={() => (selected = [])}>Reset</button>
    {/if}
  </div>
  <nav id="mode-box">
    <label>
      <select bind:value={mode}>
        <option value="network">View as network</option>
        <option value="map">View as map</option>
      </select>
    </label>
  </nav>
</main>

<style>
  :global(body) {
    padding: 0;
    margin: 0;
  }
  main {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  #select-box {
    position: absolute;
    top: 10px;
    left: 10px;
  }
  #mode-box {
    position: absolute;
    bottom: 10px;
    left: 10px;
  }
</style>
