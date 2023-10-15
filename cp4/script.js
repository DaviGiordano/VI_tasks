// Declare global variables to hold data for countries and capita
var globalDataCountries;
var globalDataCapita;

// Define margin and dimensions for the charts
const margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 80,
};
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Function to start the dashboard
function startDashboard() {
  // Helper functions to load JSON and CSV files using D3's d3.json and d3.csv
  function loadJSON(file) {
    return d3.json(file);
  }
  function loadCSV(file) {
    return d3.csv(file);
  }

  // Function to import both files (data.json and gapminder.csv) using Promise.all
  function importFiles(file1, file2) {
    return Promise.all([loadJSON(file1), loadCSV(file2)]);
  }

  // File names for JSON and CSV files
  const file1 = "data.json";
  const file2 = "clean_books.csv";

  // Import the files and process the data
  importFiles(file1, file2).then(function (results) {
    // Store the JSON data into globalDataCountries using topojson.feature
    globalDataCountries = topojson.feature(results[0], results[0].objects.countries);
    
    // Store the CSV data into globalDataCapita
    globalDataCapita = results[1];

    // Convert incomeperperson, alcconsumption, armedforcesrate, co2emissions
    //and internetuserate data to numbers
    globalDataCapita.forEach(function (d) {
      d.pages = +d.pages;
      d.num_in_series = +d.num_in_series;
      d.norm_rating = +d.norm_rating;
      d.norm_num_awards = +d.norm_num_awards;
      d.norm_num_ratings = +d.norm_num_ratings;
    });

    // Call functions to create the line chart
    createLineChart();
  });
}

// Function to create the line chart 
function createLineChart() {
  // Filter the data to remove entries with missing values
  currentData = globalDataCapita.filter(function (d) {
    return d.norm_rating != "" && d.norm_num_awards != "" && d.norm_num_ratings != "" && d.pages != "" && d.num_in_series != "";
  });

  const data_norm_rating = create_data_list("norm_rating");
  const data_norm_num_awards = create_data_list("norm_num_awards");
  const data_norm_num_ratings = create_data_list("norm_num_ratings");
  

  function avg_y(x, attribute){
    var count = 0;
    var attrSum = 0;
    currentData.forEach((element) => {
      if(element.num_in_series == x){
        switch(attribute) {
          case "norm_rating":
            attrSum = attrSum + element.norm_rating;
            break;
          case "norm_num_awards":
            attrSum = attrSum + element.norm_num_awards;
            break;
          case "norm_num_ratings":
            attrSum = attrSum + element.norm_num_ratings;
            break;
        }
        count = count + 1;
      }
    });
  var avg_y = attrSum / count;
  return avg_y;
}

function create_data_list(attribute) {
  const data_list = []; 
  const max_x = d3.max(currentData, (d) => d.num_in_series); 
  for (let i = 0; i < max_x; i++) {
    if (avg_y(i, attribute)) {
      data_list.push([i, avg_y(i, attribute)]); 
    } 
  }
  return data_list;
}

//norm_rating   norm_num_awards    norm_num_ratings

  // Create x and y scales for the line chart
  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(currentData, (d) => d.num_in_series),
      d3.max(currentData, (d) => d.num_in_series),
    ])
    .range([0, width]);
    //console.log('min num in series', d3.min(currentData, (d) => d.num_in_series))
    //console.log('max num in series', d3.max(currentData, (d) => d.num_in_series))

  const yScale = d3
  .scaleLinear()
  .domain([0, 1,])
  .range([height, 0]);  

  const yScale_norm_rating = d3
    .scaleLinear()
    .domain([d3.min(data_norm_rating, (d) => d[1]), d3.max(data_norm_rating, (d) => d[1]),])
    .range([height, 0]);

  const yScale_norm_num_awards = d3
  .scaleLinear()
  .domain([d3.min(data_norm_num_awards, (d) => d[1]), d3.max(data_norm_num_awards, (d) => d[1]),])
  .range([height, 0]);

  const yScale_norm_num_ratings = d3
  .scaleLinear()
  .domain([d3.min(data_norm_num_ratings, (d) => d[1]), d3.max(data_norm_num_ratings, (d) => d[1]),])
  .range([height, 0]);
    //console.log('min norm_rating', d3.min(currentData, (d) => d.norm_rating))
    //console.log('max norm_rating', d3.max(currentData, (d) => d.norm_rating))
    console.log('median norm_rating', d3.median(currentData, (d) => d.norm_rating))
    //console.log('min norm_num_awards', d3.min(currentData, (d) => d.norm_num_awards))
    //console.log('max norm_num_awards', d3.max(currentData, (d) => d.norm_num_awards))
    console.log('median norm_num_awards', d3.median(currentData, (d) => d.norm_num_awards))
    //console.log('min norm_num_ratings', d3.min(currentData, (d) => d.norm_num_ratings))
    //console.log('max norm_num_ratings', d3.max(currentData, (d) => d.norm_num_ratings))
    console.log('median norm_num_ratings', d3.median(currentData, (d) => d.norm_num_ratings))

  
//FOR CREATING LEGEND
var keys = ["Rating", "Number of Awards", "Number of Reviews"]

var color = d3.scaleOrdinal()
  .domain(keys)
  .range(d3.schemeSet2);


// Create the SVG container.
const svg = d3
.select("#lineChart")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

var line_norm_rating = d3.line()
.x(function(d) { return xScale(d[0]); }) 
.y(function(d) { return yScale_norm_rating(d[1]); }) 
.curve(d3.curveMonotoneX)

svg.append("path")
  .attr("fill", "none")
  .attr("stroke", color("Rating"))
  .attr("stroke-width", 1.5)
  .attr("d", line_norm_rating(data_norm_rating));

var line_norm_num_awards = d3.line()
.x(function(d) { return xScale(d[0]); }) 
.y(function(d) { return yScale_norm_num_awards(d[1]); }) 
.curve(d3.curveMonotoneX)

svg.append("path")
  .attr("fill", "none")
  .attr("stroke", color("Number of Awards"))
  .attr("stroke-width", 1.5)
  .attr("d", line_norm_num_awards(data_norm_num_awards));
  
var line_norm_num_ratings = d3.line()
.x(function(d) { return xScale(d[0]); }) 
.y(function(d) { return yScale_norm_num_ratings(d[1]); }) 
.curve(d3.curveMonotoneX)

svg.append("path")
  .attr("fill", "none")
  .attr("stroke", color("Number of Reviews"))
  .attr("stroke-width", 1.5)
  .attr("d", line_norm_num_ratings(data_norm_num_ratings));


  //   data_norm_rating = create_data_list("norm_rating");
  // data_norm_num_awards = create_data_list("norm_num_awards");
  // data_norm_num_ratings
// Add one dot in the legend for each name.
svg.selectAll("mydots")
  .data(keys)
  .enter()
  .append("circle")
    .attr("cx", width - 140)
    .attr("cy", function(d,i){ return 0 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 5)
    .style("fill", function(d){ return color(d)})

// Add one text in the legend for each name.
svg.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", width - 120)
    .attr("y", function(d,i){ return 0 + i*25}) //25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  // Create tick marks and labels for the x and y axes
  var xTicks = [];
  var yTicks = [];
  for (let index = 0; index <= 1; index += 0.25) {
    xTicks.push(Math.round(xScale.invert(index * width)));
    yTicks.push(Math.round(yScale.invert(index * height)));
  }

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d)
        .tickValues(xTicks)
        .tickSizeOuter(0)
    );

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => d)
        .tickValues(yTicks)
        .tickSizeOuter(0)
    );

  // Add labels for the x and y axes
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("# in book series");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Success metric");

  
}



////////////////// PAOLO ////////////////////////////

// Add an event listener for the "Apply Filter" button
document.getElementById("filterButton").addEventListener("click", updateLineChart);

// Function to update the line chart based on the selected range of pages and dates
function updateLineChart() {
    // Get the user's input for minimum and maximum pages
    const minPages = +document.getElementById("minPages").value;
    const maxPages = +document.getElementById("maxPages").value;

    // Get the user's input for start and end dates
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    // Log a message to the console when the function is called
    console.log("updateLineChart called with minPages:", minPages, "and maxPages:", maxPages);
    console.log("Start Date:", startDate, "End Date:", endDate);

    // Filter the data based on the selected range of pages and dates
    const filteredData = currentData.filter(function (d) {
        const bookDate = new Date(d.clean_date);
        return (
            d.pages >= minPages &&
            d.pages <= maxPages &&
            bookDate >= startDate &&
            bookDate <= endDate &&
            d.norm_rating != "" && d.norm_num_awards != "" && d.norm_num_ratings != "" && d.pages != "" && d.num_in_series != ""
        );
    });

    console.log("Data for path creation:", filteredData);

    // Call functions to create the line chart with the filtered data
    creaLineChart(filteredData);
}


// // Function to create the line chart
// function creaLineChart(data) {
// // Clear the previous chart if it exists
// d3.select("#lineChart").selectAll("*").remove();

// // Define the margin and dimensions for the chart area
// const margin = {
//     top: 20,
//     right: 20,
//     bottom: 50,
//     left: 80,
// };
// const width = 500 - margin.left - margin.right;
// const height = 400 - margin.top - margin.bottom;

// // Create an SVG container for the chart
// const svg = d3
//     .select("#lineChart")
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

// // Define scales for x and y axes based on your data attributes
// const xScale = d3
//     .scaleLinear()
//     .domain([
//         d3.min(data, (d) => d.num_in_series),
//         d3.max(data, (d) => d.num_in_series),
//     ])
//     .range([0, width]);

// const yScale = d3
//     .scaleLinear()
//     .domain([0, 1])
//     .range([height, 0]);

// // Define and draw the lines on the chart based on your data attributes
// const line = d3.line()
//     .x(function (d) {
//         return xScale(d.num_in_series);
//     })
//     .y(function (d) {
//         return yScale(d.success_rate);
//     })
//     .curve(d3.curveMonotoneX);

// ////// ERRORE QUI  

//  console.log("Data for path creation:", data);
//  console.log("Resulting path string:", line(data));

// const lines = svg
//     .selectAll(".line")
//     .data([data])
//     .enter()
//     .append("path")
//     .attr("class", "line")
//     .attr("d", line)
//     .style("fill", "none")
//     .style("stroke", "steelblue")
//     .style("stroke-width", 2);


// // Create and update the x and y axes
// const xAxis = d3.axisBottom(xScale);
// const yAxis = d3.axisLeft(yScale);


// svg
//     .append("g")
//     .attr("class", "x-axis")
//     .attr("transform", `translate(0, ${height})`)
//     .call(xAxis);

// svg
//     .append("g")
//     .attr("class", "y-axis")
//     .call(yAxis);

// // Add labels for the x and y axes
// svg
//     .append("text")
//     .attr("class", "x-axis-label")
//     .attr("x", width / 2)
//     .attr("y", height + margin.top + 20)
//     .style("text-anchor", "middle")
//     .text("# in book series");

// svg
//     .append("text")
//     .attr("class", "y-axis-label")
//     .attr("x", -height / 2)
//     .attr("y", -margin.left + 30)
//     .style("text-anchor", "middle")
//     .attr("transform", "rotate(-90)")
//     .text("Success metric");
// }



 function creaLineChart(data) {
 // Clear the previous chart if it exists
 d3.select("#lineChart").selectAll("*").remove();

 const data_norm_rating = create_data_list("norm_rating");
 const data_norm_num_awards = create_data_list("norm_num_awards");
 const data_norm_num_ratings = create_data_list("norm_num_ratings");
 

 function avg_y(x, attribute){
   var count = 0;
   var attrSum = 0;
   currentData.forEach((element) => {
     if(element.num_in_series == x){
       switch(attribute) {
         case "norm_rating":
           attrSum = attrSum + element.norm_rating;
           break;
         case "norm_num_awards":
           attrSum = attrSum + element.norm_num_awards;
           break;
         case "norm_num_ratings":
           attrSum = attrSum + element.norm_num_ratings;
           break;
       }
       count = count + 1;
     }
   });
 var avg_y = attrSum / count;
 return avg_y;
}

function create_data_list(attribute) {
 const data_list = []; 
 const max_x = d3.max(data, (d) => d.num_in_series); 
 for (let i = 0; i < max_x; i++) {
   if (avg_y(i, attribute)) {
     data_list.push([i, avg_y(i, attribute)]); 
   } 
 }
 return data_list;
}

//norm_rating   norm_num_awards    norm_num_ratings

 // Create x and y scales for the line chart
 const xScale = d3
   .scaleLinear()
   .domain([
     d3.min(data, (d) => d.num_in_series),
     d3.max(data, (d) => d.num_in_series),
   ])
   .range([0, width]);
   //console.log('min num in series', d3.min(currentData, (d) => d.num_in_series))
   //console.log('max num in series', d3.max(currentData, (d) => d.num_in_series))

 const yScale = d3
 .scaleLinear()
 .domain([0, 1,])
 .range([height, 0]);  

 const yScale_norm_rating = d3
   .scaleLinear()
   .domain([d3.min(data_norm_rating, (d) => d[1]), d3.max(data_norm_rating, (d) => d[1]),])
   .range([height, 0]);

 const yScale_norm_num_awards = d3
 .scaleLinear()
 .domain([d3.min(data_norm_num_awards, (d) => d[1]), d3.max(data_norm_num_awards, (d) => d[1]),])
 .range([height, 0]);

 const yScale_norm_num_ratings = d3
 .scaleLinear()
 .domain([d3.min(data_norm_num_ratings, (d) => d[1]), d3.max(data_norm_num_ratings, (d) => d[1]),])
 .range([height, 0]);
   //console.log('min norm_rating', d3.min(currentData, (d) => d.norm_rating))
   //console.log('max norm_rating', d3.max(currentData, (d) => d.norm_rating))
   console.log('median norm_rating', d3.median(data, (d) => d.norm_rating))
   //console.log('min norm_num_awards', d3.min(currentData, (d) => d.norm_num_awards))
   //console.log('max norm_num_awards', d3.max(currentData, (d) => d.norm_num_awards))
   console.log('median norm_num_awards', d3.median(data, (d) => d.norm_num_awards))
   //console.log('min norm_num_ratings', d3.min(currentData, (d) => d.norm_num_ratings))
   //console.log('max norm_num_ratings', d3.max(currentData, (d) => d.norm_num_ratings))
   console.log('median norm_num_ratings', d3.median(data, (d) => d.norm_num_ratings))

 
//FOR CREATING LEGEND
var keys = ["Rating", "Number of Awards", "Number of Reviews"]

var color = d3.scaleOrdinal()
 .domain(keys)
 .range(d3.schemeSet2);


// Create the SVG container.
const svg = d3
.select("#lineChart")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

var line_norm_rating = d3.line()
.x(function(d) { return xScale(d[0]); }) 
.y(function(d) { return yScale_norm_rating(d[1]); }) 
.curve(d3.curveMonotoneX)

svg.append("path")
 .attr("fill", "none")
 .attr("stroke", color("Rating"))
 .attr("stroke-width", 1.5)
 .attr("d", line_norm_rating(data_norm_rating));

var line_norm_num_awards = d3.line()
.x(function(d) { return xScale(d[0]); }) 
.y(function(d) { return yScale_norm_num_awards(d[1]); }) 
.curve(d3.curveMonotoneX)

svg.append("path")
 .attr("fill", "none")
 .attr("stroke", color("Number of Awards"))
 .attr("stroke-width", 1.5)
 .attr("d", line_norm_num_awards(data_norm_num_awards));
 
var line_norm_num_ratings = d3.line()
.x(function(d) { return xScale(d[0]); }) 
.y(function(d) { return yScale_norm_num_ratings(d[1]); }) 
.curve(d3.curveMonotoneX)

svg.append("path")
 .attr("fill", "none")
 .attr("stroke", color("Number of Reviews"))
 .attr("stroke-width", 1.5)
 .attr("d", line_norm_num_ratings(data_norm_num_ratings));


 //   data_norm_rating = create_data_list("norm_rating");
 // data_norm_num_awards = create_data_list("norm_num_awards");
 // data_norm_num_ratings
// Add one dot in the legend for each name.
svg.selectAll("mydots")
 .data(keys)
 .enter()
 .append("circle")
   .attr("cx", width - 140)
   .attr("cy", function(d,i){ return 0 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
   .attr("r", 5)
   .style("fill", function(d){ return color(d)})

// Add one text in the legend for each name.
svg.selectAll("mylabels")
 .data(keys)
 .enter()
 .append("text")
   .attr("x", width - 120)
   .attr("y", function(d,i){ return 0 + i*25}) //25 is the distance between dots
   .style("fill", function(d){ return color(d)})
   .text(function(d){ return d})
   .attr("text-anchor", "left")
   .style("alignment-baseline", "middle")

 // Create tick marks and labels for the x and y axes
 var xTicks = [];
 var yTicks = [];
 for (let index = 0; index <= 1; index += 0.25) {
   xTicks.push(Math.round(xScale.invert(index * width)));
   yTicks.push(Math.round(yScale.invert(index * height)));
 }

 svg
   .append("g")
   .attr("class", "x-axis")
   .attr("transform", `translate(0,${height})`)
   .call(
     d3
       .axisBottom(xScale)
       .tickFormat((d) => d)
       .tickValues(xTicks)
       .tickSizeOuter(0)
   );

 svg
   .append("g")
   .attr("class", "y-axis")
   .call(
     d3
       .axisLeft(yScale)
       .tickFormat((d) => d)
       .tickValues(yTicks)
       .tickSizeOuter(0)
   );

 // Add labels for the x and y axes
 svg
   .append("text")
   .attr("class", "x-axis-label")
   .attr("x", width / 2)
   .attr("y", height + margin.top + 20)
   .style("text-anchor", "middle")
   .text("# in book series");

 svg
   .append("text")
   .attr("class", "y-axis-label")
   .attr("x", -height / 2)
   .attr("y", -margin.left + 30)
   .style("text-anchor", "middle")
   .attr("transform", "rotate(-90)")
   .text("Success metric");

 


 }