function _1(md) {
    return (
        md`# US State County Map`
    )
}

async function _selectedStateId(d3, FileAttachment, html) {
    const states = (d3.tsvParse(await FileAttachment('us-state-names.tsv').text()))
    return html`
        <select>
            ${states.map((state) => `<option value=${state.id}>${state.name}</option>`)}
        </select>
    `
}


function _3(d3, DOM, stateData, path, countiesData, tooltip) {
    let selectedCounty = null; // Variable to track the currently zoomed-in county

    const width = 960
    const height = 600
    const svg = d3.select(DOM.svg(width, height))

    // Make our SVG responsive.
    svg.attr('viewBox', `0 0 ${width} ${height}`)
    svg.attr('preserveAspectRatio', 'xMidYMid meet')
    svg.style('max-width', '100%').style('height', 'auto')

    const g = svg.append('g')

    g.append('g')
        .attr('class', 'states')
        .selectAll('path')
        .data(stateData)
        .join('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('id', 'state')

    g.append('clipPath')
        .attr('id', 'clip-state')
        .append('use')
        .attr('xlink:href', '#state')

    // All counties.
    g.append('g')
        .attr('class', 'counties')
        .selectAll('path')
        .data(countiesData)
        .join('path')
        .attr('clip-path', 'url(#clip-state)')
        .attr('class', 'county')
        .attr('d', path)
        .on('mouseover', function (d) {
            this.classList.add('hovered')
            tooltip.text(d.properties.name).style('display', '')
        })
        .on('mousemove', function () {
            tooltip
                .style('top', (d3.event.pageY - 10) + 'px')
                .style('left', (d3.event.pageX + 10) + 'px')
        })
        .on('mouseout', function () {
            this.classList.remove('hovered')
            tooltip.style('display', 'none')
        })


    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);
    //
    svg.call(zoom);
    // Update button visibility and position based on zoom level
    svg.on('zoom', () => {
        const isZoomedIn = d3.event.transform.k !== 1; // Check zoom scale
        d3.select('.back-button').style('display', isZoomedIn ? 'block' : 'none');
        calculateButtonPosition(); // Update button position
        updateCountyStyles(); // Update county styles
    });


    function zoomed() {
        g.attr('transform', d3.event.transform);
    }

    // Add click event for counties
    g.selectAll('.county')
        .on('click', function (feature, d) {
            console.log("ZOOM")
            console.log(feature)
            console.log(d)
            if (selectedCounty) {
                d3.select(`#${selectedCounty.properties.name}`).classed('selected-county', false);
            }

            selectedCounty = feature; // Set the selected county when clicked

            // Detach the selected county's SVG element
            const selectedCountyNode = d3.select(this).remove().node();

            // Re-append the selected county's SVG element to draw on top
            g.node().appendChild(selectedCountyNode);


            // Add clicked class to the clicked county
            d3.select(this).classed('selected-county', true);

            const bounds = path.bounds(feature);
            const [[x0, y0], [x1, y1]] = bounds; // Get the corners of the bounding box

            console.log(x0, y0, x1, y1)
            const w = x1 - x0;
            const h = y1 - y0;

            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity
                    .translate(width / 2, height / 2)
                    .scale(Math.min(8, 0.9 / Math.max(w / width, h / height)))
                    .translate(-(x0 + w / 2), -(y0 + h / 2))
            );

        })

    // Add "Back" button
    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.textContent = 'Back';
    backButton.classList.add('back-button'); // Add a class for styling
    document.body.appendChild(backButton);



// Calculate position for the "Back" button
    function calculateButtonPosition() {
        if (selectedCounty) {
            const bounds = path.bounds(selectedCounty);
            const [x0, y0] = bounds[0]; // Transformed coordinates of the top left corner
            const buttonPadding = 10; // Padding from the corner

            // Set button position
            d3.select('.back-button')
                .style('position', 'absolute')
                .style('top', `${y0 + buttonPadding}px`)
                .style('left', `${x0 + buttonPadding}px`);
        }
    }


    // Add event listener for "Back" button
    d3.select('#back-button').on('click', () => {
        selectedCounty = null; // Reset selected county on "Back" button click
        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity
        );
        calculateButtonPosition(); // Reset button position
        updateCountyStyles(); // Reset county styles
    });

    function updateCountyStyles() {
        g.selectAll('.county')
            .classed('clicked', d => d === selectedCounty) // Add class to clicked county
            .style('stroke', d => (d === selectedCounty ? 'black' : 'gray')) // Set stroke color
            .style('fill', d => (d === selectedCounty ? 'orange' : 'none')); // Set fill color
    }

    return svg.node()
}


// Function to update county styles


function _tooltip(d3) {
    return (
        d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('position', 'absolute')
            .text('test')
    )
}

function _path(d3, projection) {
    return (
        d3.geoPath().projection(projection)
    )
}

function _projection(d3, width, height, stateData) {
    return (
        d3.geoIdentity().fitSize([width, height], stateData[0])
    )
}

function _stateData(topojson, usData, selectedStateId) {
    return (
        topojson.feature(usData, usData.objects.states).features.filter((d) => d.id === selectedStateId)
    )
}

function _countiesData(topojson, usData) {
    return (
        topojson.feature(usData, usData.objects.counties).features
    )
}

async function _usData(d3) {
    return (
        await d3.json('https://d3js.org/us-10m.v2.json')
    )
}

function _height() {
    return (
        600
    )
}

function _width() {
    return (
        960
    )
}

function _topojson(require) {
    return (
        require('topojson-client@3')
    )
}

function _d3(require) {
    return (
        require("d3@5")
    )
}

function _14(html) {
    return (
        html`
            <style>
                .back-button {
                    position: fixed;
                    top: 20%;
                    left: 50px;
                }

                .states,
                .counties {
                    fill: none;
                    stroke: black;
                    stroke-width: 1px;
                }
                .selected-county {
                    stroke: red;
                    /*fill: #9097b4 !important; */
                    z-index: 10;
                }

                .states path,
                .counties path {
                    fill: white;
                }

                .counties path.hovered {
                    fill: orange;
                }

                .tooltip {
                    background: #333;
                    border-radius: 2px;
                    color: #fff;
                    font-size: 12px;
                    padding: 4px;
                    position: absolute;
                }
            </style>`
    )
}

export default function define(runtime, observer) {
    const main = runtime.module();

    function toString() {
        return this.url;
    }

    const fileAttachments = new Map([
        ["us-state-names.tsv", {
            url: new URL("./files/94f974993e6c23bd335905a00f2a2d72e6a4f977b5174ac14d9d834c295381b7f4dd226bbddd9a75d597e91f95c1fa5e0e270a10e45ba5f702a0195e4ebc770e.tsv", import.meta.url),
            mimeType: "text/tab-separated-values",
            toString
        }]
    ]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer()).define(["md"], _1);
    main.variable(observer("viewof selectedStateId")).define("viewof selectedStateId", ["d3", "FileAttachment", "html"], _selectedStateId);
    main.variable(observer("selectedStateId")).define("selectedStateId", ["Generators", "viewof selectedStateId"], (G, _) => G.input(_));
    main.variable(observer()).define(["d3", "DOM", "stateData", "path", "countiesData", "tooltip"], _3);
    main.variable(observer("tooltip")).define("tooltip", ["d3"], _tooltip);
    main.variable(observer("path")).define("path", ["d3", "projection"], _path);
    main.variable(observer("projection")).define("projection", ["d3", "width", "height", "stateData"], _projection);
    main.variable(observer("stateData")).define("stateData", ["topojson", "usData", "selectedStateId"], _stateData);
    main.variable(observer("countiesData")).define("countiesData", ["topojson", "usData"], _countiesData);
    main.variable(observer("usData")).define("usData", ["d3"], _usData);
    main.variable(observer("height")).define("height", _height);
    main.variable(observer("width")).define("width", _width);
    main.variable(observer("topojson")).define("topojson", ["require"], _topojson);
    main.variable(observer("d3")).define("d3", ["require"], _d3);
    main.variable(observer()).define(["html"], _14);
    return main;
}
