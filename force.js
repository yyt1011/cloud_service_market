const width = 800;
const height = 650;

const color = d3
  .scaleOrdinal()
  .range(["#FC515C", "#C053E0", "#1FD6E0", "#65FFA7"].reverse())
  .domain(d3.range(0, 3, 1));

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

d3.json("cloud.json").then((data) => {
  const graph = d3.hierarchy(data);
  const links = graph.links();
  const nodes = graph.descendants();

  console.log("nodes: ", nodes, "links: ", links);

  const link = svg
    .selectAll(".link")
    .data(links)
    .join("line")
    .classed("link", true);

  const node = svg
    .selectAll(".node")
    .data(nodes)
    .join("circle")
    .classed("node", true);

  const label = svg
    .selectAll("text")
    .data(nodes)
    .join("text")
    .style("font-size", "13px")
    .style("text-anchor", "middle")
    .style("font-family", "Roboto,Helvetica,Arial,sans-serif")
    .style("font-weight", "bold")
    .style("fill", "#fff")
    .text((d) => d.data.name);

  const simulation = d3
    .forceSimulation(nodes)
    .force("link", d3.forceLink(links).distance(0).strength(1))
    .force("charge", d3.forceManyBody().strength(-700))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", tick);

  const drag = d3.drag().on("drag", dragged).on("start", dragstart);
  node.call(drag);
  node.on("click", click);

  function tick() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
    node
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => (d.depth == 3 ? 15 : 10))
      .attr("fill", (d) => color(d.depth));

    label
      .attr("x", (d) => d.x)
      .attr("y", (d) => {
        const r = d.depth == 3 ? 15 : 10;
        return d.y + r + 15;
      });
  }

  function dragstart(event, d) {
    d3.select(this).classed("fixed", true);
  }

  function dragged(event, d) {
    const buffer = 25;
    const r = d.depth == 3 ? 15 + buffer : 10 + buffer;
    const x = event.x - r < r ? r : event.x + r > width ? width - r : event.x;
    const y = event.y - r < 0 ? r : event.y + r > height ? height - r : event.y;
    d.fx = x;
    d.fy = y;
    simulation.alpha(1).restart();
  }

  function click(event, d) {
    d3.select(this).classed("fixed", false);
    delete d.fx;
    delete d.fy;
    simulation.alpha(1).restart();
  }
});
