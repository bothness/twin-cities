<script>
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";

  export let xy1 = [0, 0];
  export let xy2 = [0, 0];
  export let duration = 1000;
  export let mode = "network";

  let vals = new Tween([xy1, xy2], {
    duration,
    easing: cubicOut,
  });
  let _mode = mode;

  async function update(mode, xy1, xy2) {
    if (mode !== _mode) {
      vals.set([xy1, xy2], { duration });
      _mode = mode;
    } else {
      vals.set([xy1, xy2], { duration: _mode === "network" ? 0 : duration });
    }
  }
  $: update(mode, xy1, xy2);
</script>

<line
  x1={vals.current[0][0]}
  y1={vals.current[0][1]}
  x2={vals.current[1][0]}
  y2={vals.current[1][1]}
/>

<style>
  line {
    stroke: #aaa;
    stroke-width: 0.5;
    vector-effect: non-scaling-stroke;
  }
</style>
