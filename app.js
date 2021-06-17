// 1-indexed season, day
const NOODLE_OVERRIDES = {
    15: {
        27: 17,
        28: 17,
        99: 4,
        114: 9
    },
    16: {
        99: 11,
        117: 9
    },
    17: {
        99: 9,
        100: 7
    },
    19: {
        2: 11,
        99: 4,
        100: 5,
        117: 7
    },
    20: {
        33: 7
    }
}
const START_SEASON = 14;
const LEVELS = ["0D", "1D", "2D", "3D", "C", "Low A 🦈", "High A 🦈🦈", "AA 🦈🦈🦈", "AAA 🦈🦈🦈🦈", "AAAA 🦈🦈🦈🦈🦈", "AAAAA 🦈🦈🦈🦈🦈🦈"];
const DEN_DENOM = -2768.5;
const DEN_OFF = -1101.7398;
const COLORS = {
    "Breath Mints": "#509e77",
    "Crabs": "#cd7672",
    "Dale": "#8877ee",
    "Firefighters": "#ff4230",
    "Flowers": "#cc66dd",
    "Fridays": "#04a321",
    "Garages": "#3f88fd",
    "Georgias": "#339991",
    "Jazz Hands": "#6b95b1",
    "Lift": "#f032c9",
    "Lovers": "#dd6699",
    "Magic": "#f94965",
    "Mechanics": "#998800",
    "Millennials": "#aa77aa",
    "Moist Talkers": "#009bc2",
    "Pies": "#339991",
    "Shoe Thieves": "#6388c8",
    "Spies": "#9980ba",
    "Steaks": "#b2838d",
    "Sunbeams": "#aa8855",
    "Tacos": "#aa66ee",
    "Tigers": "#f05d14",
    "Wild Wings": "#cc7733",
    "Worms": "#aa8877",
    "Noodle": "#ffbe00"
};
const INITIAL = {
    "Breath Mints": [-0.0002611909339390814, 0.035159414359823414],
    "Crabs": [-0.0003405440309953961, -0.25922015852456726],
    "Dale": [-0.0002434004340347839, -0.08183279080859811],
    "Firefighters": [-0.00034187689577751013, -0.24930040420234464],
    "Flowers": [-0.00031863903252331093, -0.23384998057124712],
    "Fridays": [-0.00037110512327803247, -0.15395481395042748],
    "Garages": [-0.0002571567791968421, -0.11274139367368093],
    "Georgias": [-0.0002458231440869967, -0.15687789166439176],
    "Jazz Hands": [-0.00024832298628328414, -0.07561630779901267],
    "Lift": [-0.000363195481697655, 0.0849832513006682],
    "Lovers": [-0.0002873457779101387, -0.09462693510812244],
    "Magic": [-0.0003155245916212712, -0.1178592833293892],
    "Mechanics": [-0.00023522718209653744, -0.08663387730554489],
    "Millennials": [-0.00039422672488991157, -0.16268527109028783],
    "Moist Talkers": [-0.0003843306140092916, -0.20535754240749637],
    "Pies": [-0.0002932102959131228, -0.1227394643648501],
    "Shoe Thieves": [-0.00030251409338769464, -0.09899229736981541],
    "Spies": [-0.00038780520769920513, -0.3352257889150364],
    "Steaks": [-0.0002629757746327754, -0.1859319425594258],
    "Sunbeams": [-0.0002799631303919763, -0.19026595831454648],
    "Tacos": [-0.00044655564329910844, -0.08070051055014356],
    "Tigers": [-0.00027205557034595265, -0.3448407065679949],
    "Wild Wings": [-0.000370862997157621, -0.13099299527052122],
    "Worms": [-0.00036694589799591876, -0.09945949656350071],
}

async function main() {
    const r = await fetch("data.json", {
        cache: "no-cache"
    });
    const data = await r.json();

    const MAX_SEASON = START_SEASON + data.length - 1;

    for (let season in NOODLE_OVERRIDES) {
        for (let day in NOODLE_OVERRIDES[season]) {
            console.log(`overriding noodle season ${season} day ${day}: ${data[season-START_SEASON].noodles[day-1]} -> ${NOODLE_OVERRIDES[season][day]}`);
            data[season - START_SEASON].noodles[day - 1] = NOODLE_OVERRIDES[season][day];
        }
    }

    const annotations = {};
    for (const [i, level] of LEVELS.entries()) {
        if (i > 0) {
            annotations["line" + i] = {
                type: 'line',
                yMin: 1 - 0.2 * i,
                yMax: 1 - 0.2 * i,
                borderColor: 'rgba(0,0,0,0.5)',
                borderWidth: 1,
                display: true
            };
        }
        annotations["level" + i] = {
            type: 'line',
            yMin: 0.9 - 0.2 * i,
            yMax: 0.9 - 0.2 * i,
            borderColor: "transparent",
            borderWidth: 0,
            display: true,
            label: {
                content: level,
                backgroundColor: 'rgba(0,0,0,0.7)',
                xPadding: 2,
                yPadding: 2,
                cornerRadius: 2,
                position: "start",
                enabled: true,
                font: {
                    size: 12,
                    style: "normal"
                }
            }
        };
    }

    function add_vert(x, label) {
        annotations[label] = {
            type: 'line',
            xMin: x,
            xMax: x,
            borderColor: 'rgba(0,0,0,0.5)',
            borderWidth: 1,
            display: true,
            label: {
                content: label,
                backgroundColor: 'rgba(0,0,0,0.7)',
                position: "end",
                enabled: true,
                xPadding: 2,
                yPadding: 2,
                cornerRadius: 2,
                font: {
                    size: 10,
                    style: "normal"
                }
            }
        };
    }

    const datasets = [];
    let noodles = [];
    for (let d of data) {
        noodles = noodles.concat(d.noodles);
    }
    const labels = [];

    const seasonX = [];
    let x = 0;
    for (const [s, d] of data.entries()) {
        const season = s + START_SEASON;
        add_vert(x, `S${season}`);
        seasonX.push(x);
        for (let i = 1; i <= d.noodles.length; i++) {
            labels.push(`S${season}D${i}`);
        }
        x += d.noodles.length;
    }

    for (let nickname in data[0].teams) {
        let teamPos = [];
        let [eVelocity, imPosition] = INITIAL[nickname];
        for (const [s, d] of data.entries()) {
            const season = s + START_SEASON;
            const xStart = seasonX[s];
            for (const [i, t] of d.teams[nickname].entries()) {
                let level = t.level;
                let noodle = d.noodles[i]
                let eDensity = t.eDensity;
                if (i > 0) {
                    eVelocity = 0.55 * (eVelocity - imPosition + 0.0388 * noodle + (eDensity + DEN_OFF) / DEN_DENOM);
                    imPosition += eVelocity;
                }
                let computedLevel = Math.floor((1 - imPosition) * 5);
                if (level !== undefined && level !== computedLevel) {
                    if (season === 14) {
                        // known anomaly: season 14 is weird
                        // maybe formula changed?
                        annotations[nickname + i] = {
                            type: 'point',
                            xValue: xStart + i,
                            yValue: imPosition,
                            radius: 5,
                            backgroundColor: "#ffff0080"
                        }
                    } else {
                        console.log(`ANOMALY: ${nickname} season ${season} day ${i+1} expected level ${level}, got ${computedLevel}! imPosition: ${imPosition}, noodle: ${noodle}`);
                        annotations[nickname + i] = {
                            type: 'point',
                            xValue: xStart + i,
                            yValue: imPosition,
                            radius: 5,
                            backgroundColor: "#ff000080"
                        }
                    }
                }
                teamPos.push(imPosition);
            }

        }
        datasets.push({
            label: nickname,
            backgroundColor: COLORS[nickname],
            borderColor: COLORS[nickname],
            data: teamPos,
            borderWidth: 2,
            radius: 0,
        });
    }

    const yRanges = [];
    for (let i = 0; i < seasonX.length; i++) {
        // annotations mess with y range, so manually calculate min and max
        let yMin = Infinity;
        let yMax = -Infinity;
        const end = i === seasonX.length - 1 ? noodles.length : seasonX[i + 1];
        for (let j = seasonX[i]; j < end; j++) {
            for (let dataset of datasets) {
                yMin = Math.min(yMin, dataset.data[j]);
                yMax = Math.max(yMax, dataset.data[j]);
            }
        }
        yRanges.push([Math.floor(yMin * 10) / 10, Math.ceil(yMax * 10) / 10]);
    }

    datasets.push({
        label: "Noodle",
        backgroundColor: COLORS["Noodle"],
        borderColor: COLORS["Noodle"],
        data: noodles,
        borderWidth: 1,
        radius: 0,
        yAxisID: 'y2'
    });

    const getOrCreateTooltip = (chart) => {
        let tooltipEl = chart.canvas.parentNode.querySelector('div');

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
            tooltipEl.style.borderRadius = '3px';
            tooltipEl.style.color = 'white';
            tooltipEl.style.opacity = 1;
            tooltipEl.style.pointerEvents = 'none';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.transform = 'translate(10%, 0%)';
            tooltipEl.style.font = "12px 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
            tooltipEl.style.zIndex = 99;

            const table = document.createElement('table');
            table.style.margin = '0px';

            tooltipEl.appendChild(table);
            chart.canvas.parentNode.appendChild(tooltipEl);
        }

        return tooltipEl;
    };

    const externalTooltipHandler = (context) => {
        // Tooltip Element
        const {
            chart,
            tooltip
        } = context;
        const tooltipEl = getOrCreateTooltip(chart);

        // Hide if no tooltip
        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        // Set Text
        const title = tooltip.title[0];
        const bodyLines = tooltip.body.map(b => b.lines);

        const tableHead = document.createElement('thead');

        const tr = document.createElement('tr');
        tr.style.borderWidth = 0;
        const th = document.createElement('th');
        th.style.borderWidth = 0;
        th.colSpan = 3;
        const text = document.createTextNode(title);
        th.appendChild(text);
        tr.appendChild(th);
        tableHead.appendChild(tr);

        const tableBody = document.createElement('tbody');
        const dataPoints = [...tooltip.dataPoints].sort((a, b) => b.raw - a.raw);

        let curLevel = null;

        dataPoints.forEach(dataPoint => {
            const dataset = dataPoint.dataset;
            if (dataset.label === "Noodle") {
                var valueText = dataPoint.raw;
            } else {
                const computedLevel = Math.floor((1 - dataPoint.raw) * 5);
                if (computedLevel !== curLevel) {
                    curLevel = computedLevel;
                    const tr = document.createElement('tr');
                    tr.style.borderWidth = 0;
                    const th = document.createElement('th');
                    th.style.borderWidth = 0;
                    th.colSpan = 3;
                    let levelText = LEVELS[computedLevel];
                    if (levelText === undefined) {
                        levelText = `- (level ${computedLevel})`;
                    }
                    const text = document.createTextNode(levelText);
                    th.appendChild(text);
                    tr.appendChild(th);
                    tableBody.appendChild(th);
                }
                var valueText = dataPoint.raw.toFixed(5);
            }

            const span = document.createElement('span');
            span.style.background = dataset.backgroundColor;
            span.style.borderColor = dataset.borderColor;
            span.style.borderWidth = '2px';
            span.style.marginRight = '10px';
            span.style.height = '10px';
            span.style.width = '10px';
            span.style.display = 'inline-block';

            const tr = document.createElement('tr');
            tr.style.backgroundColor = 'inherit';
            tr.style.borderWidth = 0;

            const td = document.createElement('td');
            td.style.borderWidth = 0;

            const text = document.createTextNode(dataset.label);
            td.appendChild(span);
            td.appendChild(text);
            tr.appendChild(td);

            const td2 = document.createElement('td');
            td2.style.borderWidth = 0;
            td2.style.textAlign = "right";
            td2.appendChild(document.createTextNode(valueText));
            tr.appendChild(td2);
            tableBody.appendChild(tr);
        });

        const tableRoot = tooltipEl.querySelector('table');

        // Remove old children
        while (tableRoot.firstChild) {
            tableRoot.firstChild.remove();
        }

        // Add new children
        tableRoot.appendChild(tableHead);
        tableRoot.appendChild(tableBody);

        const {
            offsetLeft: positionX,
            offsetTop: positionY,
            offsetWidth: width,
            offsetHeight: height
        } = chart.canvas;

        // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.top = (positionY + 20) + 'px';
        tooltipEl.style.padding = tooltip.options.padding + 'px ' + tooltip.options.padding + 'px';
        if (tooltip.caretX < width / 2) {
            tooltipEl.style.transform = "translate(10%, 0%)";
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.right = "";
        } else {
            tooltipEl.style.transform = "translate(-10%, 0%)";
            tooltipEl.style.right = positionX + (width - tooltip.caretX) + 'px';
            tooltipEl.style.left = "";
        }
    };

    var originalLimits = {
        x: {
            min: seasonX[seasonX.length - 1],
            max: noodles.length
        },
        y: {
            min: yRanges[yRanges.length - 1][0],
            max: yRanges[yRanges.length - 1][1]
        }
    };

    function resetZoom() {
        window.chart.options.scales.x.min = originalLimits.x.min;
        window.chart.options.scales.x.max = originalLimits.x.max;
        window.chart.options.scales.y.min = originalLimits.y.min;
        window.chart.options.scales.y.max = originalLimits.y.max;
        window.chart.options.scales.y2.min = 0;
        window.chart.options.scales.y2.max = 20;
        window.chart.update();
    }

    const config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            onClick: (e) => {
                resetZoom();
            },
            animation: false,
            aspectRatio: 2.2,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Day'
                    },
                    grid: {
                        drawOnChartArea: false,
                        borderColor: "black",
                        tickColor: "black"
                    },
                    ticks: {
                        maxRotation: 0
                    },
                    min: seasonX[seasonX.length - 1],
                    max: noodles.length
                },
                y: {
                    title: {
                        display: true,
                        text: 'imPosition'
                    },
                    grid: {
                        drawOnChartArea: false,
                        borderColor: "black",
                        tickColor: "black"
                    },
                    min: yRanges[yRanges.length - 1][0],
                    max: yRanges[yRanges.length - 1][1]
                },
                y2: {
                    title: {
                        display: true,
                        text: 'Noodle'
                    },
                    grid: {
                        drawOnChartArea: false,
                        borderColor: "black",
                        tickColor: "black"
                    },
                    reverse: true,
                    min: 0,
                    max: 20,
                    position: "right"
                },
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        modifierKey: 'ctrl',
                    },
                    zoom: {
                        enabled: true,
                        mode: 'xy',
                        drag: {
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1,
                            backgroundColor: 'rgba(54, 162, 235, 0.3)'
                        }
                    }
                },
                tooltip: {
                    enabled: false,
                    external: externalTooltipHandler
                },
                annotation: {
                    annotations: annotations
                },
                legend: {
                    position: "bottom",
                    labels: {
                        boxWidth: 12
                    },
                    onHover: (e, legendItem, legend) => {
                        const chart = legend.chart;
                        for (let dataset of chart.data.datasets) {
                            if (dataset.label === legendItem.text) {
                                dataset.borderWidth = 3;
                                dataset.backgroundColor = COLORS[dataset.label];
                                dataset.borderColor = COLORS[dataset.label];
                            } else {
                                dataset.borderWidth = 1;
                                dataset.backgroundColor = COLORS[dataset.label] + "40";
                                dataset.borderColor = COLORS[dataset.label] + "40";
                            }
                        }
                        chart.isHovering = true;
                        chart.update();
                    },
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.datasetIndex;
                        const chart = legend.chart;
                        if (chart.isDatasetVisible(index)) {
                            chart.hide(index);
                            legendItem.hidden = true;
                        } else {
                            chart.show(index);
                            legendItem.hidden = false;
                        }
                        const now = Date.now();
                        if (!chart.lastClick || now - chart.lastClick > 500) {
                            chart.lastClick = now;
                        } else {
                            // double-click
                            chart.lastClick = null;
                            for (let i in chart.data.datasets) {
                                if (+i === +index || chart.soloIndex === index) {
                                    chart.getDatasetMeta(i).hidden = false;
                                } else {
                                    chart.getDatasetMeta(i).hidden = true;
                                }
                            }
                            chart.soloIndex = index;
                            chart.update();
                        }
                    }
                }
            }
        }
    };

    window.chart = new Chart(document.getElementById('chart'), config);
    window.chart.isHovering = false;

    function resetLegend() {
        for (let dataset of window.chart.data.datasets) {
            if (dataset.label === "Noodle") {
                dataset.borderWidth = 1;
            } else {
                dataset.borderWidth = 2;
            }
            dataset.backgroundColor = COLORS[dataset.label];
            dataset.borderColor = COLORS[dataset.label];
        }
        window.chart.update();
    }

    window.chart.canvas.addEventListener('mousemove', (e) => {
        if (window.chart.isHovering) {
            if (e.offsetX < window.chart.legend.left || window.chart.legend.right < e.offsetX ||
                e.offsetY < window.chart.legend.top || window.chart.legend.bottom < e.offsetY) {
                window.chart.isHovering = false;
                resetLegend();
            }
        }
    });
    window.chart.canvas.addEventListener('mouseout', (e) => {
        if (window.chart.isHovering) {
            window.chart.isHovering = false;
            resetLegend();
        }
    });

    const slider = document.getElementById('seasons');
    noUiSlider.create(slider, {
        start: [MAX_SEASON, MAX_SEASON],
        step: 1,
        connect: [false, true, false],
        range: {
            'min': START_SEASON,
            'max': MAX_SEASON
        },
        pips: {
            mode: 'steps',
            filter: (value, type) => {
                if (type !== 0) {
                    return 1;
                }
                return type;
            },
            density: 2
        }
    });
    slider.noUiSlider.on('update', function() {
        const vals = slider.noUiSlider.get();
        const s1 = (+vals[0]) - START_SEASON;
        const s2 = (+vals[1]) - START_SEASON;
        originalLimits.x.min = seasonX[s1];
        originalLimits.x.max = s2 === seasonX.length - 1 ? noodles.length : seasonX[s2 + 1];
        let yMin = yRanges[s1][0];
        let yMax = yRanges[s1][1];
        for (var i = s1 + 1; i <= s2; i++) {
            yMin = Math.min(yMin, yRanges[i][0]);
            yMax = Math.max(yMax, yRanges[i][1]);
        }
        originalLimits.y.min = yMin;
        originalLimits.y.max = yMax;
        resetZoom();
    });
    function clickOnPip() {
        var value = Number(this.getAttribute('data-value'));
        slider.noUiSlider.set(value);
    }
    for (let pip of slider.querySelectorAll('.noUi-value')) {
        pip.addEventListener('click', clickOnPip);
    }

    const chartContainer = document.getElementById('chart-container');
    const flippy = document.getElementById('flippy');
    flippy.addEventListener('click', function() {
        chartContainer.classList.toggle('is-flipped');
    });
}

main();
