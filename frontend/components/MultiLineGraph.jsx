import React, { Component, PropTypes } from 'react';
// dunno why I can't import but it ain't workin'
const d3 = require('d3');

export default class MultiLineGraph extends Component {
  static numberInstantiated = 0
  constructor(props) {
    super(props);
    this.number = this.constructor.numberInstantiated++;
  }

  componentDidMount() {
    this.initialize(this.props);
  }

  shouldComponentUpdate(props) {
    this.initialize(props);
    return false;
  }

  initialize(props) {
    if (!props.data) {
      return;
    }

    const limit = 60 * 5;
    const duration = 750;
    let now = new Date(Date.now() - duration);

    const width = 500;
    const height = 200;

    // I'm feeling nostalgic
    const colors = ['red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'black', 'white'];

    this.metrics = props.data.map((value, i) => ({
      value,
      color: colors[i % colors.length],
      data: d3.range(limit).map(() => 0),
    }));

    const x =
      d3.scaleTime()
        .domain([now - (limit - 2), now - duration])
        .range([0, width]);

    const y =
      d3.scaleLinear()
        .domain([0, props.max])
        .range([height, 0]);

    const line = d3.line()
      .curve(d3.curveBasis)
      .x((d, i) => x(now - (limit - 1 - i) * duration))
      .y(y);

    const svg = d3.select(`.${this.className()}`)
      .append('svg')
      .attr('class', 'chart')
      .attr('width', width)
      .attr('height', height + 50);

    const xAxis = svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(x.axis = d3.axisBottom().scale(x));

    svg.append('g')
      .attr('class', 'y axis')
      .call(y.axis = d3.axisLeft().scale(y));

    const paths = svg.append('g');

    this.metrics.forEach((metric, i) => {
      metric.path = paths.append('path')
        .data([metric.data])
        .attr('class', `${i} group`)
        .style('stroke', metric.color);
    });

    this.tick = () => {
      now = new Date();
      this.metrics.forEach((metric, i) => {
        metric.data.push((this.props.data || props.data)[i]);
        metric.path.attr('d', line);
      });

      x.domain([now - (limit - 2) * duration, now - duration]);

      xAxis.transition()
        .ease(d3.easeLinear)
        .call(x.axis);

      paths.attr('transform', null)
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr('transform', `translate(${x(now - (limit - 1) * duration)})`)
        .on('end', ::this.tick);

      this.metrics.forEach(metric => metric.data.shift());
    };

    this.tick();
    // so only props get updated (and shouldComponentUpdate does nothing but return false)
    this.initialize = () => {};
  }


  className() {
    return `${this.constructor.name}-${this.number}`;
  }


  render() {
    return (<div className={`graph ${this.className()}`} />);
  }
}

MultiLineGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  max: PropTypes.number.isRequired,
};
