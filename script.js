function createBubbleChart(error, colleges) {
	var populations = colleges.map(function(college) { return +college.UndergradPopulation; });

	var averageCosts = colleges.map(function(college) { return +college.AverageCost; });
	var meanEarnings = colleges.map(function(college) { return +college.MeanEarnings; });
	var expenditures = colleges.map(function(college) { return +college.ExpenditurePerStudent; });
	var salaries = colleges.map(function(college) { return +college.AverageFacultySalary; });
	var familyIncomes = colleges.map(function(college) { return +college.AverageFamilyIncome; });
	var debts = colleges.map(function(college) { return +college.MedianDebt; });

	var regions = d3.set(colleges.map(function(college) { return college.Region; }));
	var regionColorScale = d3.scaleOrdinal(d3.schemeCategory10)
				.domain(regions.values());
	var forceStrength = 0.07;
	var costScaleX,
			costScaleY,
			earningsScaleX,
			earningsScaleY,
			expendituresScaleX,
			expendituresScaleY,
			salariesScaleX,
			salariesScaleY,
			familyIncomeScaleX,
			familyIncomeScaleY,
			debtScaleX,
			debtScaleY;

	var forceX;
	var forceY;
	var xScale;
	var yScale;

	var showPublic = true;
	var showPrivate = true;

	var width = 2000;
	var height = 1000;
	var svg;
	var circleScale = d3.scaleSqrt()
		.domain(d3.extent(populations))
		.range([3, 35]);
	var Xforces,
			Yforces,
			forceSimulation;
	createSVG();
	createChart();
	createForces();
	createForceSimulation();
	createAxes();

	function createSVG() {
		svg = d3.select("#chart")
			.append("svg")
				.attr("width", width+20)
				.attr("height", height+20);
	}

	function createForceSimulation() {
		forceSimulation = d3.forceSimulation()
			.force("x", forceX.x)
			.force("y", forceY.y)
			.force("collide", d3.forceCollide(forceCollide));
		forceSimulation.nodes(colleges)
			.on("tick", function() {
				circles
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });
			});
	}

	function forceCollide(d) {
		return 0;//circleRadiusScale(d.UndergradPopulation) + 1;
	}

	function createCombineForces() {
			return {
				x: d3.forceX(width / 2).strength(forceStrength),
				y: d3.forceY(height / 2).strength(forceStrength)
			};
		}

	function createChart() {
		console.log(colleges);
		var formatPopulation = d3.format(",");
		circles = svg.selectAll("circle")
			.data(colleges)
			.enter()
				.append("circle")
				.on('click', function(d) {
					createPieChart(d);
				})
				.attr("id",function(d,i) {return "circle-" + i;} )
				.attr("r", function(d) { return circleScale(d.UndergradPopulation); })
				.attr("fill", function(d) {
					return regionColorScale(d.Region);
				});
	}

	function createForces() {
		forces = {
			combine: createCombineForces()
		};
		Xforces = {
			averageCosts: createXCostForces(),
			meanEarnings: createXEarningsForces(),
			expenditures: createXExpendituresForces(),
			salaries: createXSalariesForces(),
			familyIncomes: createXFamilyIncomeForces(),
			debts: createXDebtForces()
		};
		Yforces = {
			averageCosts: createYCostForces(),
			meanEarnings: createYEarningsForces(),
			expenditures: createYExpendituresForces(),
			salaries: createYSalariesForces(),
			familyIncomes: createYFamilyIncomeForces(),
			debts: createYDebtForces()
		};
		forceX = Xforces.meanEarnings;
		forceY = Yforces.meanEarnings;
		xScale = earningsScaleX;
		yScale = earningsScaleY;
	}

	function createXCostForces() {
		costScaleX = d3.scaleLinear()
			.domain(d3.extent(averageCosts))
			.range([40, width]);
			
		return {
			x: d3.forceX(function(d) {
					return costScaleX(d.AverageCost);
			}).strength(forceStrength)      
		};
	}

	function createYCostForces() {
		costScaleY = d3.scaleLinear()
			.domain(d3.extent(averageCosts))
			.range([height-40, 0]);
			
		return {
			y: d3.forceY(function(d) {
					return costScaleY(d.AverageCost);
			}).strength(forceStrength)      
		};
	}

	function createXEarningsForces() {
		earningsScaleX = d3.scaleLinear()
			.domain(d3.extent(meanEarnings))
			.range([40, width]);
			
		return {
			x: d3.forceX(function(d) {
					return earningsScaleX(d.MeanEarnings);
			}).strength(forceStrength)      
		};
	}

	function createYEarningsForces() {
		earningsScaleY = d3.scaleLinear()
			.domain(d3.extent(meanEarnings))
			.range([height-40, 0]);
			
		return {
			y: d3.forceY(function(d) {
					return earningsScaleY(d.MeanEarnings);
			}).strength(forceStrength)      
		};
	}

	function createXExpendituresForces() {
		expendituresScaleX = d3.scaleLinear()
			.domain(d3.extent(expenditures))
			.range([40, width]);
		return {
			x: d3.forceX(function(d) {
				console.log("yesss");
					return expendituresScaleX(d.ExpenditurePerStudent);
			}).strength(forceStrength)      
		};
	}

	function createYExpendituresForces() {
		expendituresScaleY = d3.scaleLinear()
			.domain(d3.extent(expenditures))
			.range([height-40, 0]);
			
		return {
			y: d3.forceY(function(d) {
				console.log("yes");
					return expendituresScaleY(d.ExpenditurePerStudent);
			}).strength(forceStrength)      
		};
	}

	function createXSalariesForces() {
		salariesScaleX = d3.scaleLinear()
			.domain(d3.extent(salaries))
			.range([40, width]);
		return {
			x: d3.forceX(function(d) {
					return salariesScaleX(d.AverageFacultySalary);
			}).strength(forceStrength)      
		};
	}

	function createYSalariesForces() {
		salariesScaleY = d3.scaleLinear()
			.domain(d3.extent(salaries))
			.range([height-40, 0]);
			
		return {
			y: d3.forceY(function(d) {
					return salariesScaleY(d.AverageFacultySalary);
			}).strength(forceStrength)      
		};
	}

	function createXFamilyIncomeForces() {
		familyIncomeScaleX = d3.scaleLinear()
			.domain(d3.extent(familyIncomes))
			.range([40, width]);
		return {
			x: d3.forceX(function(d) {
					return familyIncomeScaleX(d.AverageFamilyIncome);
			}).strength(forceStrength)      
		};
	}

	function createYFamilyIncomeForces() {
		familyIncomeScaleY = d3.scaleLinear()
			.domain(d3.extent(familyIncomes))
			.range([height-40, 0]);
			
		return {
			y: d3.forceY(function(d) {
					return familyIncomeScaleY(d.AverageFamilyIncome);
			}).strength(forceStrength)      
		};
	}

	function createXDebtForces() {
		debtScaleX = d3.scaleLinear()
			.domain(d3.extent(debts))
			.range([40, width]);
		return {
			x: d3.forceX(function(d) {
					return debtScaleX(d.MedianDebt);
			}).strength(forceStrength)      
		};
	}

	function createYDebtForces() {
		debtScaleY = d3.scaleLinear()
			.domain(d3.extent(familyIncomes))
			.range([height-40, 0]);
			
		return {
			y: d3.forceY(function(d) {
					return debtScaleY(d.MedianDebt);
			}).strength(forceStrength)      
		};
	}

	d3.select('#xaxis')
			.on("change", function () {
				var sect = document.getElementById("xaxis");
				var section = sect.options[sect.selectedIndex].value
				if (section == "cost") {
					forceX = Xforces.averageCosts;
					xScale = costScaleX
				} else if (section == "earnings") {
					forceX = Xforces.meanEarnings;
					xScale = earningsScaleX;
				} else if (section == "expenditures") {
					forceX = Xforces.expenditures;
					xScale = expendituresScaleX;
				} else if (section == "salaries") {
					forceX = Xforces.salaries;
					xScale = salariesScaleX;
				} else if (section == "familyIncomes") {
					forceX = Xforces.familyIncomes;
					xScale = familyIncomeScaleX;
				} else if (section == "debts") {
					forceX = Xforces.debts;
					xScale = debtScaleX;
				}
				updateForces()
				createAxes()
			});
	d3.select('#yaxis')
			.on("change", function () {
				var sect = document.getElementById("yaxis");
				var section = sect.options[sect.selectedIndex].value
				if (section == "cost") {
					forceY = Yforces.averageCosts;
					yScale = costScaleY;
				} else if (section == "earnings") {
					forceY = Yforces.meanEarnings;
					yScale = earningsScaleY;
				} else if (section == "expenditures") {
					forceY = Yforces.expenditures;
					yScale = expendituresScaleY;
				} else if (section == "salaries") {
					forceY = Yforces.salaries;
					yScale = salariesScaleY;
				} else if (section == "familyIncomes") {
					forceY = Yforces.familyIncomes;
					yScale = familyIncomeScaleY;
				} else if (section == "debts") {
					forceY = Yforces.debts;
					yScale = debtScaleY;
				}
				updateForces()
				createAxes()
			});

	function updateForces() {
			forceSimulation
				.force("x", forceX.x)
				.force("y", forceY.y)
				.force("collide", d3.forceCollide(forceCollide))
				.alphaTarget(0.5)
				.restart();
		}

	function createAxes() {
		svg.selectAll("g").remove();
		var numberOfTicks = 10,
				tickFormat = ".0s";

		var xAxis = d3.axisBottom(xScale)
									.ticks(numberOfTicks, tickFormat);

		svg.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0," + (height - 20) + ")")
			.call(xAxis)
			.selectAll(".tick text")
			.attr("font-size", "14px");

		var yAxis = d3.axisLeft(yScale)
									.ticks(numberOfTicks, tickFormat);
		svg.append("g")
			.attr("class", "y-axis")
			.attr("transform", "translate(" + 40 + ",20)")
			.call(yAxis)
			.attr("font-size", "14px");
	}

	function createPieChart(college) {
		var data = [college.White, college.Black, college.Hispanic, college.Asian, college.Biracial, college.AmericanIndian, college.PacificIslander];
		console.log(college);
    var svg = d3.select("#pieChart"),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal(['#4daf4a','#377eb8','#ff7f00','#984ea3','#e41a1c']);

    // Generate the pie
    var pie = d3.pie();

    // Generate the arcs
    var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

    //Generate groups
    var arcs = g.selectAll("arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")

    //Draw arc paths
    arcs.append("path")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);
  }

}
