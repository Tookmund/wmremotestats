function newDelivery () {
	return JSON.parse(JSON.stringify({"FS": 0, "MIX": 0, "RA": 0, "RSOC": 0, "RSOF": 0}));
}
var delivery = null;
var deptdeliver = null;

function updateGraph(dept) {
	var data;
	if (dept == "") data = delivery;
	else data = deptdeliver[dept];

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var x = d3.scaleBand()
		.range([0, width])
		.padding(0.1);
	var y = d3.scaleLinear()
		.range([height, 0]);

	d3.select("#graph").selectAll("svg").remove();

	var svg = d3.select("#graph")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");
	// Scale the range of the data in the domains
	xdom = []
	for (const d in data) {
		xdom.push(`${d}: ${data[d]}`);
	}
	x.domain(xdom);
	y.domain([0, d3.max(Object.values(data))]);
	// append the rectangles for the bar chart
	svg.selectAll(".bar")
		.data(Object.keys(data))
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", d => x(`${d}: ${data[d]}`));
			.attr("width", x.bandwidth())
			.attr("y", d => y(data[d]))
			.attr("height", d => height - y(data[d]));

	// add the x Axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// add the y Axis
	svg.append("g")
		.call(d3.axisLeft(y));
}

const b2 = "https://f000.backblazeb2.com/file/wmcoursescraper"
d3.csv(`${b2}/subjects.csv`).then(data => {
		data.splice(0, 0, { "Full": "All", "Short": ""});
		d3.select("#dept")
			.selectAll("option")
			.data(data)
			.enter()
			.append("option")
				.text(d => d.Full)
				.attr("value", (d, i) => d.Short);

		d3.select("#dept").on("change", () => {
			var dept = d3.select("#dept").node().value;
			updateGraph(dept);
		});
});

d3.csv(`${b2}/Fall2020.csv`).then(data => {
	delivery = newDelivery();
	deptdeliver = {}
	data.forEach(d => {
		for (const p in delivery) {
			if (d.Attributes.includes(p)) {
				delivery[p] += 1;
				if (!(d.Subject in deptdeliver)) {
					deptdeliver[d.Subject] = newDelivery();
				}
				deptdeliver[d.Subject][p] += 1
			}
		}
	});

	updateGraph("");
});
