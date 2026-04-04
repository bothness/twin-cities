<script>
  import {onMount} from "svelte";
  import {zoom} from 'd3-zoom';
  import {select} from 'd3-selection';
	import {geoPath} from "d3-geo";
  import {geoCylindricalEqualArea} from "d3-geo-projection";
  import {feature} from "topojson-client";
  // import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
  // import pointToPolygonDistance from "@turf/point-to-polygon-distance";
  import cleanCoords from "@turf/clean-coords";

  export let nodes;
  export let links;

  let width = 400;
  let height = 400;
  let geojson;
	let svg, doZoom, transform;

	const _zoom = zoom().on('zoom', (e) => transform = e.transform.toString());

  $: proj = geoCylindricalEqualArea().fitWidth(width, {type: "LineString", coordinates: [[-180, -90], [180, 90]]});
  $: path = geoPath().projection(proj);

  async function getGeoJSON() {
    const json = await (await fetch("./data/boundaries.json")).json();
    const geo = feature(json, "ne_10m_admin_0_countries");
    geo.features = geo.features.map(f => cleanCoords(f));
    geojson = geo;
  }

  // function getCountry(point, countries) {
  //   for (const country of countries) {
  //     if (booleanPointInPolygon(point, country)) return country.properties;
  //   }
  //   return null;
  // }

  onMount(async () => {
    await getGeoJSON();
    const selection = select(svg);
		selection.call(_zoom);
		doZoom = (factor) => _zoom.scaleBy(selection.transition().duration(500), factor);

    // const nodeList = Object.values(nodes).map(n => {
    //   const point = {type: "Point", coordinates: [+n.lng, +n.lat]};
    //   let country = getCountry(point, geojson.features);
    //   if (!country) {
    //     console.log(n.name, n, point);
    //     const distances = geojson.features.map(f => pointToPolygonDistance(point, f.geometry));
    //     const minDistance = Math.min(...distances);
    //     country = geojson.features[distances.indexOf(minDistance)].properties;
    //   }
    //   console.log(n.name, country?.NAME, country);
    //   return {...n, country: country.NAME, countrycd: country.ISO_A2, continent: country.CONTINENT, region: country.REGION_UN};
    // });
    // console.log(nodeList);
  });
</script>

<svg viewBox="0 0 {width} {height}" bind:this={svg} bind:clientWidth={width} bind:clientHeight={height}>
  <g {transform}>
    {#if geojson}
      <g>
        {#each geojson.features as feature}
          <path d="{path(feature)}"/>
        {/each}
      </g>
    {/if}
    <g>
      {#each links as link}
        {#if nodes[link.source].lng && nodes[link.target].lng}
          <line
            x1={proj([nodes[link.source].lng, nodes[link.source].lat])[0]}
            y1={proj([nodes[link.source].lng, nodes[link.source].lat])[1]}
            x2={proj([nodes[link.target].lng, nodes[link.target].lat])[0]}
            y2={proj([nodes[link.target].lng, nodes[link.target].lat])[1]}/>
        {/if}
      {/each}
    </g>
    <g>
      {#each Object.values(nodes) as node}
        <circle cx={proj([node.lng, node.lat])[0]} cy={proj([node.lng, node.lat])[1]} r={2}>
          <title>{node.name} ({node.lng}, {node.lat})</title>
        </circle>
      {/each}
    </g>
  </g>
</svg>
<nav>
  <button on:click={() => doZoom(2)}>&plus;</button>
  <button on:click={() => doZoom(0.5)}>&minus;</button>
</nav>

<style>
	nav {
		position: absolute;
    top: 10px;
    right: 10px;
	}
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
  path {
    stroke: #ccc;
    stroke-width: 1px;
    fill: none;
  }
  line {
    stroke: #ccc;
    stroke-width: 0.25px;
    fill: none;
  }
</style>