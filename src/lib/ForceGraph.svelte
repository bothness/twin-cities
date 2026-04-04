<script>
  import { onMount } from "svelte";
  import { zoom } from "d3-zoom";
  import { select } from "d3-selection";
  import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceX,
    forceY,
  } from "d3-force";
  import { schemePaired } from "d3-scale-chromatic";
  import { scaleOrdinal } from "d3-scale";
  import { geoPath } from "d3-geo";
  import { geoCylindricalEqualArea } from "d3-geo-projection";
  import { feature } from "topojson-client";
  import cleanCoords from "@turf/clean-coords";
  import Line from "./Line.svelte";
  import Circle from "./Circle.svelte";
  import Text from "./Text.svelte";

  export let nodes;
  export let links;
  export let selected;
  export let mode = "network";

  let width = 400;
  let height = 400;
  let mounted = false;
  let svg, doZoom, transform, simulation;

  let _selected = [];
  let _nodes, _links, _ids, _geojson;

  const _zoom = zoom().on("zoom", (e) => (transform = e.transform));
  const _domain = Array.from(
    new Set(Object.values(nodes).map((n) => n.continent)),
  ).sort((a, b) => a.localeCompare(b));
  const _range = Object.keys(_domain).map((k) => +k * 2);
  const _scale = scaleOrdinal(_domain, _range);

  $: _proj = geoCylindricalEqualArea().fitExtent(
    [
      [-width / 2, -height / 2],
      [width / 2, height / 2],
    ],
    {
      type: "LineString",
      coordinates: [
        [-180, -90],
        [180, 90],
      ],
    },
  );
  $: _path = geoPath().projection(_proj);

  async function getGeoJSON() {
    const json = await (await fetch("./data/boundaries.json")).json();
    const geo = feature(json, "ne_110m_admin_0_countries");
    geo.features = geo.features.map((f) => cleanCoords(f));
    _geojson = geo;
  }

  function doSelect(id) {
    selected = selected.includes(id)
      ? selected.filter((s) => s !== id)
      : [...selected, id];
  }

  function init() {
    _links = links
      .filter((l) => selected.includes(l.source) || selected.includes(l.target))
      .map((l) => ({ ...l }));
    _ids = new Set(_links.map((l) => [l.source, l.target]).flat());
    _nodes = [..._ids].map((id) => ({ ...nodes[id] }));

    // Create a simulation with several forces.
    simulation = forceSimulation(_nodes)
      .force(
        "link",
        forceLink(_links).id((d) => d.id),
      )
      .force("charge", forceManyBody())
      .force("x", forceX())
      .force("y", forceY());

    simulation.on("tick", () => {
      _nodes = _nodes;
      _links = _links;
    });
  }

  function update(selected) {
    if (simulation && selected.length !== _selected.length) {
      const oldLinks = _links.filter(
        (l) => selected.includes(l.source.id) || selected.includes(l.target.id),
      );
      const oldLinkIds = new Set(oldLinks.map((l) => l.id));
      const newLinks = links.filter(
        (l) =>
          !oldLinkIds.has(l.id) &&
          (selected.includes(l.source) || selected.includes(l.target)),
      );
      _ids = new Set([
        ...oldLinks.map((l) => [l.source.id, l.target.id]).flat(),
        ...newLinks.map((l) => [l.source, l.target]).flat(),
      ]);
      const oldNodes = _nodes.filter((n) => _ids.has(n.id));
      const oldIds = new Set(oldNodes.map((n) => n.id));
      const newNodes = [..._ids]
        .filter((id) => !oldIds.has(id))
        .map((id, i) => ({
          ...nodes[id],
          index: (oldNodes[oldNodes.length - 1]?.index || 0) + i,
        }));
      _nodes = [...oldNodes, ...newNodes];
      _links = [
        ...oldLinks,
        ...newLinks.map((l, i) => ({
          id: l.id,
          index: (oldLinks[oldLinks.length - 1]?.index || 0) + i,
          source: _nodes.find((n) => l.source === n.id),
          target: _nodes.find((n) => l.target === n.id),
        })),
      ];
      simulation.nodes(_nodes);
      simulation.force("link").links(_links);
      simulation.alpha(1.0).restart();
      _selected = selected;
    }
  }
  $: update(selected);

  onMount(() => {
    getGeoJSON();
    const selection = select(svg);
    selection.call(_zoom);
    doZoom = (factor) =>
      _zoom.scaleBy(selection.transition().duration(500), factor);
    init();
    mounted = true;
  });
</script>

<svg
  viewBox="{-width / 2} {-height / 2} {width} {height}"
  bind:this={svg}
  bind:clientWidth={width}
  bind:clientHeight={height}
>
  <g transform={transform?.toString()}>
    {#if mode === "map" && _geojson}
      <g>
        {#each _geojson.features as feature}
          <path d={_path(feature)} />
        {/each}
      </g>
    {/if}
    <g>
      {#each _links as l (l.id)}
        <Line
          {mode}
          xy1={mode === "map"
            ? _proj([l.source.lng, l.source.lat])
            : [l.source.x, l.source.y]}
          xy2={mode === "map"
            ? _proj([l.target.lng, l.target.lat])
            : [l.target.x, l.target.y]}
        />
      {/each}
    </g>
    <g>
      {#each _nodes as n (n.id)}
        <Circle
          {mode}
          xy={mode === "map" ? _proj([n.lng, n.lat]) : [n.x, n.y]}
          r={selected.includes(n.id) ? 5 : 4}
          on:click={() => doSelect(n.id)}
          fill={schemePaired[
            _scale(n.continent) + (selected.includes(n.id) ? 1 : 0)
          ]}
          title={n.name}
          scale={1 / (transform?.k || 1)}
        />
      {/each}
    </g>
    <g>
      {#each _nodes as n (n.id)}
        {#if selected.includes(n.id)}
          <Text
            {mode}
            xy={mode === "map" ? _proj([n.lng, n.lat]) : [n.x, n.y]}
            scale={1 / (transform?.k || 1)}>{n.name}</Text
          >
        {/if}
      {/each}
    </g>
  </g>
</svg>
<nav id="top-nav">
  <button on:click={() => doZoom(2)}>&plus;</button>
  <button on:click={() => doZoom(0.5)}>&minus;</button>
</nav>
<ul id="legend">
  {#each _domain as item, i}
    <li>
      <span
        class="bullet bullet-left"
        style:background={schemePaired[_range[i] + 1]}
      ></span><span
        class="bullet bullet-right"
        style:background={schemePaired[_range[i]]}
      ></span>
      {item}
    </li>
  {/each}
</ul>

<style>
  nav#top-nav {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  #legend {
    position: absolute;
    bottom: 10px;
    right: 10px;
    margin: 0;
    padding: 0;
  }
  #legend > li {
    display: inline-block;
    margin-left: 8px;
    white-space: nowrap;
  }
  .bullet {
    display: inline-block;
    width: 5px;
    height: 10px;
    background: grey;
  }
  .bullet-left {
    display: inline-block;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  .bullet-right {
    display: inline-block;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  path {
    stroke: #777;
    stroke-width: 1px;
    fill: none;
    vector-effect: non-scaling-stroke;
  }
</style>
