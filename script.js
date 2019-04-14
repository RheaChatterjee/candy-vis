function createBubbleChart(error, colleges) {
  var populations = colleges.map(function(college) { return +college.UndergradPopulation; });
  var meanPopulation = d3.mean(populations),
      populationExtent = d3.extent(populations),
      populationScaleX,
      populationScaleY;

  var regions = d3.set(colleges.map(function(college) { return college.Region; }));
  var regionColorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(regions.values());

  var width = 1500,
      height = 1000;
  var svg,
      circles,
      circleSize = { min: 10, max: 80 };
  var circleRadiusScale = d3.scaleSqrt()
    .domain(populationExtent)
    .range([circleSize.min, circleSize.max]);

  var forces,
      forceSimulation;

  createSVG();
  createCircles();
  createForces();
  createForceSimulation();
  addFillListener();
  addGroupingListeners();

  function createSVG() {
    svg = d3.select("#bubble-chart")
      .append("svg")
        .attr("width", width)
        .attr("height", height);
  }

  function isChecked(elementID) {
    return d3.select(elementID).property("checked");
  }

  function createCircles() {
    var formatPopulation = d3.format(",");
    circles = svg.selectAll("circle")
      .data(colleges)
      .enter()
        .append("circle")
        .attr("r", function(d) { return circleRadiusScale(d.UndergradPopulation); })
        .on("mouseover", function(d) {
          updateCollegeInfo(d);
        })
        .on("mouseout", function(d) {
          updateCollegeInfo();
        });
    updateCircles();

    function updateCollegeInfo(college) {
      var info = "";
      if (college) {
        info = [college.Name, formatPopulation(college.UndergradPopulation)].join(": ");
      }
      d3.select("#country-info").html(info);
    }
  }

  function updateCircles() {
    circles
      .attr("fill", function(d) {
        return regionColorScale(d.Region);
      });
  }

  function createForces() {
    var forceStrength = 0.05;

    forces = {
      combine:        createCombineForces(),
      continent:      createRegionForces(),
      population:     createPopulationForces()
    };

    function createCombineForces() {
      return {
        x: d3.forceX(width / 2).strength(forceStrength),
        y: d3.forceY(height / 2).strength(forceStrength)
      };
    }

    function createRegionForces() {
      return {
        x: d3.forceX(regionForceX).strength(forceStrength),
        y: d3.forceY(regionForceY).strength(forceStrength)
      };

      function regionForceX(d) {
        if (d.Region === "Rocky Mountains") {
          return left(width);
        } else if (d.Region === "Southwest") {
          return left(width);
        } else if (d.Region === "Mid-Atlantic") {
          return right(width);
        } else if (d.Region === "Great Lakes") {
          return right(width);
        }
        return center(width);
      }

      function regionForceY(d) {
        if (d.Region === "Rocky Mountains") {
          return top(height);
        } else if (d.Region === "Southwest") {
          return bottom(height);
        } else if (d.Region === "Mid-Atlantic") {
          return top(height);
        } else if (d.Region === "Great Lakes") {
          return bottom(height);
        }
        return center(height);
      }

      function left(dimension) { return dimension / 4; }
      function center(dimension) { return dimension / 2; }
      function right(dimension) { return dimension / 4 * 3; }
      function top(dimension) { return dimension / 4; }
      function bottom(dimension) { return dimension / 4 * 3; }
    }

    function createPopulationForces() {
      var scaledPopulationMargin = circleSize.max;
      populationScaleX = d3.scaleBand()
        .domain(regions.values())
        .range([scaledPopulationMargin, width - scaledPopulationMargin*2]);
      populationScaleY = d3.scaleLog()
        .domain(populationExtent)
        .range([height - scaledPopulationMargin, scaledPopulationMargin*2]);

      var centerCirclesInScaleBandOffset = populationScaleX.bandwidth() / 2;
      return {
        x: d3.forceX(function(d) {
            return populationScaleX(d.Region) + centerCirclesInScaleBandOffset;
          }).strength(forceStrength),
        y: d3.forceY(function(d) {
          return populationScaleY(d.UndergradPopulation);
        }).strength(forceStrength)
      };
    }

  }

  function createForceSimulation() {
    forceSimulation = d3.forceSimulation()
      .force("x", forces.combine.x)
      .force("y", forces.combine.y)
      .force("collide", d3.forceCollide(forceCollide));
    forceSimulation.nodes(colleges)
      .on("tick", function() {
        circles
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      });
  }

  function forceCollide(d) {
    return circleRadiusScale(d.UndergradPopulation) + 1;
  }

  function populationGrouping() {
    return isChecked("#population");
  }

  function addFillListener() {
    d3.selectAll('input[name="fill"]')
      .on("change", function() {
        !populationGrouping();
        updateCircles();
      });
  }

  function addGroupingListeners() {
    addListener("#combine",         forces.combine);
    addListener("#country-centers", forces.countryCenters);
    addListener("#continents",      forces.continent);
    addListener("#population",      forces.population);

    function addListener(selector, forces) {
      d3.select(selector).on("click", function() {
        updateForces(forces);
        !populationGrouping();
        togglePopulationAxes(populationGrouping());
      });
    }

    function updateForces(forces) {
      forceSimulation
        .force("x", forces.x)
        .force("y", forces.y)
        .force("collide", d3.forceCollide(forceCollide))
        .alphaTarget(0.5)
        .restart();
    }

    function togglePopulationAxes(showAxes) {
      var onScreenXOffset = 40,
          offScreenXOffset = -40;
      var onScreenYOffset = 40,
          offScreenYOffset = 100;

      if (d3.select(".x-axis").empty()) {
        createAxes();
      }
      var xAxis = d3.select(".x-axis"),
          yAxis = d3.select(".y-axis");

      if (showAxes) {
        translateAxis(xAxis, "translate(0," + (height - onScreenYOffset) + ")");
        translateAxis(yAxis, "translate(" + onScreenXOffset + ",0)");
      } else {
        translateAxis(xAxis, "translate(0," + (height + offScreenYOffset) + ")");
        translateAxis(yAxis, "translate(" + offScreenXOffset + ",0)");
      }

      function createAxes() {
        var numberOfTicks = 10,
            tickFormat = ".0s";

        var xAxis = d3.axisBottom(populationScaleX)
          .ticks(numberOfTicks, tickFormat);

        svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + (height + offScreenYOffset) + ")")
          .call(xAxis)
          .selectAll(".tick text")
            .attr("font-size", "16px");

        var yAxis = d3.axisLeft(populationScaleY)
          .ticks(numberOfTicks, tickFormat);
        svg.append("g")
          .attr("class", "y-axis")
          .attr("transform", "translate(" + offScreenXOffset + ",0)")
          .call(yAxis);
      }

      function translateAxis(axis, translation) {
        axis
          .transition()
          .duration(500)
          .attr("transform", translation);
      }
    }
  }

}
