const b2 = "https://f000.backblazeb2.com/file/wmcoursescraper"
d3.csv(`${b2}/subjects.csv`).then(data => {
		d3.select("#dept")
			.selectAll("option")
			.data(data)
			.enter()
			.append("option")
				.text(d => d.Full)
				.attr("value", (d, i) => d.Short);
});

d3.csv(`${b2}/Fall2020.csv`).then(data => {
	var delivery = {"FS": 0, "MIX": 0, "RA": 0, "RSOC": 0, "RSOF": 0};
	data.forEach(d => {
		for (const p in delivery) {
			if (d.Attributes.includes(p)) {
				delivery[p] += 1;
			}
		}
	});
	d3.select("body")
		.append("div")
		.text(JSON.stringify(delivery));

	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var x = d3.scaleBand()
		.range([0, width])
		.padding(0.1);
	var y = d3.scaleLinear()
		.range([height, 0]);
	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");
	// Scale the range of the data in the domains
	x.domain(Object.keys(delivery));
	y.domain([0, d3.max(Object.values(delivery))]);
	// append the rectangles for the bar chart
	svg.selectAll(".bar")
		.data(Object.keys(delivery))
		.enter().append("rect")
			.attr("class", "bar")
			.attr("x", d => x(d))
			.attr("width", x.bandwidth())
			.attr("y", d => y(delivery[d]))
			.attr("height", d => height - y(delivery[d]));

	// add the x Axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// add the y Axis
	svg.append("g")
		.call(d3.axisLeft(y));
});
