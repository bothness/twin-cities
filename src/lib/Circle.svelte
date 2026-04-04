<script>
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import tooltip from "./tooltip";

  export let xy;
  export let duration = 1000;
  export let fill = "grey";
  export let r = 4;
  export let title = "";
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

<circle
  {r}
  on:click
  style:fill
  transform="translate({vals.current[0]} {vals.current[1]}) scale({scale})"
  use:tooltip
>
  <title>{title}</title>
</circle>

<style>
  circle {
    fill: lightblue;
    cursor: pointer;
  }
</style>
