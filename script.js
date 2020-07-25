d3.csv("https://f000.backblazeb2.com/file/wmcoursescraper/Fall2020.csv").then(
	function(data) {
		d3.select("body")
			.append("select")
			.attr("id", "dept")
			.selectAll("option")
			.data(data)
			.enter().append("option")
			.text(d => d.Subject)
			.attr("value", (d, i) => d.Subject);


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
			.text(delivery);
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
	})
;
