function newDelivery () {
	return JSON.parse(JSON.stringify({"FS": 0, "MIX": 0, "RA": 0, "RSOC": 0, "RSOF": 0}));
}

const sizes = ["5", "10", "20", "30", "40", "50"];

function newSizeDelivery () {
	var ret = [];
	for (var i in sizes) {
		var s = newDelivery();
		s["size"] = sizes[i];
		ret.push(s);
	}
	return ret;
}

var delivery = null;
var deptdeliver = null;
var sizedeliver = null
var deptsizedeliver = null;

const margin = {top: 20, right: 20, bottom: 30, left: 40},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

const color = d3.scaleOrdinal()
	.domain(Object.keys(newDelivery()))
	.range(['#00B388', '#CAB64B', '#84344E', '#64CCC9', '#E56A54'])

function updateGraph(dept) {
	var data;
	var sizedata;
	if (dept == "") {
		data = delivery;
		sizedata = sizedeliver;
	}
	else {
		data = deptdeliver[dept];
		sizedata = deptsizedeliver[dept];
	}
	d3.select("#deptgraph").selectAll("*").remove();
	d3.select("#sizegraph").selectAll("svg").remove();
	if (data == undefined) {
		d3.select("#deptgraph").append("p").text("No Data!");
		return;
	}

	var x = d3.scaleBand()
		.range([0, width])
		.padding(0.1);
	var y = d3.scaleLinear()
		.range([height, 0]);


	var svg = d3.select("#deptgraph")
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
			.attr("x", d => x(`${d}: ${data[d]}`))
			.attr("width", x.bandwidth())
			.attr("y", d => y(data[d]))
			.attr("height", d => height - y(data[d]))
			.attr("fill", d => color(d));

	// add the x Axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// add the y Axis
	svg.append("g")
		.call(d3.axisLeft(y));

	// Size Graph

	var svg = d3.select("#sizegraph")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

	var groups = d3.map(sizedata, d => d.size).keys();
	var subgroups = Object.keys(sizedata.filter(k => k !== "size"));

	var x = d3.scaleBand()
		.domain(groups)
		.range([0, width])
		.padding(0.1);

	svg.append("g")
		.attr("transform", "translate(0, "+height+")")
		.call(d3.axisBottom(x).tickSizeOuter(0));

	var y = d3.scaleLinear()
		.domain([0,d3.max(sizedata.map(function(v, i, self) {
			var total = 0;
			for (var d in v) {
				if (d != "size") total += v[d];
			}
			return total;
		}))])
		.range([height, 0]);

		svg.append("g")
			.call(d3.axisLeft(y));


		var stackedData = d3.stack()
			.keys(Object.keys(data))
			(sizedata);

		  // Show the bars
		  svg.append("g")
		  	.selectAll("g")
			// Enter in the stack data = loop key per key = group per group
			.data(stackedData)
			.enter().append("g")
				.attr("fill", function(d) { return color(d.key); })
				.selectAll("rect")
				// enter a second time = loop subgroup per subgroup to add all rectangles
				.data(function(d) { return d; })
				.enter().append("rect")
					.attr("x", function(d) { return x(d.data.size); })
					.attr("y", function(d) { return y(d[1]); })
					.attr("height", function(d) { return y(d[0]) - y(d[1]); })
					.attr("width", x.bandwidth());
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

d3.csv(`${b2}/Spring2021.csv`).then(data => {
	delivery = newDelivery();
	sizedeliver = newSizeDelivery();
	deptdeliver = {};
	deptsizedeliver = {};
	data.forEach(d => {
		for (const p in delivery) {
			if (d.Attributes.includes(p)) {
				delivery[p] += 1;
				if (!(d.Subject in deptdeliver)) {
					deptdeliver[d.Subject] = newDelivery();
					deptsizedeliver[d.Subject] = newSizeDelivery();
				}
				deptdeliver[d.Subject][p] += 1
				for (var i in sizedeliver) {
					if (+d.Enrolled == 0) break;
					if (+d.Enrolled < +sizedeliver[i]["size"] || i == sizedeliver.length - 1) {
						sizedeliver[i][p] += 1
						deptsizedeliver[d.Subject][i][p] += 1;
						break;
					}
				}
			}
		}
	});

	updateGraph("");
});
