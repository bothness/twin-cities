<script>
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let xy;
  export let duration = 1000;
  export let mode = "network";
  export let scale = 1;

  let vals = new Tween(xy, {
    duration,
    easing: cubicOut,
  });
  let _mode = mode;

  async function update(mode, xy) {
    if (mode !== _mode) {
      vals.set(xy, { duration });
      _mode = mode;
    } else {
      vals.set(xy, { duration: _mode === "network" ? 0 : duration });
    }
  }
  $: update(mode, xy);
</script>

<text
  text-anchor="middle"
  transform="translate({vals.current[0]} {vals.current[1]}) scale({scale})"
  ><slot /></text
>

<style>
  text {
    pointer-events: none;
    paint-order: stroke;
    fill: white;
    stroke: #222;
    /* transition: all 1s ease-in-out; */
  }
</style>
