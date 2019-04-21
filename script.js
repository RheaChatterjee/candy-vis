function createBubbleChart(error, colleges) {
  var populations = colleges.map(function(college) {
    return +college.UndergradPopulation;
  });

  var averageCosts = colleges.map(function(college) {
    return +college.AverageCost;
  });
  var meanEarnings = colleges.map(function(college) {
    return +college.MeanEarnings;
  });
  var expenditures = colleges.map(function(college) {
    return +college.ExpenditurePerStudent;
  });
  var salaries = colleges.map(function(college) {
    return +college.AverageFacultySalary;
  });
  var familyIncomes = colleges.map(function(college) {
    return +college.AverageFamilyIncome;
  });
  var debts = colleges.map(function(college) {
    return +college.MedianDebt;
  });

  var regions = d3.set(
    colleges.map(function(college) {
      return college.Region;
    })
  );
  var regionColorScale = d3
    .scaleOrdinal([
      "#8dd3c7",
      "#bebada",
      "#fb8072",
      "#80b1d3",
      "#fdb462",
      "#b3de69",
      "#ecb0b8",
      "#831c26",
      "#b7707d"
    ])
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

  // Define the div for the tooltip
  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var width = 1500;
  var height = 900;
  var svg;
  var circleScale = d3
    .scaleSqrt()
    .domain(d3.extent(populations))
    .range([3, 35]);
  var Xforces, Yforces, forceSimulation;
  createSVG();
  createChart();
  createForces();
  createForceSimulation();
  createAxes();

  makeLegend();

  function createSVG() {
    svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + 20)
      .attr("height", height + 20);
  }

  function createForceSimulation() {
    forceSimulation = d3
      .forceSimulation()
      .force("x", forceX.x)
      .force("y", forceY.y)
      .force("collide", d3.forceCollide(forceCollide));
    forceSimulation.nodes(colleges).on("tick", function() {
      circles
        .attr("cx", function(d) {
          return d.x;
        })
        .attr("cy", function(d) {
          return d.y;
        });
    });
  }

  function forceCollide(d) {
    return 0; //circleRadiusScale(d.UndergradPopulation) + 1;
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
    circles = svg
      .selectAll("circle")
      .data(colleges)
      .enter()
      .append("circle")
      .on("click", function(d) {
        createPieChart(d);
      })
      .on("mouseover", function(d) {
        var thisCircle = d3.select(this);
        createHover(d, thisCircle);
      })
      .on("mouseout", function(d) {
        var thisCircle = d3.select(this);
        clearHover(d, thisCircle);
      })
      .attr("id", function(d, i) {
        return "circle-" + i;
      })
      .attr("r", function(d) {
        return circleScale(d.UndergradPopulation);
      })
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
    costScaleX = d3
      .scaleLinear()
      .domain(d3.extent(averageCosts))
      .range([40, width]);

    return {
      x: d3
        .forceX(function(d) {
          return costScaleX(d.AverageCost);
        })
        .strength(forceStrength)
    };
  }

  function createYCostForces() {
    costScaleY = d3
      .scaleLinear()
      .domain(d3.extent(averageCosts))
      .range([height - 40, 0]);

    return {
      y: d3
        .forceY(function(d) {
          return costScaleY(d.AverageCost);
        })
        .strength(forceStrength)
    };
  }

  function createXEarningsForces() {
    earningsScaleX = d3
      .scaleLinear()
      .domain(d3.extent(meanEarnings))
      .range([40, width]);

    return {
      x: d3
        .forceX(function(d) {
          return earningsScaleX(d.MeanEarnings);
        })
        .strength(forceStrength)
    };
  }

  function createYEarningsForces() {
    earningsScaleY = d3
      .scaleLinear()
      .domain(d3.extent(meanEarnings))
      .range([height - 40, 0]);

    return {
      y: d3
        .forceY(function(d) {
          return earningsScaleY(d.MeanEarnings);
        })
        .strength(forceStrength)
    };
  }

  function createXExpendituresForces() {
    expendituresScaleX = d3
      .scaleLinear()
      .domain(d3.extent(expenditures))
      .range([40, width]);
    return {
      x: d3
        .forceX(function(d) {
          console.log("yesss");
          return expendituresScaleX(d.ExpenditurePerStudent);
        })
        .strength(forceStrength)
    };
  }

  function createYExpendituresForces() {
    expendituresScaleY = d3
      .scaleLinear()
      .domain(d3.extent(expenditures))
      .range([height - 40, 0]);

    return {
      y: d3
        .forceY(function(d) {
          console.log("yes");
          return expendituresScaleY(d.ExpenditurePerStudent);
        })
        .strength(forceStrength)
    };
  }

  function createXSalariesForces() {
    salariesScaleX = d3
      .scaleLinear()
      .domain(d3.extent(salaries))
      .range([40, width]);
    return {
      x: d3
        .forceX(function(d) {
          return salariesScaleX(d.AverageFacultySalary);
        })
        .strength(forceStrength)
    };
  }

  function createYSalariesForces() {
    salariesScaleY = d3
      .scaleLinear()
      .domain(d3.extent(salaries))
      .range([height - 40, 0]);

    return {
      y: d3
        .forceY(function(d) {
          return salariesScaleY(d.AverageFacultySalary);
        })
        .strength(forceStrength)
    };
  }

  function createXFamilyIncomeForces() {
    familyIncomeScaleX = d3
      .scaleLinear()
      .domain(d3.extent(familyIncomes))
      .range([40, width]);
    return {
      x: d3
        .forceX(function(d) {
          return familyIncomeScaleX(d.AverageFamilyIncome);
        })
        .strength(forceStrength)
    };
  }

  function createYFamilyIncomeForces() {
    familyIncomeScaleY = d3
      .scaleLinear()
      .domain(d3.extent(familyIncomes))
      .range([height - 40, 0]);

    return {
      y: d3
        .forceY(function(d) {
          return familyIncomeScaleY(d.AverageFamilyIncome);
        })
        .strength(forceStrength)
    };
  }

  function createXDebtForces() {
    debtScaleX = d3
      .scaleLinear()
      .domain(d3.extent(debts))
      .range([40, width]);
    return {
      x: d3
        .forceX(function(d) {
          return debtScaleX(d.MedianDebt);
        })
        .strength(forceStrength)
    };
  }

  function createYDebtForces() {
    debtScaleY = d3
      .scaleLinear()
      .domain(d3.extent(debts))
      .range([height - 40, 0]);

    return {
      y: d3
        .forceY(function(d) {
          return debtScaleY(d.MedianDebt);
        })
        .strength(forceStrength)
    };
  }

  d3.select("#xaxis").on("change", function() {
    var sect = document.getElementById("xaxis");
    var section = sect.options[sect.selectedIndex].value;
    if (section == "cost") {
      forceX = Xforces.averageCosts;
      xScale = costScaleX;
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
    updateForces();
    createAxes();
  });
  d3.select("#yaxis").on("change", function() {
    var sect = document.getElementById("yaxis");
    var section = sect.options[sect.selectedIndex].value;
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
    updateForces();
    createAxes();
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

    var xAxis = d3.axisBottom(xScale).ticks(numberOfTicks, tickFormat);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + (height - 20) + ")")
      .call(xAxis)
      .selectAll(".tick text")
      .attr("font-size", "14px");

    var yAxis = d3.axisLeft(yScale).ticks(numberOfTicks, tickFormat);
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(" + 40 + ",20)")
      .call(yAxis)
      .attr("font-size", "14px");
  }

  function createPieChart(college) {
    var data = [
      college.White,
      college.Black,
      college.Hispanic,
      college.Asian,
      college.Biracial,
      college.AmericanIndian,
      college.PacificIslander
    ];
    console.log(college);
    var svg = d3.select("#pieChart"),
      width = svg.attr("width"),
      height = svg.attr("height"),
      radius = Math.min(width, height) / 2,
      g = svg
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal([
      "#66c2a5",
      "#fc8d62",
      "#8da0cb",
      "#e78ac3",
      "#a6d854",
      "#ffd92f",
      "#e5c494"
    ]);

    // Generate the pie
    var pie = d3.pie();

    // Generate the arcs
    var arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    //Generate groups
    var arcs = g
      .selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    //Draw arc paths
    arcs
      .append("path")
      .attr("fill", function(d, i) {
        return color(i);
      })
      .attr("d", arc);
  }

  function createHover(college, thisCircle) {
    thisCircle.classed("dot--hovered", true);
    div
      .transition()
      .duration(200)
      .style("opacity", 0.9);
    div
      .html(
        "<b>" +
          college.Name +
          "</b>" +
          "<br/>" +
          "<br/>" +
          "<b>" +
          "Region: " +
          "</b>" +
          college.Region +
          "<br/>" +
          "<br/>" +
          "<b>" +
          "Average Cost: " +
          "</b>" +
          "$" +
          college.AverageCost +
          "<br/>" +
          "<br/>" +
          "<b>" +
          "Mean Earnings: " +
          "</b>" +
          "$" +
          college.MeanEarnings +
          "<br/>" +
          "<br/>" +
          "<b>" +
          "Expenditure Per Student: " +
          "</b>" +
          "$" +
          college.ExpenditurePerStudent +
          "<br/>" +
          "<br/>" +
          "<b>" +
          "Average Faculty Salary: " +
          "</b>" +
          "$" +
          college.AverageFacultySalary +
          "<br/>" +
          "<br/>" +
          "<b>" +
          "Average Family Income: " +
          "</b>" +
          "$" +
          college.AverageFamilyIncome +
          "<br/>" +
          "<br/>" +
          "<b>" +
          "Median Debt: " +
          "</b>" +
          "$" +
          college.MedianDebt +
          "</b>" +
          "<br/>" +
          "<br/>"
      )
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY - 28 + "px");
  }

  function clearHover(college, thisCircle) {
    thisCircle.classed("dot--hovered", false);
    div
      .transition()
      .duration(500)
      .style("opacity", 0);
  }
  function makeLegend() {
    var svg = d3.select("#bubbleChartLegend");
    console.log("test");
    var keys = regions.values();

    var color = d3
      .scaleOrdinal()
      .domain(keys)
      .range([
        "#8dd3c7",
        "#bebada",
        "#fb8072",
        "#80b1d3",
        "#fdb462",
        "#b3de69",
        "#ecb0b8",
        "#831c26",
        "#b7707d"
      ]);

    svg
      .selectAll("mydots")
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", function(d, i) {
        return 20 + 170 * i;
      })
      .attr("cy", 10)
      .attr("r", 7)
      .style("fill", function(d) {
        return color(d);
      });

    svg
      .selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", function(d, i) {
        return 30 + 170 * i;
      })
      .attr("y", 10)
      .style("fill", function(d) {
        return color(d);
      })
      .text(function(d) {
        return d;
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");
  }
}
