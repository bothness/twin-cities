import distance from "@turf/distance";

function mergeGroups(groups) {
  let input = [...groups];
  let output = [];
  while (input.length > 0) {
    let group = input.shift();
    while (true) {
      const include = input.filter((grp) =>
        grp.some((id) => group.includes(id)),
      );
      const exclude = input.filter(
        (grp) => !grp.some((id) => group.includes(id)),
      );
      group = Array.from(new Set([group, ...include].flat()));
      if (exclude.length === input.length) break;
      input = exclude;
    }
    output.push(group);
  }
  return output.sort((a, b) => b.length - a.length);
}
// const groups = mergeGroups(nodeList.map(n => [n.id, ...n.twins]));
// console.log({groups});

function makeClusters(nodes, nodeList) {
  const clusterStrings = [];
  const clusters = [];
  function findClusters(nodes, group, tried = []) {
    if (group.length < 3) return;
    if (
      tried.length === group.length &&
      group.every((id) => tried.includes(id))
    ) {
      const cluster = [...group].sort((a, b) => a.localeCompare(b));
      const clusterString = cluster.join("_");
      if (!clusterStrings.includes(clusterString)) {
        clusterStrings.push(clusterString);
        clusters.push(cluster);
      }
      return;
    }
    const next = nodes[group.find((id) => !tried.includes(id))];
    const intersection = new Set(group).intersection(
      new Set([next.id, ...next.twins]),
    );
    return findClusters(nodes, Array.from(intersection), [...tried, next.id]);
  }
  for (const node of nodeList) findClusters(nodes, [node.id, ...node.twins]);
  return clusters.sort((a, b) => b.length - a.length);
}
// const clusters = makeClusters(nodes, nodeList);
// console.log({clusters});

function shortestPaths(nodes, start, end) {
  const visited = new Set([start]);
  let paths = [[start]];
  while (true) {
    paths = paths
      .map((p) =>
        nodes[p[p.length - 1]].twins
          .filter((t) => !visited.has(t))
          .map((t) => [...p, t]),
      )
      .flat()
      .filter((p) => p.length > 0);
    if (paths.length === 0) return [];
    for (const p of paths.map((p) => p[p.length - 1])) visited.add(p);
    if (visited.has(end)) {
      return paths.filter((p) => p[p.length - 1] === end);
    }
  }
}
// const paths = shortestPaths(nodes, "Q72259", "Q79848");
// console.log({paths});

function anyShortestPath(nodes, start, end) {
  const visited = new Set([start]);
  const steps = [[start]];
  while (true) {
    const current = steps[steps.length - 1];
    if (current.includes(end)) {
      const path = [end];
      for (const step of [...steps].reverse().slice(1)) {
        path.push(
          step
            .map((s) => nodes[s])
            .find((n) => n.twins.includes(path[path.length - 1])).id,
        );
      }
      return [...path].reverse();
    }
    const next = [];
    for (const c of current) {
      const twins = nodes[c].twins.filter((t) => !visited.has(t));
      for (const t of twins) {
        next.push(t);
        visited.add(t);
      }
    }
    if (next.length === 0) return null;
    steps.push(next);
  }
}
// const paths = anyShortestPath(nodes, "Q656", "Q130191");
// console.log({paths});

function shuffle(array, random = Math.random) {
  return array
    .map((value) => ({ value, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function longestShortestPath(nodes) {
  const keys = Object.keys(nodes)
    .filter((k) => nodes[k].twins.length === 1)
    .filter((k) => nodes[nodes[k].twins[0]].twins.length === 2);
  let longest;
  let progress = 0;
  const routes = {};
  for (const a of keys) {
    for (const b of keys) {
      if (a !== b) {
        const ab = `${a}_${b}`;
        const ba = `${b}_${a}`;
        if (!routes[ab] && !routes[ba]) routes[ab] = true;
      }
    }
  }
  for (const r of shuffle(Object.keys(routes))) {
    const path = anyShortestPath(nodes, r.split("_")[0], r.split("_")[1]);
    if (path && path.length > (longest?.length || 0)) {
      longest = path;
      console.log(
        `Longest route: ${nodes[longest[0]].name} to ${nodes[longest[longest.length - 1]].name}. ${longest.length} steps...`,
      );
    }
    progress += 1;
    if (progress % 100 === 0)
      console.log(`${progress.toLocaleString()} routes tested...`);
  }
  return longest;
}
// const longestPath = longestShortestPath(nodes);
// console.log(longestPath);

function calcDistance(nodes, from, to) {
  const point = (node) => ({
    type: "Point",
    coordinates: [node.lng, node.lat],
  });
  return distance(point(nodes[from]), point(nodes[to]));
}
// const dist = calcDistance(nodes, "Q130191", "Q3820");
// console.log({dist});

function calcTotalDistance(nodes, path) {
  const distances = path
    .slice(0, -1)
    .map((d, i) => calcDistance(nodes, d, path[i + 1]));
  return distances.reduce((a, b) => a + b, 0);
}
// const path = anyShortestPath(nodes, "Q1000060", "Q1025302");
// const dist = calcDistance(nodes, "Q1000060", "Q1025302");
// const totalDist = calcTotalDistance(nodes, path);
// console.log({path, dist, totalDist});

function closestTwin(nodes, city) {
  return [...nodes[city].twins].sort(
    (a, b) => calcDistance(nodes, city, a) - calcDistance(nodes, city, b),
  )[0];
}

const closestTwins = nodeList
  .map((n) => {
    const twin = closestTwin(nodes, n.id);
    return { city: n.id, twin, distance: calcDistance(nodes, n.id, twin) };
  })
  .sort((a, b) => a.distance - b.distance);
