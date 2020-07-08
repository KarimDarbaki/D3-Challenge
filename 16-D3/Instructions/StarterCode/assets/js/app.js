// @TODO: YOUR CODE HERE!
// Use d3.json() to fetch data from JSON file

// ========================================================
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(dataset, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d[chosenXAxis]) * 0.8,
      d3.max(dataset, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup,textGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    textGroup.transition()
    .duration(1000)
    .attr("dx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty:";
  }
  else {
    label = "Age:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.poverty}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(dataset, err) {
  if (err) throw err;
console.log(dataset)
  // parse data
  dataset.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(dataset, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

    var textGroup = chartGroup.selectAll("text.t")
    .data(dataset)
    .enter()
    .append("text")
    .attr('class', 't')
    .text(d=>d.abbr)
    .attr("dx", d => xLinearScale(d[chosenXAxis])-10)
    .attr("dy", d => yLinearScale(d.healthcare))
    .attr("class", "statetext");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Health Care low");
    
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(dataset, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup,textGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
       
        if (chosenXAxis === "poverty") {
          
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          
          ageLabel
            .classed("active",true)
            .classed("inactive", false);
          povertyLabel
            .classed("inactive", true)
            .classed("active", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});



// ===================================

// Incoming data is internally referred to as incomingData


// d3.json("data/data.csv").then((incomingData) => {
//   function filterMovieRatings(movie) {
//     return movie.imdbRating > 8.9;
//   }






// d3.csv("assets/data/data.csv").then(function(data) {
//      //  Create the Traces
//      var trace1 = {
//         x: data.smokers,
//         y: data.Age.map(val => Math.sqrt(val)),
//         type: "scatter",
//         name: "Smokers vs Age",
//         boxpoints: "all"
//       };
    
//       // Create the data array for the plot
//       var data = [trace1];
    
//       // Define the plot layout
//       var layout = {
//         title: "Square Root of Cancer Survival by Organ",
//         xaxis: { title: "Organ" },
//         yaxis: { title: "Square Root of Survival" }
//       };
    
//       // Plot the chart to a div tag with id "plot"
//       Plotly.newPlot("plot", data, layout);
//   });



  
// ============================================================================
// next option for scatter plot

  // set the dimensions and margins of the graph
  // var margin = {top: 10, right: 30, bottom: 30, left: 60},
  // width = 460 - margin.left - margin.right,
  // height = 400 - margin.top - margin.bottom;
  
  // // append the svg object to the body of the page
  // var svg = d3.select("#scatter")
  // .append("svg")
  // .attr("width", width + margin.left + margin.right)
  // .attr("height", height + margin.top + margin.bottom)
  // .append("g")
  // .attr("transform",
  //       "translate(" + margin.left + "," + margin.top + ")");
  
  // //Read the data
  // d3.csv("assets/data/data.csv", function(data) {
  
  // // Add X axis
  // var x = d3.scaleLinear()
  // .domain([0, 4000])
  // .range([ 0, width ]);
  // svg.append("g")
  // .attr("transform", "translate(0," + height + ")")
  // .call(d3.axisBottom(x));
  
  // // Add Y axis
  // var y = d3.scaleLinear()
  // .domain([0, 500000])
  // .range([ height, 0]);
  // svg.append("g")
  // .call(d3.axisLeft(y));
  
  // // Add dots
  // svg.append('g')
  // .selectAll("dot")
  // .data(data)
  // .enter()
  // .append("circle")
  //   .attr("cx", function (d) { return x(d.GrLivArea); } )
  //   .attr("cy", function (d) { return y(d.SalePrice); } )
  //   .attr("r", 1.5)
  //   .style("fill", "#69b3a2")
  
  // })