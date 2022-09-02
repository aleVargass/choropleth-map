var svg = d3.select("#svg");

var tip = d3.select("#tooltip")
    .style("opacity", 0);

var path = d3.geoPath();

var x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

var color = d3
    .scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
    .range(d3.schemeGreens[8]);

var legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0, 40)");

legend.selectAll("rect")
    .data(
        color.range().map(d => {
            d = color.invertExtent(d);
            if (d[0] === null) d[0] = x.domain()[0];
            if (d[1] === null) d[1] = x.domain()[1];
            return d;
        })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", d => x(d[0]))
    .attr("width", d => d[0] && d[1] ? x(d[1]) - x(d[0]) : x(null))
    .attr("fill", d => color(d[0]))

legend.call(
    d3
        .axisBottom(x)
        .tickSize(13)
        .tickFormat(x => Math.round(x) + "%")
        .tickValues(color.domain())
)
    .select(".domain")
    .remove()

const EDUCATION_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const COUNTY_FILE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
    
Promise.all([d3.json(COUNTY_FILE), d3.json(EDUCATION_FILE)])
    .then(data => ready(data[0], data[1]))
    .catch(err => console.error(err));

function ready(us, education) {
    svg
        .append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => {
            var result = education.filter(obj => obj.fips === d.id)
            if (result[0]) return result[0].bachelorsOrHigher
            return 0
        })
        .attr("fill", d => {
            var result = education.filter(obj => obj.fips === d.id)
            if (result[0]) return color(result[0].bachelorsOrHigher)
            return color(0)
        })
        .attr("d", path)
        .on("mouseover", function (e, d) {
            tip.style("opacity", .9);
            tip.html( () => {
                var result = education.filter(obj => obj.fips === d.id);
                if (result[0]) return result[0].area_name + " " + result[0].state + " " + result[0].bachelorsOrHigher + "%";
                return 0
            })
            .attr("data-education", () => {
                var result = education.filter(obj => obj.fips === d.id)
                if (result[0]) return result[0].bachelorsOrHigher;
                return 0
            })
            .style("left", e.pageX + 10 + "px")
            .style("top", e.pageY - 28 + "px");
        })
        .on("mouseout", function() {
            tip.style("opacity", 0);
        })
    
    svg
        .append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("class", "states")
        .attr("d", path);
}