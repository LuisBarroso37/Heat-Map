let data;
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

//GET json from url using fetch
async function getData(Url) {
  const fetchRes = await fetch(Url);
  const fetchResData = await fetchRes.json();
  
  return fetchResData;
}

//Get data and use it to make scatter plot graph
getData(url).then(val => {
  data = val;
  
  let baseTemp = data.baseTemperature;
 
  let tempDate = data.monthlyVariance.map(val => {
    return {month: val.month, year: val.year, variance: val.variance};
});
  
  const colors = ['#1B5E20','#388E3C','#4CAF50','#81C784','#C8E6C9','#FFE0B2','#FFB74D','#FF9800','#F57C00','#E65100','#DD2C00'];
  
  function getColorByValue(value) {
    if (value <= 2.8) {
        return colors[0];
    } else if (value > 2.8 && value <= 3.9) {
        return colors[1];
    } else if (value > 3.9 && value <= 5.0) {
        return colors[2];
    } else if (value > 5.0 && value <= 6.1) {
        return colors[3];
    } else if (value > 6.1 && value <= 7.2) {
        return colors[4];
    } else if (value > 7.2 && value <= 8.3) {
        return colors[5];
    } else if (value > 8.3 && value <= 9.5) {
        return colors[6];
    } else if (value > 9.5 && value <= 10.6) {
        return colors[7];
    } else if (value > 11.7 && value <= 12.8) {
        return colors[8];
    } else {
        return colors[9];
    }
};
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  //Heat map\\
  const w = 1400;
  const h = 700;
  const padding = 80;
  const minYear = d3.min(tempDate, d => d.year);
  const maxYear = d3.max(tempDate, d => d.year);
 
  //Scales - scatter plot
  const xScale = d3.scaleLinear()
                   .domain([minYear, maxYear])
                   .range([padding, w - padding]);
  
  let yScale = d3.scaleBand()
                   .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                   .range([padding, h - padding]);

  //Scale - legend
  const legendScale = d3.scaleLinear().domain([2.8, 12.8])
  .range([0, 270]);
  
  //Tooltip
  const tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip');

  //Rect
  const heightConst = yScale.bandwidth();
  
  const svg = d3.select('#chart')
                .append('svg')
                .attr('width', w)
                .attr('height', h);
  
  //Rect - legend
  svg.selectAll('rect')
     .data(colors)
     .enter()
     .append('rect')
     .attr('id', 'legend')
     .attr('x', (d, i) => i * 30 + 50)
     .attr('y', d => h - padding + 30)
     .attr('width', 30)
     .attr('height', 30)
     .style('fill', d => d);
  
  //Rect - scatter plot
  svg.selectAll('rect') 
     .data(tempDate)
     .enter()
     .append('rect')
     .attr('x', d => xScale(d.year))
     .attr('y', d => yScale(d.month - 1))
     .attr('width', parseFloat(w/(maxYear - minYear)))
     .attr('height', heightConst)
     .attr('class', 'cell')
     .attr('data-year', d => d.year)
     .attr('data-month', d => d.month - 1)
     .attr('data-temp', d => baseTemp + d.variance)
     .attr('fill', d => {
        let result = baseTemp + d.variance;
        return getColorByValue(result); 
     })
     .on('mouseover', d => {
       tooltip.style("left", d3.event.pageX + 20 + "px")
              .style("top", d3.event.pageY - 30 + "px")
              .style("display", "inline-block")
              .style('opacity', 1)
             .html(`${monthNames[d.month - 1]} ${d.year}<br>${(baseTemp + d.variance).toFixed(2)} °C<br> ${d.variance.toFixed(2)} °C`)
              .attr('data-year', d.year);
     })
     .on('mouseout', d => {
       tooltip.style('opacity', 0)
              .style('display', 'none');
     });
  
  //Axes - scatter plot
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
  
  const yAxis = d3.axisLeft(yScale).tickValues(yScale.domain()).tickFormat(d => monthNames[d]);

  svg.append('g')
     .attr('transform', `translate(0, ${(h - padding)})`)
     .attr('id', 'x-axis')
     .call(xAxis.ticks(20));
    
  svg.append('g')
     .attr('transform', `translate(${padding}, 0)`)
     .attr('id', 'y-axis')
     .call(yAxis);

//Axis - legend
const legendAxis = d3.axisBottom(legendScale)
  .tickSize(10, 0)
.tickValues([2.8, 3.9, 5.1, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8])
  .tickFormat(d3.format(".1f"));
  
//Axes labels - scatter plot
  svg.append('text')
     .attr('transform', `translate(${(w/2)}, ${(h - padding + 50)})`)
     .attr('class', 'label')
     .text('Year');
  
  svg.append('text')
     .attr('transform', 'rotate(-90)')
     .attr('y', padding - 50)
     .attr('x', -(h / 2))
     .attr('class', 'label')
     .text('Month');
  
  //Axis label - legend
  svg.append('g')
     .attr('transform', `translate(${padding}, ${(h - padding + 60)})`)
     .attr('id', 'legend-axis')
     .call(legendAxis);
  });